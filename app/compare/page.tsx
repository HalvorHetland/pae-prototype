"use client";
import { useState, useEffect, useRef } from "react";

type Step = {
  label: string;
  detail: string;
  tokens: number;
  timeMs: number;
  action: boolean;
};

const HUMAN_STEPS: Step[] = [
  { label: "1. Last inn siden", detail: "Hent full HTML, parse DOM, last CSS, JS, bilder", tokens: 3200, timeMs: 2400, action: false },
  { label: "2. Finn datovelger", detail: "Traverser DOM, identifiser kalender-widget", tokens: 1100, timeMs: 800, action: false },
  { label: "3. Klikk innsjekk-dato", detail: "Klikk kalendercelle for 14. juni", tokens: 200, timeMs: 600, action: true },
  { label: "4. Klikk utsjekk-dato", detail: "Klikk kalendercelle for 16. juni", tokens: 200, timeMs: 500, action: true },
  { label: "5. Klikk 'Neste: Gjestinfo'", detail: "Naviger til steg 2 av skjemaet", tokens: 150, timeMs: 400, action: true },
  { label: "6. Fyll inn navn", detail: "Finn input-felt, skriv navn", tokens: 120, timeMs: 700, action: true },
  { label: "7. Fyll inn e-post", detail: "Finn input-felt, skriv e-postadresse", tokens: 120, timeMs: 600, action: true },
  { label: "8. Klikk 'Neste: Tillegg'", detail: "Naviger til steg 3 av skjemaet", tokens: 150, timeMs: 400, action: true },
  { label: "9. Velg tilleggstjenester", detail: "Huk av sengetøy og frokost", tokens: 300, timeMs: 800, action: true },
  { label: "10. Klikk 'Se oppsummering'", detail: "Naviger til steg 4", tokens: 150, timeMs: 350, action: true },
  { label: "11. Les oppsummeringen", detail: "Les og verifiser bookingdetaljer", tokens: 900, timeMs: 600, action: false },
  { label: "12. Klikk 'Book nå'", detail: "Send inn skjemaet", tokens: 100, timeMs: 1200, action: true },
];

const HYBRID_STEPS: Step[] = [
  {
    label: "1. GET /hybrid → leser JSON-LD",
    detail: "Oppdager POST /api/book via Schema.org ReserveAction i <head>",
    tokens: 180,
    timeMs: 300,
    action: false,
  },
  {
    label: "2. POST /api/book",
    detail: "Sender JSON direkte til endepunktet fra manifestet",
    tokens: 140,
    timeMs: 290,
    action: true,
  },
];

const AGENT_STEP = {
  label: "1. POST /api/book",
  detail: 'Sender JSON: { checkIn, checkOut, guests, name, email, addons[] }',
  tokens: 148,
  timeMs: 290,
};

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setValue(current);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { start = start; };
  }, [target, duration, active]);
  return value;
}

function CountUp({ value, duration = 1200, active }: { value: number; duration?: number; active: boolean }) {
  const v = useCountUp(value, duration, active);
  return <>{v.toLocaleString()}</>;
}

const TOTAL_HUMAN = HUMAN_STEPS.reduce((s, x) => s + x.tokens, 0);
const TOTAL_HYBRID = HYBRID_STEPS.reduce((s, x) => s + x.tokens, 0);
const TOTAL_AGENT = AGENT_STEP.tokens;
const CO2 = (t: number) => ((t / 1000) * 0.002).toFixed(t > 1000 ? 3 : 4);

export default function ComparePage() {
  const [humanVisible, setHumanVisible] = useState(0);
  const [hybridVisible, setHybridVisible] = useState(0);
  const [agentVisible, setAgentVisible] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const humanTokens = HUMAN_STEPS.slice(0, humanVisible).reduce((s, x) => s + x.tokens, 0);
  const humanActions = HUMAN_STEPS.slice(0, humanVisible).filter((x) => x.action).length;
  const humanTime = HUMAN_STEPS.slice(0, humanVisible).reduce((s, x) => s + x.timeMs, 0);

  const hybridTokens = HYBRID_STEPS.slice(0, hybridVisible).reduce((s, x) => s + x.tokens, 0);
  const hybridActions = HYBRID_STEPS.slice(0, hybridVisible).filter((x) => x.action).length;

  const agentTokens = agentVisible ? AGENT_STEP.tokens : 0;

  const start = () => {
    if (running) return;
    setRunning(true);
    setDone(false);
    setHumanVisible(0);
    setHybridVisible(0);
    setAgentVisible(false);

    const add = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timersRef.current.push(t);
    };

    // Agent: instant (appears first to emphasise speed)
    add(() => setAgentVisible(true), 400);

    // Hybrid: 2 steps with realistic timing
    add(() => setHybridVisible(1), 420);
    add(() => setHybridVisible(2), 920);

    // Human: 12 steps, 600ms each
    for (let i = 1; i <= HUMAN_STEPS.length; i++) {
      const step = i;
      add(() => setHumanVisible(step), 400 + step * 620);
    }

    // Done when human finishes
    add(() => { setRunning(false); setDone(true); }, 400 + HUMAN_STEPS.length * 620 + 500);
  };

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRunning(false);
    setDone(false);
    setHumanVisible(0);
    setHybridVisible(0);
    setAgentVisible(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-8 text-center">
        <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest">Live Comparison · PAE Demo</span>
        <h1 className="text-3xl font-bold text-white mt-2">Samme oppgave — tre vidt ulike agent-opplevelser</h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm">
          En AI-agent booker samme hytte via tre ulike sider. Se live hvordan PAE (Progressive Agent Enhancement)
          reduserer token-forbruk og CO₂ — uten å endre menneske-opplevelsen.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={start}
            disabled={running}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {running ? "Simulerer…" : done ? "Kjør igjen" : "▶ Start simulering"}
          </button>
          {(humanVisible > 0 || hybridVisible > 0 || agentVisible) && !running && (
            <button onClick={reset} className="text-gray-400 hover:text-white px-4 py-2.5 rounded-lg border border-gray-700 text-sm transition-colors">
              Tilbakestill
            </button>
          )}
        </div>
      </div>

      {/* Three-column comparison */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-5">

        {/* ── HUMAN ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌐</span>
            <h2 className="font-bold text-white text-sm">Agent på menneske-first side</h2>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">/human — tradisjonelt bookingskjema</p>

          <div className="space-y-1 min-h-[360px]">
            {HUMAN_STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex gap-2 items-start px-2.5 py-1.5 rounded-lg transition-all duration-300
                  ${i < humanVisible ? "opacity-100" : "opacity-0"}
                  ${i < humanVisible ? (s.action ? "bg-orange-950/40 border border-orange-900/50" : "bg-gray-800/50") : ""}
                `}
              >
                <span className={`mt-0.5 text-xs px-1 py-0.5 rounded font-mono flex-shrink-0 ${s.action ? "bg-orange-800 text-orange-300" : "bg-gray-700 text-gray-400"}`}>
                  {s.action ? "ACT" : "OBS"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-200 text-xs leading-tight">{s.label}</div>
                  <div className="text-gray-500 text-xs truncate">{s.detail}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-orange-400 text-xs font-mono">+{s.tokens.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-orange-400">
                <CountUp value={humanTokens} active={humanVisible > 0} />
              </div>
              <div className="text-xs text-gray-500">tokens</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-400">
                <CountUp value={humanActions} duration={800} active={humanVisible > 0} />
              </div>
              <div className="text-xs text-gray-500">handlinger</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-400">
                {humanVisible > 0 ? <>{Math.round(humanTime / 1000)}s</> : "0s"}
              </div>
              <div className="text-xs text-gray-500">tid</div>
            </div>
          </div>
        </div>

        {/* ── HYBRID ── */}
        <div className="bg-gray-900 border border-purple-900/50 rounded-xl p-5 relative">
          <div className="absolute top-3 right-3">
            <span className="text-xs font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50">PAE</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✦</span>
            <h2 className="font-bold text-white text-sm">Agent på hybrid-side</h2>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">/hybrid — menneskedesign + agent-lag</p>

          <div className="space-y-2 min-h-[360px]">
            {hybridVisible === 0 && !running && (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm pt-16">
                Start simuleringen for å se hybrid-stien
              </div>
            )}
            {hybridVisible === 0 && running && (
              <div className="h-full flex items-center justify-center text-purple-700 text-sm pt-16 animate-pulse">
                Venter…
              </div>
            )}

            {HYBRID_STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex gap-2 items-start px-3 py-2.5 rounded-lg transition-all duration-500
                  ${i < hybridVisible ? "opacity-100" : "opacity-0"}
                  ${i < hybridVisible ? (s.action ? "bg-purple-950/50 border border-purple-800/50" : "bg-purple-950/20 border border-purple-900/30") : ""}
                `}
              >
                <span className={`mt-0.5 text-xs px-1 py-0.5 rounded font-mono flex-shrink-0 ${s.action ? "bg-purple-800 text-purple-300" : "bg-gray-700 text-gray-400"}`}>
                  {s.action ? "ACT" : "OBS"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-200 text-xs leading-tight">{s.label}</div>
                  <div className="text-gray-400 text-xs">{s.detail}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-purple-400 text-xs font-mono">+{s.tokens}</div>
                </div>
              </div>
            ))}

            {/* Done state for hybrid */}
            <div className={`transition-all duration-500 ${hybridVisible >= 2 ? "opacity-100" : "opacity-0"}`}>
              <div className="mt-3 bg-purple-950/30 border border-purple-800/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-900 text-purple-400 text-xs px-2 py-0.5 rounded font-mono">200 OK</span>
                  <span className="text-gray-400 text-xs">← {AGENT_STEP.timeMs}ms</span>
                </div>
                <pre className="text-xs text-purple-200 font-mono">{`{
  "confirmationId": "HYT-38291",
  "status": "confirmed"
}`}</pre>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mt-2">
                <span>✓</span>
                <span>Booking bekreftet — via agentlaget</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-purple-400">
                <CountUp value={hybridTokens} active={hybridVisible > 0} />
              </div>
              <div className="text-xs text-gray-500">tokens</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">
                <CountUp value={hybridActions} duration={400} active={hybridVisible > 0} />
              </div>
              <div className="text-xs text-gray-500">handlinger</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">
                {hybridVisible >= 2 ? "0.6s" : "0s"}
              </div>
              <div className="text-xs text-gray-500">tid</div>
            </div>
          </div>
        </div>

        {/* ── AGENT ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚡</span>
            <h2 className="font-bold text-white text-sm">Agent på agent-first side</h2>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">/api/book — direkte API</p>

          <div className="min-h-[360px] flex flex-col">
            <div className={`transition-all duration-500 ${agentVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="bg-green-950/40 border border-green-800/50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-800 text-green-300 text-xs px-2 py-0.5 rounded font-mono">POST</span>
                  <code className="text-green-300 text-xs">/api/book</code>
                </div>
                <pre className="text-xs text-green-200 font-mono">{`{
  "checkIn": "2025-06-14",
  "checkOut": "2025-06-16",
  "guests": 2,
  "name": "Halvor Hetland",
  "addons": ["bedding", "breakfast"]
}`}</pre>
              </div>
              <div className="bg-green-950/20 border border-green-900/40 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-900 text-green-400 text-xs px-2 py-0.5 rounded font-mono">200 OK</span>
                  <span className="text-gray-400 text-xs">← {AGENT_STEP.timeMs}ms</span>
                </div>
                <pre className="text-xs text-green-300 font-mono">{`{
  "confirmationId": "HYT-38291",
  "status": "confirmed"
}`}</pre>
              </div>
              <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                <span>✓</span>
                <span>Booking bekreftet</span>
              </div>
            </div>

            {!agentVisible && (
              <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
                {running ? <span className="animate-pulse text-green-900">Klar — venter på at agenten blir ferdig…</span> : "Start simuleringen"}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-green-400">
                <CountUp value={agentTokens} active={agentVisible} />
              </div>
              <div className="text-xs text-gray-500">tokens</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">
                {agentVisible ? "1" : "0"}
              </div>
              <div className="text-xs text-gray-500">handlinger</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">
                {agentVisible ? "0.3s" : "0s"}
              </div>
              <div className="text-xs text-gray-500">tid</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary banner */}
      <div className={`max-w-7xl mx-auto px-4 pb-12 transition-all duration-700 ${done ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-center text-xl font-bold text-white mb-2">Sammenligning — sett fra agentens perspektiv</h2>
          <p className="text-center text-sm text-gray-500 mb-8">Hybrid-siden er nesten like effektiv som agent-first, men uten å endre menneske-opplevelsen.</p>

          {/* 3-column metric table */}
          <div className="grid grid-cols-4 gap-3 mb-8 text-sm">
            {/* Labels */}
            <div className="flex flex-col gap-3">
              <div className="h-12" /> {/* header spacer */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-500 font-mono flex items-center">Tokens</div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-500 font-mono flex items-center">Handlinger</div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-500 font-mono flex items-center">Tid</div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-500 font-mono flex items-center">CO₂ est.</div>
            </div>

            {/* Human */}
            <div className="flex flex-col gap-3">
              <div className="h-12 flex items-center justify-center">
                <span className="text-xs font-mono text-orange-400 bg-orange-950/40 border border-orange-900/50 px-3 py-1.5 rounded-lg">🌐 Menneske-first</span>
              </div>
              <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">{TOTAL_HUMAN.toLocaleString()}</div>
              </div>
              <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">12</div>
              </div>
              <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">~45s</div>
              </div>
              <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">{CO2(TOTAL_HUMAN)}g</div>
              </div>
            </div>

            {/* Hybrid */}
            <div className="flex flex-col gap-3">
              <div className="h-12 flex items-center justify-center">
                <span className="text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-800/50 px-3 py-1.5 rounded-lg">✦ Hybrid · PAE</span>
              </div>
              <div className="bg-purple-950/20 border border-purple-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{TOTAL_HYBRID}</div>
                <div className="text-xs text-purple-600 mt-0.5">–{Math.round((1 - TOTAL_HYBRID / TOTAL_HUMAN) * 100)}% vs human</div>
              </div>
              <div className="bg-purple-950/20 border border-purple-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">2</div>
                <div className="text-xs text-purple-600 mt-0.5">discovery + POST</div>
              </div>
              <div className="bg-purple-950/20 border border-purple-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">~0.6s</div>
              </div>
              <div className="bg-purple-950/20 border border-purple-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{CO2(TOTAL_HYBRID)}g</div>
                <div className="text-xs text-purple-600 mt-0.5">–{Math.round((1 - TOTAL_HYBRID / TOTAL_HUMAN) * 100)}% vs human</div>
              </div>
            </div>

            {/* Agent */}
            <div className="flex flex-col gap-3">
              <div className="h-12 flex items-center justify-center">
                <span className="text-xs font-mono text-green-300 bg-green-950/40 border border-green-900/50 px-3 py-1.5 rounded-lg">⚡ Agent-first</span>
              </div>
              <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{TOTAL_AGENT}</div>
                <div className="text-xs text-green-700 mt-0.5">–{Math.round((1 - TOTAL_AGENT / TOTAL_HUMAN) * 100)}% vs human</div>
              </div>
              <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">1</div>
                <div className="text-xs text-green-700 mt-0.5">direkte POST</div>
              </div>
              <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">~0.3s</div>
              </div>
              <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{CO2(TOTAL_AGENT)}g</div>
                <div className="text-xs text-green-700 mt-0.5">–{Math.round((1 - TOTAL_AGENT / TOTAL_HUMAN) * 100)}% vs human</div>
              </div>
            </div>
          </div>

          {/* Gradient verdict */}
          <div className="rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-3 text-center">
              <div className="bg-orange-950/60 border border-orange-900/40 p-5">
                <div className="text-orange-400 text-xs font-mono uppercase tracking-widest mb-2">Ingen optimalisering</div>
                <div className="text-3xl font-black text-orange-400">{TOTAL_HUMAN.toLocaleString()}</div>
                <div className="text-xs text-orange-600 mt-1">tokens · 12 steg · 45s</div>
              </div>
              <div className="bg-purple-950/60 border border-purple-800/40 p-5 relative">
                <div className="absolute -top-px left-1/2 -translate-x-1/2 text-xs font-mono text-purple-400 bg-purple-900 px-3 py-0.5 rounded-b-md">
                  PAE · beste kompromiss
                </div>
                <div className="text-purple-300 text-xs font-mono uppercase tracking-widest mb-2 mt-3">Hybrid-optimalisering</div>
                <div className="text-3xl font-black text-purple-400">{TOTAL_HYBRID}</div>
                <div className="text-xs text-purple-600 mt-1">tokens · 2 steg · 0.6s</div>
                <div className="text-xs text-white mt-2 font-semibold">
                  Ingen endring i menneskelig UI ✓
                </div>
              </div>
              <div className="bg-green-950/60 border border-green-900/40 p-5">
                <div className="text-green-400 text-xs font-mono uppercase tracking-widest mb-2">Full agent-optimalisering</div>
                <div className="text-3xl font-black text-green-400">{TOTAL_AGENT}</div>
                <div className="text-xs text-green-700 mt-1">tokens · 1 steg · 0.3s</div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-orange-700 via-purple-700 to-green-600" />
          </div>

          {/* Key insight */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-gray-300 text-sm leading-relaxed max-w-3xl mx-auto">
              <strong className="text-white">Konklusjon:</strong> Hybrid-siden (PAE) bruker <strong className="text-purple-400">{Math.round((1 - TOTAL_HYBRID / TOTAL_HUMAN) * 100)}% færre tokens</strong> enn menneske-first —
              nesten like effektiv som agent-first (<strong className="text-green-400">{Math.round((1 - TOTAL_AGENT / TOTAL_HUMAN) * 100)}%</strong> reduksjon) —
              men uten å endre ett eneste piksel i den menneskelige brukeropplevelsen.
              PAE-laget er fullstendig usynlig for mennesker.
            </p>
          </div>

          <div className="mt-5 text-center text-xs text-gray-600">
            CO₂-estimat: ~0,002 g / 1 000 tokens (Patterson et al. 2021) · Token-tall basert på BPE-tokenisering (cl100k_base) · Tider er illustrative
          </div>
        </div>
      </div>
    </div>
  );
}
