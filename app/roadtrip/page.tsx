"use client";
import React from "react";
import { Stage } from "./_animations";
import { T } from "./_video-kit";
import {
  useTweaks, TweaksPanel, TweakSection,
  TweakToggle, TweakRadio, TweakSlider, TweakColor, TweakText,
} from "./_tweaks-panel";
import { RoadtripVideo, RT_HANDOFF } from "./_roadtrip-scenes";

const TWEAK_DEFAULTS = {
  accent: "#F25C2B",
  showIntro: true,
  driveSpeed: 1,
  introBg: "day",
  captions: true,
  tagline: "A guide for the open road",
  ctaText: "Start your free trial",
};

export default function RoadtripPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Drive the brand accent through the whole video
  T.ember = t.accent;
  T.ember300 = `color-mix(in oklab, ${t.accent} 72%, white)`;

  const duration = t.showIntro ? RT_HANDOFF + 10 : 10;

  return (
    <div style={{ position: "relative", height: "calc(100vh - 56px)", background: "#0a0a0a" }}>
      <Stage
        key={t.showIntro ? "with-intro" : "no-intro"}
        width={1080} height={1920}
        duration={duration}
        background="#0E1014"
        persistKey="guidacle-roadtrip"
      >
        <RoadtripVideo t={t} />
      </Stage>

      <TweaksPanel title="Roadtrip Tweaks">
        <TweakSection label="Story" />
        <TweakToggle label="Intro drive scene" value={t.showIntro}
          onChange={(v) => setTweak("showIntro", v)} />
        <TweakRadio label="Time of day" value={t.introBg}
          options={["day", "dusk"]}
          onChange={(v) => setTweak("introBg", v)} />
        <TweakSlider label="Drive speed" value={t.driveSpeed}
          min={0.5} max={2} step={0.1} unit="×"
          onChange={(v) => setTweak("driveSpeed", v)} />
        <TweakToggle label="Captions" value={t.captions}
          onChange={(v) => setTweak("captions", v)} />

        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent}
          options={["#F25C2B", "#2F6FE0", "#16A36B", "#E0367A"]}
          onChange={(v) => setTweak("accent", v)} />

        <TweakSection label="Copy" />
        <TweakText label="Hook tagline" value={t.tagline}
          onChange={(v) => setTweak("tagline", v)} />
        <TweakText label="CTA button" value={t.ctaText}
          onChange={(v) => setTweak("ctaText", v)} />
      </TweaksPanel>
    </div>
  );
}
