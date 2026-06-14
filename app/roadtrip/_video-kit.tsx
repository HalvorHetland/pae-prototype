"use client";
import React from "react";
import { useTime, Sprite, clamp, Easing } from "./_animations";

// ── Theme tokens (mutable so App can override accent at render time) ─────────
export const T: Record<string, string> = {
  bg: "#0E1014",
  surface: "#11141A",
  surface2: "#171A21",
  surface3: "#1F2128",
  border: "#262B35",
  borderSoft: "#1B1F27",
  text: "#F4F1EC",
  text2: "#A3A6AE",
  text3: "#5F6470",
  text4: "#3D3F47",
  ember: "#F25C2B",
  ember300: "#FF8957",
  amber: "#F0C969",
  sage: "#82C29A",
  ui: "'Inter', system-ui, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
};

// ── Generated cover art ───────────────────────────────────────────────────────
export function Cover({
  title = "NP",
  city,
  size = 96,
  radius,
  episode,
}: {
  title?: string;
  city?: string;
  size?: number;
  radius?: number;
  episode?: number;
}) {
  const r = radius != null ? radius : size * 0.14;
  const hash = [...title].reduce(
    (a, c) => (a * 31 + c.charCodeAt(0)) % 360,
    0
  );
  const c1 = `oklch(0.66 0.17 ${hash})`;
  const c2 = `oklch(0.44 0.16 ${(hash + 45) % 360})`;
  const initials = (title.match(/\b[\p{L}]/gu) ?? ["?"]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: r, overflow: "hidden",
      position: "relative", flex: "none",
      background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(0,0,0,0.12)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.20), transparent 60%)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)",
        backgroundSize: `${Math.max(6, size / 9)}px ${Math.max(6, size / 9)}px`,
      }} />
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: T.ui, fontWeight: 900, fontSize: size * 0.36,
        color: "rgba(255,255,255,0.96)", letterSpacing: "-0.04em",
        textShadow: "0 2px 10px rgba(0,0,0,0.32)",
      }}>{initials}</div>
      {city && (
        <div style={{
          position: "absolute", left: size * 0.08, bottom: size * 0.08,
          fontFamily: T.mono, fontWeight: 600, fontSize: Math.max(8, size * 0.085),
          color: "rgba(255,255,255,0.82)", letterSpacing: "0.12em",
        }}>{city}</div>
      )}
      {episode != null && size >= 84 && (
        <div style={{
          position: "absolute", right: size * 0.08, bottom: size * 0.08,
          fontFamily: T.mono, fontWeight: 700, fontSize: Math.max(8, size * 0.085),
          color: "rgba(255,255,255,0.82)",
        }}>EP·{String(episode).padStart(2, "0")}</div>
      )}
    </div>
  );
}

// ── Animated waveform ────────────────────────────────────────────────────────
export function Wave({
  cx, y, totalW, bars = 52, maxH = 120,
  color, dim, progress = null, speed = 3,
}: {
  cx: number; y: number; totalW: number; bars?: number; maxH?: number;
  color?: string; dim?: string; progress?: number | null; speed?: number;
}) {
  const c = color ?? T.ember;
  const d = dim ?? T.border;
  const t = useTime();
  const bw = totalW / bars;
  return (
    <div style={{
      position: "absolute", left: cx - totalW / 2, top: y,
      width: totalW, height: maxH, display: "flex", alignItems: "center", gap: bw * 0.32,
    }}>
      {Array.from({ length: bars }).map((_, i) => {
        const a =
          Math.sin(i * 0.5 + t * speed) * 0.5 +
          Math.sin(i * 0.23 + t * (speed * 0.6)) * 0.5;
        const h = (0.16 + 0.84 * Math.abs(a)) * maxH;
        const on = progress == null ? true : i / bars < progress;
        return (
          <div key={i} style={{
            width: bw * 0.68, height: h, borderRadius: bw,
            background: on ? c : d,
          }} />
        );
      })}
    </div>
  );
}

// ── Entry/exit wrapper ───────────────────────────────────────────────────────
export function FX({
  start, end, x, y, center, rise = 30,
  inDur = 0.5, outDur = 0.4,
  scaleFrom, children,
}: {
  start: number; end: number;
  x?: number | string; y?: number | string;
  center?: boolean; rise?: number;
  inDur?: number; outDur?: number;
  scaleFrom?: number;
  children: React.ReactNode;
}) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const inT = Easing.easeOutCubic(clamp(localTime / inDur, 0, 1));
        const outStart = Math.max(0, duration - outDur);
        let op = inT, ty = (1 - inT) * rise, extra = 1;
        if (scaleFrom != null) extra = scaleFrom + (1 - scaleFrom) * inT;
        if (localTime > outStart) {
          const o = Easing.easeInCubic(clamp((localTime - outStart) / outDur, 0, 1));
          op = 1 - o; ty = -o * 16;
        }
        const tx = center ? "-50%" : "0";
        return (
          <div style={{
            position: "absolute", left: x, top: y,
            transform: `translate(${tx}, ${ty}px) scale(${extra})`,
            transformOrigin: center ? "top center" : "top left",
            opacity: op, willChange: "transform, opacity",
          }}>{children}</div>
        );
      }}
    </Sprite>
  );
}

// ── Atmospheric background ───────────────────────────────────────────────────
export function Backdrop() {
  const t = useTime();
  const gx = 760 + Math.sin(t * 0.4) * 60;
  const gy = 360 + Math.cos(t * 0.32) * 50;
  const gx2 = 280 + Math.cos(t * 0.3) * 50;
  return (
    <>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(620px 620px at ${gx}px ${gy}px, rgba(242,92,43,0.22) 0%, transparent 60%),
                     radial-gradient(560px 560px at ${gx2}px 1480px, rgba(95,155,216,0.12) 0%, transparent 62%)`,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(120% 120% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
        backgroundSize: "4px 4px", opacity: 0.5,
      }} />
    </>
  );
}

// ── Tag / pill helpers ───────────────────────────────────────────────────────
export function Tag({
  children, tone = "ember",
}: {
  children: React.ReactNode; tone?: "ember" | "amber" | "neutral";
}) {
  const tones = {
    ember: { bg: "rgba(242,92,43,0.14)", fg: T.ember300 },
    amber: { bg: "rgba(217,162,63,0.16)", fg: T.amber },
    neutral: { bg: T.surface3, fg: T.text2 },
  };
  const c = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "8px 16px", borderRadius: 999, background: c.bg, color: c.fg,
      fontFamily: T.mono, fontSize: 19, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

export function Dot({
  size = 11, color,
}: {
  size?: number; color?: string;
}) {
  const c = color ?? T.ember;
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", background: c,
      display: "inline-block", boxShadow: `0 0 10px ${c}`,
    }} />
  );
}
