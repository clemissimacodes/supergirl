"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { REGION_LABEL, type Region } from "@/lib/types";

export default function PulseToast() {
  const pulse = useApp((s) => s.pulse);
  const clear = useApp((s) => s.clearPulse);

  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(clear, 3200);
    return () => clearTimeout(t);
  }, [pulse, clear]);

  if (!pulse) return null;
  const regions = Object.entries(pulse.regions)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3)
    .map(([r]) => REGION_LABEL[r as Region]);

  return (
    <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="card animate-pop px-4 py-3 shadow-2xl bg-bg-2/95 max-w-md w-full flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div className="min-w-0">
          <p className="font-semibold text-sm">{pulse.message}</p>
          {regions.length > 0 && <p className="text-xs text-muted truncate">+{regions.join(" · ")}</p>}
        </div>
      </div>
    </div>
  );
}
