"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled,
  type = "button",
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "danger";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  href?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold text-sm transition disabled:opacity-40 disabled:pointer-events-none";
  const styles = {
    primary: "btn-primary",
    ghost: "bg-white/5 hover:bg-white/10 text-ink",
    outline: "border border-white/15 hover:bg-white/5 text-ink",
    danger: "bg-coral/15 text-coral hover:bg-coral/25",
  }[variant];
  if (href) {
    return (
      <Link href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card p-4 ${className}`}>{children}</section>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-ink placeholder:text-muted/60 focus:outline-none focus:border-violet/70 focus:bg-white/10";

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  placeholder,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        className={`${inputClass} ${suffix ? "pr-12" : ""}`}
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{suffix}</span>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  size?: "sm" | "md";
}) {
  return (
    <div className="flex gap-1 rounded-2xl bg-white/5 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-xl transition ${size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${
            o.value === value ? "bg-white text-bg font-semibold shadow" : "text-muted hover:text-ink"
          }`}
        >
          <div>{o.label}</div>
          {o.hint && <div className="text-[10px] opacity-70">{o.hint}</div>}
        </button>
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  unit,
  hide,
}: {
  label: string;
  value: number;
  delta?: number;
  unit?: string;
  hide?: boolean;
}) {
  const sign = delta === undefined ? "" : delta > 0 ? "+" : "";
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">
        {hide ? "••" : value.toFixed(value >= 100 ? 0 : 1)}
        {unit && <span className="ml-0.5 text-xs text-muted">{unit}</span>}
      </div>
      {delta !== undefined && !hide && Math.abs(delta) >= 0.05 && (
        <div className={`text-xs tabular-nums ${delta > 0 ? "text-mint" : "text-coral"}`}>
          {sign}
          {delta.toFixed(1)}
          {unit}
        </div>
      )}
    </div>
  );
}

export function PageTitle({ title, kicker, action }: { title: ReactNode; kicker?: string; action?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 mb-4">
      <div>
        {kicker && <p className="text-xs uppercase tracking-[0.2em] text-muted">{kicker}</p>}
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
      </div>
      {action}
    </header>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
        active ? "bg-white text-bg" : "bg-white/8 text-ink hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}
