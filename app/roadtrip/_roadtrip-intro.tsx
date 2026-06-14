"use client";
import React from "react";
import { useTime, clamp, Easing } from "./_animations";
import { T } from "./_video-kit";

const CARW = 660;
const CAR_CX = 540;
const CAR_TOP = 1300;
const ROAD_Y = 1604;

export const RT_PHONE = { x: CAR_CX - 4, y: CAR_TOP + 232 };

function rt_smooth(a: number, b: number, x: number): number {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
function rt_lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ── Landmark with POI pin ─────────────────────────────────────────────────────
function Landmark({
  baseX, shift, kind, ink, accent, label, dusk,
}: {
  baseX: number; shift: number; kind: string; ink: string; accent: string; label?: string; dusk: boolean;
}) {
  const screenX = baseX + shift;
  const near = clamp(1 - Math.abs(screenX - CAR_CX) / 300, 0, 1);
  const pinPop = rt_smooth(0.25, 0.7, near);
  const pinFill = dusk ? "#2A1A12" : "#FBF5EC";
  const baseY = ROAD_Y - 6;

  let art: React.ReactNode = null;
  if (kind === "church") {
    art = (
      <g>
        <path d="M-70 0 V-150 H70 V0" />
        <path d="M-92 -150 L0 -210 L92 -150 Z" />
        <path d="M-66 -210 L0 -262 L66 -210 Z" />
        <path d="M-44 -262 L0 -304 L44 -262 Z" />
        <path d="M0 -304 V-348" /><circle cx="0" cy="-360" r="11" />
        <path d="M-22 0 V-92 q22 -42 44 0 V0" strokeWidth="7" />
        <path d="M-70 -150 H70 M-92 -150 H92" strokeWidth="6" opacity="0.7" />
      </g>
    );
  } else if (kind === "lighthouse") {
    art = (
      <g>
        <path d="M-46 0 L-30 -210 H30 L46 0 Z" />
        <path d="M-34 -210 H34 V-250 H-34 Z" />
        <path d="M-44 -250 H44" strokeWidth="7" />
        <path d="M-26 -250 V-300 H26 V-250" />
        <path d="M-36 -300 L0 -336 L36 -300 Z" />
        <g strokeWidth="6" opacity="0.8"><path d="M-46 -70 H46 M-44 -140 H44" /></g>
        <path d="M26 -276 L150 -320 M26 -262 L150 -250" strokeWidth="6" opacity={0.35 + 0.45 * near} stroke={accent} />
      </g>
    );
  } else if (kind === "cabins") {
    art = (
      <g>
        <g transform="translate(-78 0)">
          <path d="M-50 0 V-96 H50 V0" />
          <path d="M-66 -96 L0 -150 L66 -96 Z" />
          <rect x="-18" y="-58" width="36" height="58" strokeWidth="6" />
        </g>
        <g transform="translate(74 -8)">
          <path d="M-42 0 V-80 H42 V0" />
          <path d="M-56 -80 L0 -126 L56 -80 Z" />
          <rect x="-14" y="-48" width="28" height="48" strokeWidth="6" />
        </g>
      </g>
    );
  } else {
    art = (
      <g strokeWidth="8">
        <g transform="translate(-46 0)">
          <path d="M0 0 V-44" />
          <path d="M-40 -44 L0 -150 L40 -44 Z" />
          <path d="M-30 -90 L0 -180 L30 -90 Z" />
        </g>
        <g transform="translate(54 6)">
          <path d="M0 0 V-36" />
          <path d="M-32 -36 L0 -120 L32 -36 Z" />
        </g>
      </g>
    );
  }

  const pinTop = kind === "church" ? -372 : kind === "lighthouse" ? -350 : -160;

  return (
    <g transform={`translate(${screenX} ${baseY})`}>
      <g fill="none" stroke={ink} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        {art}
      </g>
      <g transform={`translate(0 ${pinTop}) scale(${0.6 + 0.4 * pinPop})`}
        opacity={pinPop} style={{ transformBox: "fill-box" as React.CSSProperties["transformBox"] }}>
        <path d="M0 0 C -26 -36 -26 -72 0 -72 C 26 -72 26 -36 0 0 Z" fill={accent} />
        <circle cx="0" cy="-52" r="10" fill={pinFill} />
        {label && (
          <g opacity={pinPop}>
            <rect x="-96" y="-118" width="192" height="42" rx="21"
              fill={dusk ? "rgba(30,18,12,0.9)" : "rgba(255,253,248,0.94)"}
              stroke={accent} strokeWidth="2.5" />
            <text x="0" y="-90" textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontWeight="600"
              fontSize="20" letterSpacing="1.5"
              fill={dusk ? "#F2C79A" : accent}>{label}</text>
          </g>
        )}
      </g>
    </g>
  );
}

// ── Car with spinning wheels and dashboard phone ──────────────────────────────
function Car({ localTime, ink, accent, screen }: {
  localTime: number; ink: string; accent: string; screen: number;
}) {
  const bob = Math.sin(localTime * 11) * 4;
  const tilt = Math.sin(localTime * 5.5) * 0.7;
  const wheelRot = localTime * 520;
  const Wheel = ({ cx }: { cx: number }) => (
    <g transform={`translate(${cx} 150)`}>
      <circle r="34" fill="#15181F" stroke={ink} strokeWidth="9" />
      <circle r="13" fill="none" stroke={ink} strokeWidth="6" />
      <g transform={`rotate(${wheelRot})`} stroke={ink} strokeWidth="5" opacity="0.85">
        <path d="M0 -30 V-15 M0 30 V15 M-30 0 H-15 M30 0 H15" />
      </g>
    </g>
  );
  return (
    <svg width={CARW} height={CARW * 0.5} viewBox="0 0 360 180"
      style={{ display: "block", overflow: "visible" }}>
      <g transform={`translate(0 ${bob}) rotate(${tilt} 180 150)`}>
        <path d="M26 150 L26 120 Q28 110 48 106 L120 100 L150 64 Q156 56 172 56 L236 56 Q254 58 268 80 L300 102 L326 110 Q338 114 338 128 L338 150 Z"
          fill={accent} stroke={ink} strokeWidth="9" strokeLinejoin="round" />
        <path d="M138 96 L162 70 Q166 66 176 66 L210 66 L210 96 Z" fill={ink} opacity="0.92" />
        <path d="M222 66 L232 66 Q246 68 256 82 L268 96 L222 96 Z" fill={ink} opacity="0.92" />
        <path d="M216 66 V96" stroke={accent} strokeWidth="5" />
        <circle cx="330" cy="122" r="7" fill="#FFE8C4" stroke={ink} strokeWidth="3" />
        <rect x="22" y="120" width="9" height="14" rx="3" fill="#E05A2B" stroke={ink} strokeWidth="3" />
        <g transform="translate(180 96)">
          <rect x="-15" y="-30" width="30" height="44" rx="6" fill="#0E1014" stroke={ink} strokeWidth="4" transform="rotate(-8)" />
          <g transform="rotate(-8)" opacity={screen}>
            <rect x="-11" y="-26" width="22" height="36" rx="4" fill={accent} opacity="0.2" />
            <circle cx="0" cy="-12" r="6.5" fill={accent} />
            <path d="M-2.2 -15 L4 -12 L-2.2 -9 Z" fill="#fff" />
            <g fill={accent}>
              {[0, 1, 2, 3].map((i) => {
                const h = 3 + 8 * Math.abs(Math.sin(localTime * 7 + i));
                return <rect key={i} x={-9 + i * 5} y={6 - h} width="3" height={h} rx="1.5" />;
              })}
            </g>
          </g>
        </g>
        <Wheel cx={110} />
        <Wheel cx={262} />
      </g>
    </svg>
  );
}

// ── Ping rings when a POI passes ──────────────────────────────────────────────
function PingRings({ localTime, accent, times }: {
  localTime: number; accent: string; times: number[];
}) {
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920"
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {times.map((tm, i) => {
        const dt = localTime - tm;
        if (dt < 0 || dt > 1.1) return null;
        const p = dt / 1.1;
        return (
          <g key={i} opacity={(1 - p) * 0.7}>
            <circle cx={RT_PHONE.x} cy={RT_PHONE.y - 30} r={20 + p * 150}
              fill="none" stroke={accent} strokeWidth={6 * (1 - p)} />
            <circle cx={RT_PHONE.x} cy={RT_PHONE.y - 30} r={20 + p * 90}
              fill="none" stroke={accent} strokeWidth={5 * (1 - p)} opacity="0.7" />
          </g>
        );
      })}
    </svg>
  );
}

// ── Road caption text ─────────────────────────────────────────────────────────
function RoadCaption({ children, accent: isAccent, dusk }: {
  children: React.ReactNode; accent?: boolean; dusk: boolean;
}) {
  return (
    <div style={{
      whiteSpace: "nowrap", fontFamily: T.ui, fontWeight: 800,
      fontSize: 58, letterSpacing: "-0.025em",
      color: isAccent ? T.ember : dusk ? "#F4E9DA" : "#1B2230",
      textShadow: dusk
        ? "0 2px 26px rgba(0,0,0,0.55)"
        : "0 3px 22px rgba(245,250,255,0.9)",
    }}>{children}</div>
  );
}

// ── FX for captions (local, no Sprite context needed) ────────────────────────
function CaptionFX({
  start, end, x, y, center = false, inDur = 0.5, outDur = 0.4, children,
}: {
  start: number; end: number; x: number; y: number;
  center?: boolean; inDur?: number; outDur?: number;
  children: React.ReactNode;
}) {
  const time = useTime();
  if (time < start || time > end) return null;
  const lt = time - start;
  const dur = end - start;
  const inT = Easing.easeOutCubic(clamp(lt / inDur, 0, 1));
  const outStart = Math.max(0, dur - outDur);
  let op = inT, ty = (1 - inT) * 30;
  if (lt > outStart) {
    const o = Easing.easeInCubic(clamp((lt - outStart) / outDur, 0, 1));
    op = 1 - o; ty = -o * 16;
  }
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(${center ? "-50%" : "0"}, ${ty}px)`,
      opacity: op, willChange: "transform, opacity",
    }}>{children}</div>
  );
}

// ── The roadtrip intro scene ──────────────────────────────────────────────────
export function RoadIntro({
  driveSpeed = 1, captions = true, dusk = false, length = 4.8,
}: {
  driveSpeed?: number; captions?: boolean; dusk?: boolean; length?: number;
}) {
  const time = useTime();
  if (time > length + 0.1) return null;
  const lt = time;

  const accent = T.ember;
  const ink = dusk ? "#23262F" : "#222630";
  const lmInk = dusk ? "rgba(58,40,30,0.55)" : "rgba(40,46,58,0.45)";
  const sky1 = dusk ? "#2A2740" : "#CFE6F0";
  const sky2 = dusk ? "#7A5A86" : "#EAF3F2";
  const seaC = dusk ? "#3A4A66" : "#9FC3D6";
  const mtn1 = dusk ? "#4A4566" : "#A9BFC9";
  const mtn2 = dusk ? "#5C5070" : "#C2D2D8";
  const land = dusk ? "#5E4A3A" : "#C9D2B6";
  const roadC = dusk ? "#1E2028" : "#3C4250";

  const SPD = 380 * driveSpeed;
  const midShift = -SPD * lt;
  const mtnShift = -SPD * 0.32 * lt;
  const dashOffset = (lt * SPD * 1.15) % 200;

  const landmarks = [
    { baseX: 1070, kind: "church", label: "STAVKIRKE" },
    { baseX: 1640, kind: "lighthouse", label: "FYRET" },
    { baseX: 2230, kind: "cabins", label: "FISKEVÆR" },
  ];
  const pingTimes = landmarks.map((l) => (l.baseX - 540) / SPD);

  const zoom = clamp((lt - 3.7) / 1.0, 0, 1);
  const zScale = 1 + Easing.easeInCubic(zoom) * 4.2;
  const fade = 1 - rt_smooth(4.0, 4.7, lt);
  const screenOn = rt_smooth(0.2, 0.8, lt);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${zScale})`,
        transformOrigin: `${RT_PHONE.x}px ${RT_PHONE.y}px`,
        willChange: "transform",
      }}>
        {/* sky */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${sky1} 0%, ${sky2} 58%)` }} />
        {/* sun glow */}
        <div style={{
          position: "absolute", top: dusk ? 360 : 220, right: 150,
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${dusk ? "rgba(255,170,120,0.7)" : "rgba(255,250,225,0.9)"} 0%, transparent 70%)`,
        }} />

        {/* mountains */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920"
          style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform={`translate(${mtnShift % 1480} 0)`}>
            {[0, 1480, 2960].map((off) => (
              <g key={off} transform={`translate(${off} 0)`} fill={mtn1} stroke="none">
                <path d="M-100 1280 L160 720 L320 980 L520 600 L760 1080 L980 760 L1240 1280 Z" opacity="0.85" />
                <path d="M260 1280 L520 820 L760 1120 L1040 780 L1300 1280 Z" fill={mtn2} opacity="0.9" />
                <g fill={dusk ? "#C9B6D0" : "#F4F8FA"} opacity="0.9">
                  <path d="M520 600 L478 670 L505 668 L520 690 L535 666 L562 672 Z" />
                  <path d="M160 720 L128 778 L150 774 L160 792 L172 772 L192 778 Z" />
                </g>
              </g>
            ))}
          </g>
        </svg>

        {/* fjord water */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: 1190, height: 240,
          background: `linear-gradient(180deg, ${seaC} 0%, ${dusk ? "#2A3650" : "#B6D3E0"} 100%)`,
          opacity: 0.92,
        }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1196, height: 5, background: "rgba(255,255,255,0.4)" }} />
        <div style={{
          position: "absolute", left: 0, right: 0, top: 1430,
          height: ROAD_Y - 1430 + 6, background: land, opacity: 0.85,
        }} />

        {/* landmarks */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920"
          style={{ position: "absolute", left: 0, top: 0 }}>
          {landmarks.map((l, i) => (
            <Landmark key={i} baseX={l.baseX} shift={midShift}
              kind={l.kind} label={l.label} ink={lmInk} accent={accent} dusk={dusk} />
          ))}
          {[760, 1380, 1920, 2520].map((bx, i) => (
            <Landmark key={"p" + i} baseX={bx} shift={midShift}
              kind="pines" ink={lmInk} accent={accent} dusk={dusk} />
          ))}
        </svg>

        {/* road */}
        <div style={{ position: "absolute", left: 0, right: 0, top: ROAD_Y, bottom: 0, background: roadC }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: ROAD_Y, height: 7, background: dusk ? "#3A3D48" : "#5A6172" }} />

        {/* guardrail */}
        <svg width={1080} height={120} viewBox="0 0 1080 120"
          style={{ position: "absolute", left: 0, top: ROAD_Y - 70 }}>
          <line x1="0" y1="46" x2="1080" y2="46"
            stroke={dusk ? "#555" : "#8A93A0"} strokeWidth="7" />
          <g stroke={dusk ? "#555" : "#8A93A0"} strokeWidth="7">
            {Array.from({ length: 14 }).map((_, i) => {
              const x = ((i * 90 - dashOffset * 0.9) % 1170 + 1170) % 1170 - 45;
              return <line key={i} x1={x} y1="46" x2={x} y2="78" />;
            })}
          </g>
        </svg>

        {/* centre dashes */}
        <svg width={1080} height={60} viewBox="0 0 1080 60"
          style={{ position: "absolute", left: 0, top: ROAD_Y + 150 }}>
          <g stroke={dusk ? "#C9A86B" : "#E8C97A"} strokeWidth="10" strokeLinecap="round">
            {Array.from({ length: 12 }).map((_, i) => {
              const x = ((i * 200 - dashOffset) % 2400 + 2400) % 2400 - 100;
              return <line key={i} x1={x} y1="30" x2={x + 100} y2="30" />;
            })}
          </g>
        </svg>

        {/* car */}
        <div style={{ position: "absolute", left: CAR_CX - CARW / 2, top: CAR_TOP }}>
          <Car localTime={lt} ink={ink} accent={accent} screen={screenOn} />
        </div>

        <PingRings localTime={lt} accent={accent} times={pingTimes} />
      </div>

      {/* captions */}
      {captions && (
        <>
          <CaptionFX start={0.4} end={2.0} x={540} y={300} center inDur={0.45} outDur={0.35}>
            <RoadCaption dusk={dusk}>Miles past the last big city.</RoadCaption>
          </CaptionFX>
          <CaptionFX start={2.1} end={3.8} x={540} y={300} center inDur={0.45} outDur={0.4}>
            <RoadCaption dusk={dusk} accent>Guidacle keeps talking.</RoadCaption>
          </CaptionFX>
        </>
      )}
    </div>
  );
}
