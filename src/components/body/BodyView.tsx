"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { BodyRig } from "./rig";
import { lerpParams, type MeshParams } from "@/lib/mesh-params";
import type { Region } from "@/lib/types";

interface FigureProps {
  params: MeshParams;
  skin: string;
  glow?: Partial<Record<Region, number>>;
  spin?: boolean;
}

function Figure({ params, skin, glow, spin }: FigureProps) {
  const [rig] = useState(() => new BodyRig());
  const pivot = useRef<Group>(null);
  const current = useRef<MeshParams>(params);
  const target = useRef<MeshParams>(params);
  const glowRef = useRef<Partial<Record<Region, number>>>({});
  const glowStart = useRef(0);

  useEffect(() => {
    target.current = params;
  }, [params]);

  useEffect(() => {
    if (glow && Object.keys(glow).length) {
      glowRef.current = glow;
      glowStart.current = performance.now();
    }
  }, [glow]);

  useEffect(() => () => rig.dispose(), [rig]);

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 7);
    current.current = lerpParams(current.current, target.current, k);
    rig.setSkin(skin);
    const age = (performance.now() - glowStart.current) / 1000;
    const pulse = age < 1.6 ? Math.sin(Math.min(1, age / 1.6) * Math.PI) : 0;
    const g: Partial<Record<Region, number>> = {};
    for (const [r, v] of Object.entries(glowRef.current)) g[r as Region] = (v ?? 0) * pulse;
    rig.update(current.current, state.clock.elapsedTime, g);
    if (pivot.current) pivot.current.rotation.y = spin ? Math.sin(state.clock.elapsedTime * 0.35) * 0.35 : 0;
  });

  return (
    <group ref={pivot}>
      <primitive object={rig.group} />
    </group>
  );
}

interface BodyViewProps extends FigureProps {
  className?: string;
  interactive?: boolean;
  /** Camera distance multiplier; 1 frames the whole body. */
  zoom?: number;
}

export default function BodyView({ className, interactive = true, zoom = 1, ...fig }: BodyViewProps) {
  const h = fig.params.height;
  const dist = h * 1.9 * zoom;
  return (
    <div className={className ?? "h-full w-full"}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, h * 0.55, dist], fov: 35, near: 0.05, far: 50 }}
        onCreated={({ camera }) => camera.lookAt(0, h * 0.53, 0)}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <hemisphereLight args={["#ffffff", "#3b2a4a", 0.9]} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#8ab4ff" />
        <directionalLight position={[0, 1, -4]} intensity={0.5} color="#ff9ecf" />
        <Suspense fallback={null}>
          <Figure {...fig} />
          <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={3} blur={2.2} far={1} />
        </Suspense>
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.6}
            maxPolarAngle={Math.PI / 1.8}
            target={[0, h * 0.53, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
