"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";
import { frameFromLandmarks, type FrameEstimate } from "@/lib/photo";
import type { Sex } from "@/lib/types";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

type Status = "idle" | "loading" | "camera" | "analysing" | "done" | "error";

interface Props {
  sex: Sex;
  onResult: (estimate: FrameEstimate) => void;
  onSkip: () => void;
}

/**
 * Guided front-photo capture. Everything runs on-device: the frame is drawn to
 * a canvas, pose landmarks are extracted, and the pixels are discarded.
 */
export default function PhotoCapture({ sex, onResult, onSkip }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<import("@mediapipe/tasks-vision").PoseLandmarker | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FrameEstimate | null>(null);

  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function ensureLandmarker() {
    if (landmarkerRef.current) return landmarkerRef.current;
    const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
    const files = await FilesetResolver.forVisionTasks(WASM_URL);
    const lm = await PoseLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: "IMAGE",
      numPoses: 1,
    });
    landmarkerRef.current = lm;
    return lm;
  }

  async function startCamera() {
    setStatus("loading");
    setError(null);
    try {
      const [stream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } }, audio: false }),
        ensureLandmarker(),
      ]);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("camera");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the camera.");
      setStatus("error");
    }
  }

  async function analyse(source: HTMLVideoElement | HTMLImageElement, width: number, height: number) {
    setStatus("analysing");
    try {
      const lm = await ensureLandmarker();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(source, 0, 0, width, height);
      const res = lm.detect(canvas);
      const pose = res.landmarks[0];
      if (!pose) throw new Error("No one detected. Step back so your whole body is in frame.");
      const pts = pose.map((p) => ({ x: p.x * width, y: p.y * height, visibility: p.visibility }));
      const est = frameFromLandmarks(pts, sex);
      if (!est) throw new Error("Couldn't see shoulders, hips and ankles clearly. Try more light and a plain background.");
      setResult(est);
      setStatus("done");
      stopCamera();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setStatus("error");
    }
  }

  function capture() {
    const v = videoRef.current;
    if (!v) return;
    void analyse(v, v.videoWidth, v.videoHeight);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      void analyse(img, img.naturalWidth, img.naturalHeight).finally(() => URL.revokeObjectURL(url));
    };
    img.onerror = () => {
      setError("Couldn't read that image.");
      setStatus("error");
    };
    img.src = url;
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-black/50 border border-white/10">
        <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${status === "camera" ? "" : "hidden"}`} />
        {status === "camera" && <Guide />}
        {status !== "camera" && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            {status === "idle" && (
              <div>
                <div className="text-5xl mb-3">📸</div>
                <p className="font-semibold">One front photo</p>
                <p className="text-sm text-muted mt-1">
                  Tight clothing or underwear, plain background, whole body in frame, arms slightly away from your sides.
                </p>
              </div>
            )}
            {(status === "loading" || status === "analysing") && (
              <div className="animate-float">
                <div className="text-4xl">✦</div>
                <p className="text-sm text-muted mt-2">{status === "loading" ? "Loading the on-device model…" : "Reading your proportions…"}</p>
              </div>
            )}
            {status === "done" && result && (
              <div className="animate-pop">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-semibold">Got it</p>
                <ul className="text-sm text-muted mt-1 space-y-0.5">
                  {result.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted mt-3">Photo discarded. Only 4 ratios were kept.</p>
              </div>
            )}
            {status === "error" && (
              <div>
                <div className="text-4xl mb-2">🙈</div>
                <p className="text-sm text-coral">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted text-center">
        Processed entirely on your device. The photo is never uploaded or stored.
      </p>

      {status === "camera" ? (
        <Button onClick={capture} className="w-full">
          Capture
        </Button>
      ) : status === "done" && result ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => { setResult(null); setStatus("idle"); }}>
            Retake
          </Button>
          <Button onClick={() => onResult(result)}>Use this</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={startCamera} disabled={status === "loading" || status === "analysing"}>
            Open camera
          </Button>
          <label className="inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold cursor-pointer">
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>
      )}

      <button type="button" onClick={onSkip} className="w-full text-sm text-muted hover:text-ink py-2">
        Skip, I&apos;ll use sliders instead
      </button>
    </div>
  );
}

function Guide() {
  return (
    <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full pointer-events-none opacity-70">
      <g fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 6">
        <circle cx="150" cy="52" r="22" />
        <path d="M110 90 h80 l14 110 h-14 v130 h-22 v-100 h-36 v100 h-22 v-130 h-14z" />
      </g>
      <text x="150" y="385" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="sans-serif">
        Stand inside the outline
      </text>
    </svg>
  );
}
