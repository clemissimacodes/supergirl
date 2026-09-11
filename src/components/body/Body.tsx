"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { meshParams } from "@/lib/mesh-params";
import { useApp } from "@/lib/store";
import type { BodyState, Frame, Profile, Region } from "@/lib/types";

const BodyView = dynamic(() => import("./BodyView"), {
  ssr: false,
  loading: () => <div className="w-full h-full grid place-items-center text-muted text-xs">Loading body…</div>,
});

interface Props {
  body: BodyState;
  heat?: Record<Region, number> | null;
  glow?: Partial<Record<Region, number>>;
  className?: string;
  interactive?: boolean;
  zoom?: number;
  spin?: boolean;
  /** Override the stored profile/frame (used during onboarding before anything is saved). */
  profile?: Profile;
  frame?: Frame;
  skin?: string;
}

/** A 3D body driven by a BodyState and the current profile/frame. */
export default function Body({ body, heat = null, glow, className, interactive, zoom, spin, profile, frame, skin }: Props) {
  const storeProfile = useApp((s) => s.profile);
  const storeFrame = useApp((s) => s.frame);
  const storeSkin = useApp((s) => s.skinTone);
  const p = profile ?? storeProfile;
  const f = frame ?? storeFrame;
  const params = useMemo(() => (p ? meshParams(body, p, f, heat) : null), [body, p, f, heat]);
  if (!params) return null;
  return (
    <BodyView params={params} skin={skin ?? storeSkin} glow={glow} className={className} interactive={interactive} zoom={zoom} spin={spin} />
  );
}
