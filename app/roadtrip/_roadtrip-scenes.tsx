"use client";
import React from "react";
import {
  Sprite, clamp, Easing, useTime, useTimeline, TimelineContext,
} from "./_animations";
import { T, Cover, Wave, FX, Backdrop, Tag, Dot } from "./_video-kit";
import { RoadIntro } from "./_roadtrip-intro";

export const RT_INTRO_LEN = 4.8;
export const RT_HANDOFF = 4.5;
export const RCX = 540;

export const RT_CFG = {
  cta: "Start your free trial",
  tagline: "A guide for the open road",
};

// ── SCENE 1 · HOOK (0 – 3.0s) ────────────────────────────────────────────────
function RoadHook() {
  return (
    <>
      <FX start={0.15} end={3.0} x={RCX} y={700} center inDur={0.5}>
        <Tag tone="ember"><Dot /> {RT_CFG.tagline}</Tag>
      </FX>

      <FX start={0.32} end={3.0} x={RCX} y={792} center rise={42} inDur={0.6}>
        <div style={{
          width: 1040, whiteSpace: "nowrap", fontFamily: T.ui, fontWeight: 900,
          fontSize: 128, lineHeight: 0.98, letterSpacing: "-0.045em",
          color: T.text, textAlign: "center",
        }}>Every mile</div>
      </FX>

      <FX start={0.52} end={3.0} x={RCX} y={928} center rise={42} inDur={0.65}>
        <div style={{
          width: 1040, whiteSpace: "nowrap", fontFamily: T.ui, fontWeight: 900,
          fontSize: 128, lineHeight: 0.98, letterSpacing: "-0.045em",
          color: T.text, textAlign: "center",
        }}>
          is an{" "}
          <span style={{
            fontFamily: T.serif, fontStyle: "italic", fontWeight: 400,
            color: T.ember, letterSpacing: "-0.03em",
          }}>episode.</span>
        </div>
      </FX>

      <Sprite start={0.9} end={3.0}>
        {({ localTime, duration }) => {
          const op = clamp(Math.min(localTime / 0.5, (duration - localTime) / 0.4), 0, 1);
          return (
            <div style={{ position: "absolute", inset: 0, opacity: op }}>
              <Wave cx={RCX} y={1150} totalW={680} bars={46} maxH={130} />
            </div>
          );
        }}
      </Sprite>
    </>
  );
}

// ── SCENE 2 · CAR-MODE PRODUCT (2.9 – 6.0s) ──────────────────────────────────
function RouteStop({
  name, kind, dist, dur, state,
}: {
  name: string; kind: string; dist: string; dur: string; state?: "playing" | "next";
}) {
  const playing = state === "playing", next = state === "next";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18, padding: "17px 4px",
      borderTop: `1px solid ${T.borderSoft}`,
    }}>
      <div style={{ position: "relative", flex: "none", width: 86, display: "flex", justifyContent: "center" }}>
        <Cover title={name} city="N" size={86} radius={14} episode={1} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.mono, fontWeight: 600, fontSize: 17, letterSpacing: "0.1em",
          textTransform: "uppercase", color: playing ? T.ember : T.text3,
          marginBottom: 5, display: "flex", alignItems: "center", gap: 8,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {dist}
          {playing && <><Dot size={8} /> <span style={{ color: T.ember }}>Now playing</span></>}
          {next && <span style={{ color: T.amber }}>· Warming up</span>}
        </div>
        <div style={{
          fontFamily: T.ui, fontWeight: 600, fontSize: 26, color: T.text,
          letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{name}</div>
        <div style={{ fontFamily: T.ui, fontSize: 19, color: T.text3, marginTop: 3 }}>
          {kind} · {dur}
        </div>
      </div>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", flex: "none",
        background: playing ? T.ember : "transparent",
        border: playing ? "none" : `2px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: playing ? "0 6px 22px rgba(242,92,43,0.5)" : "none",
      }}>
        {playing
          ? <svg width="20" height="20" viewBox="0 0 24 24">
              <rect x="7" y="5" width="3.5" height="14" rx="0.6" fill="#fff"/>
              <rect x="13.5" y="5" width="3.5" height="14" rx="0.6" fill="#fff"/>
            </svg>
          : <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M7 4.5v15l13-7.5z" fill={T.text}/>
            </svg>}
      </div>
    </div>
  );
}

function CarModePhone() {
  return (
    <div style={{
      width: 720, height: 1330,
      background: "linear-gradient(180deg, #12151c 0%, #0d1015 100%)",
      border: `1.5px solid ${T.border}`, borderRadius: 68, padding: "34px 30px",
      boxShadow: "0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)",
        width: 150, height: 30, background: "#000", borderRadius: 999,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
        <span style={{ fontFamily: T.ui, fontWeight: 700, fontSize: 22, color: T.text }}>10:18</span>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: T.text, fontSize: 15 }}>
          <span>●●●</span>
          <span style={{ display: "inline-block", width: 34, height: 16, border: `2px solid ${T.text}`, borderRadius: 4, position: "relative" }}>
            <span style={{ position: "absolute", inset: 2, right: "auto", width: "64%", background: T.text, borderRadius: 1 }} />
          </span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%", background: T.surface3,
          border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 9, padding: "9px 18px",
          borderRadius: 999, background: "rgba(242,92,43,0.16)", color: T.ember300,
          fontFamily: T.mono, fontSize: 18, fontWeight: 600, letterSpacing: "0.12em",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17h14M5 17l1.5-5h11L19 17M5 17v3M19 17v3M7 12l1-4h8l1 4"/>
            <circle cx="8" cy="17" r="1.4" fill="currentColor"/>
            <circle cx="16" cy="17" r="1.4" fill="currentColor"/>
          </svg>
          CAR MODE
        </span>
        <Tag tone="amber">✦ AI</Tag>
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: T.mono, fontSize: 17, color: T.ember, letterSpacing: "0.12em", fontWeight: 600 }}>
          ◎ E16 · NÆRØYFJORD, NORWAY
        </div>
        <div style={{ fontFamily: T.ui, fontWeight: 800, fontSize: 46, color: T.text, letterSpacing: "-0.03em", marginTop: 10 }}>
          On your route
        </div>
      </div>

      <div style={{
        marginTop: 24, padding: 24, borderRadius: 22,
        background: `radial-gradient(120% 100% at 0% 0%, rgba(242,92,43,0.20) 0%, transparent 52%), ${T.surface2}`,
        border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Cover title="Borgund Stave Church" city="NOR" size={120} radius={18} episode={1} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 13px",
              borderRadius: 999, background: "rgba(242,92,43,0.16)", color: T.ember300,
              fontFamily: T.mono, fontSize: 15, fontWeight: 600, letterSpacing: "0.1em",
            }}><Dot size={8} /> NOW PLAYING</span>
            <div style={{ fontFamily: T.ui, fontWeight: 700, fontSize: 30, color: T.text, letterSpacing: "-0.015em", marginTop: 12, lineHeight: 1.1 }}>
              Borgund Stave Church
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 19, color: T.text2, marginTop: 4 }}>
              900-year-old timber church · 600 m ahead
            </div>
          </div>
        </div>
        <div style={{ position: "relative", height: 70, marginTop: 18 }}>
          <Wave cx={306} y={6} totalW={560} bars={40} maxH={58} progress={0.32} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 16, color: T.text3, letterSpacing: "0.06em" }}>
          <span>0:48</span><span>−2:32</span>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <RouteStop name="Stalheim Viewpoint" kind="Hairpin road & gorge" dist="4.2 KM AHEAD" dur="2:10" state="next" />
        <RouteStop name="Flåm Railway" kind="Mountain railway" dist="11 KM AHEAD" dur="3:30" />
      </div>
    </div>
  );
}

function RoadProduct() {
  return (
    <>
      <FX start={2.95} end={6.0} x={RCX} y={148} center inDur={0.45}>
        <div style={{
          width: 940, whiteSpace: "nowrap", fontFamily: T.ui, fontWeight: 800,
          fontSize: 52, color: T.text, letterSpacing: "-0.03em", textAlign: "center",
        }}>
          Hands on the wheel. <span style={{ color: T.ember }}>Ears open.</span>
        </div>
      </FX>

      <Sprite start={3.0} end={6.0}>
        {({ localTime, duration }) => {
          const inT = Easing.easeOutCubic(clamp(localTime / 0.7, 0, 1));
          const outT = Easing.easeInCubic(clamp((localTime - (duration - 0.4)) / 0.4, 0, 1));
          const op = clamp(Math.min(localTime / 0.5, (duration - localTime) / 0.4), 0, 1);
          const float = Math.sin(localTime * 1.1) * 6;
          const ty = (1 - inT) * 80 - outT * 30 + float;
          const sc = 0.92 + 0.08 * inT;
          return (
            <div style={{
              position: "absolute", left: RCX, top: 250,
              transform: `translateX(-50%) translateY(${ty}px) scale(${sc})`,
              transformOrigin: "top center", opacity: op,
            }}>
              <CarModePhone />
            </div>
          );
        }}
      </Sprite>

      <FX start={3.1} end={6.0} x={RCX} y={1658} center inDur={0.5}>
        <div style={{
          width: 820, fontFamily: T.ui, fontWeight: 600, fontSize: 40,
          color: T.text2, letterSpacing: "-0.02em", textAlign: "center", lineHeight: 1.25,
        }}>
          It tells you what&apos;s coming —{" "}
          <span style={{ color: T.text }}>before you pass it.</span>
        </div>
      </FX>
    </>
  );
}

// ── SCENE 3 · "EVERYWHERE" MONTAGE (5.9 – 8.0s) ──────────────────────────────
const RT_MONTAGE = [
  { title: "Geirangerfjord", city: "FJORD", ep: 1 },
  { title: "Lofoten Islands", city: "COAST", ep: 1 },
  { title: "Trollstigen Pass", city: "ROAD", ep: 1 },
  { title: "Reine Village", city: "VILLAGE", ep: 1 },
  { title: "Atlantic Road", city: "DRIVE", ep: 1 },
  { title: "Senja Island", city: "NORTH", ep: 1 },
  { title: "Flåm Valley", city: "VALLEY", ep: 2 },
  { title: "Preikestolen", city: "CLIFF", ep: 1 },
];

function RoadStrip({
  y, size, gap, speed, offset = 0,
}: {
  y: number; size: number; gap: number; speed: number; offset?: number;
}) {
  const t = useTime();
  const cell = size + gap;
  const span = RT_MONTAGE.length * cell;
  let shift = ((t - 5.9) * speed + offset) % span;
  if (shift < 0) shift += span;
  const loop = [...RT_MONTAGE, ...RT_MONTAGE, ...RT_MONTAGE];
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: size + 60, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -cell + (-shift), top: 0, display: "flex", gap }}>
        {loop.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: size }}>
            <Cover title={m.title} city={m.city} size={size} radius={size * 0.13} episode={m.ep} />
            <span style={{ fontFamily: T.mono, fontSize: 15, color: T.text3, letterSpacing: "0.1em", fontWeight: 600, whiteSpace: "nowrap" }}>
              {m.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadCities() {
  return (
    <>
      <FX start={5.95} end={8.0} x={RCX} y={420} center inDur={0.5}>
        <div style={{
          fontFamily: T.mono, fontSize: 20, color: T.ember, letterSpacing: "0.16em",
          fontWeight: 600, textAlign: "center", whiteSpace: "nowrap",
        }}>NOT JUST 50 BIG CITIES</div>
      </FX>
      <FX start={6.1} end={8.0} x={RCX} y={478} center rise={36} inDur={0.6}>
        <div style={{
          width: 1040, whiteSpace: "nowrap", fontFamily: T.ui, fontWeight: 900,
          fontSize: 104, color: T.text, letterSpacing: "-0.045em", lineHeight: 1.02, textAlign: "center",
        }}>
          A guide for<br />
          <span style={{ fontFamily: T.serif, fontStyle: "italic", fontWeight: 400, color: T.ember }}>everywhere.</span>
        </div>
      </FX>

      <Sprite start={6.0} end={8.0}>
        {({ localTime, duration }) => {
          const op = clamp(Math.min(localTime / 0.5, (duration - localTime) / 0.4), 0, 1);
          return (
            <div style={{ position: "absolute", inset: 0, opacity: op }}>
              <RoadStrip y={900} size={250} gap={30} speed={90} />
              <RoadStrip y={1260} size={190} gap={26} speed={-64} offset={120} />
            </div>
          );
        }}
      </Sprite>
    </>
  );
}

// ── SCENE 4 · CTA (7.9 – 10s) ────────────────────────────────────────────────
function RoadCTA() {
  return (
    <>
      <FX start={7.95} end={10} x={RCX} y={700} center rise={40} inDur={0.6} scaleFrom={0.86}>
        <div style={{
          width: 1040, whiteSpace: "nowrap", textAlign: "center",
          fontFamily: T.ui, fontWeight: 800, fontSize: 132, color: T.text,
          letterSpacing: "-0.04em", lineHeight: 1,
        }}>
          <span style={{ fontFamily: T.serif, fontStyle: "italic", fontWeight: 400, color: T.ember }}>g</span>uidacle
        </div>
      </FX>

      <FX start={8.2} end={10} x={RCX} y={878} center inDur={0.5}>
        <div style={{ fontFamily: T.mono, fontSize: 22, color: T.text2, letterSpacing: "0.18em", fontWeight: 500 }}>
          EVERY PLACE IS AN EPISODE
        </div>
      </FX>

      <Sprite start={8.4} end={10}>
        {({ localTime, duration }) => {
          const inT = Easing.easeOutBack(clamp(localTime / 0.55, 0, 1));
          const op = clamp(Math.min(localTime / 0.4, (duration - localTime) / 0.4), 0, 1);
          const pulse = 0.5 + 0.5 * Math.sin(localTime * 3.2);
          return (
            <div style={{
              position: "absolute", left: RCX, top: 1020,
              transform: `translateX(-50%) scale(${0.8 + 0.2 * inT})`, opacity: op,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 18,
                padding: "30px 54px", borderRadius: 999,
                background: T.ember, color: "#fff",
                fontFamily: T.ui, fontWeight: 700, fontSize: 42, letterSpacing: "-0.01em",
                boxShadow: `0 12px ${30 + pulse * 26}px rgba(242,92,43,${0.45 + pulse * 0.3})`,
                whiteSpace: "nowrap",
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24">
                  <path d="M7 4.5v15l13-7.5z" fill="#fff"/>
                </svg>
                {RT_CFG.cta}
              </div>
            </div>
          );
        }}
      </Sprite>

      <FX start={8.7} end={10} x={RCX} y={1162} center inDur={0.5}>
        <div style={{ fontFamily: T.mono, fontSize: 21, color: T.text3, letterSpacing: "0.12em", fontWeight: 500 }}>
          DRIVE · BIKE · WALK — IN YOUR LANGUAGE
        </div>
      </FX>

      <Sprite start={8.0} end={10}>
        {({ localTime, duration }) => {
          const op = clamp(Math.min(localTime / 0.6, (duration - localTime) / 0.5), 0, 1) * 0.7;
          return (
            <div style={{ position: "absolute", inset: 0, opacity: op }}>
              <Wave cx={RCX} y={1330} totalW={620} bars={44} maxH={90}
                color={T.ember} dim={T.surface3} speed={2.4} />
            </div>
          );
        }}
      </Sprite>
    </>
  );
}

// ── Clock label for scrubbing ─────────────────────────────────────────────────
function RoadClockLabel() {
  const t = useTime();
  React.useEffect(() => {
    const el = document.getElementById("road-video-root");
    if (el) el.setAttribute("data-screen-label", `Roadtrip @ ${Math.floor(t)}s`);
  }, [Math.floor(t)]);
  return null;
}

// ── Root component ────────────────────────────────────────────────────────────
export function RoadtripVideo({
  t: tweaks = {},
}: {
  t?: {
    showIntro?: boolean; ctaText?: string; tagline?: string;
    driveSpeed?: number; captions?: boolean; introBg?: string; accent?: string;
  };
}) {
  const tl = useTimeline();
  const showIntro = tweaks.showIntro !== false;
  RT_CFG.cta = tweaks.ctaText ?? "Start your free trial";
  RT_CFG.tagline = tweaks.tagline ?? "A guide for the open road";

  React.useEffect(() => {
    (window as Window & { __seekRoadtrip?: (s: number) => void }).__seekRoadtrip = (sec: number) => {
      if (tl.setPlaying) tl.setPlaying(false);
      if (tl.setTime) tl.setTime(sec);
    };
  }, [tl]);

  const base = showIntro ? RT_HANDOFF : 0;
  const adCtx = { ...tl, time: tl.time - base };

  return (
    <div id="road-video-root" style={{ position: "absolute", inset: 0 }}>
      <Backdrop />
      <RoadClockLabel />
      <TimelineContext.Provider value={adCtx}>
        <RoadHook />
        <RoadProduct />
        <RoadCities />
        <RoadCTA />
      </TimelineContext.Provider>
      {showIntro && (
        <RoadIntro
          driveSpeed={tweaks.driveSpeed ?? 1}
          captions={tweaks.captions !== false}
          dusk={tweaks.introBg === "dusk"}
          length={RT_INTRO_LEN}
        />
      )}
    </div>
  );
}
