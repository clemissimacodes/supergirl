"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/lib/hooks";
import { useApp } from "@/lib/store";
import PulseToast from "./PulseToast";

const NAV = [
  { href: "/", label: "You", icon: "✦" },
  { href: "/log", label: "Log", icon: "＋" },
  { href: "/plans", label: "Plans", icon: "◫" },
  { href: "/explore", label: "Body", icon: "◉" },
  { href: "/checkin", label: "Check-in", icon: "◔" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const onboarded = useApp((s) => s.onboarded);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!onboarded && pathname !== "/onboarding") router.replace("/onboarding");
    if (onboarded && pathname === "/onboarding") router.replace("/");
  }, [hydrated, onboarded, pathname, router]);

  if (!hydrated) {
    return (
      <main className="flex-1 grid place-items-center">
        <div className="text-center animate-float">
          <div className="text-5xl">✦</div>
          <p className="mt-3 text-muted text-sm">Warming up…</p>
        </div>
      </main>
    );
  }

  const showNav = onboarded && pathname !== "/onboarding";

  return (
    <div className="mx-auto w-full max-w-md flex-1 flex flex-col min-h-dvh relative">
      <main className={`flex-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] ${showNav ? "pb-28" : "pb-8"}`}>{children}</main>
      <PulseToast />
      {showNav && (
        <nav className="fixed bottom-0 inset-x-0 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-3">
          <div className="mx-auto max-w-md card flex justify-between px-2 py-1.5 shadow-2xl shadow-black/40 bg-bg-2/90">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] transition ${
                    active ? "text-white bg-white/10" : "text-muted hover:text-white"
                  }`}
                >
                  <span className="text-lg leading-none">{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
