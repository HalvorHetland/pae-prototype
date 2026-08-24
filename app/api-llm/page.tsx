"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HEAVY_JSON,
  FLAT_JSON,
  AGENT_YAML,
  AGENT_TSV,
  TASK_ANSWER,
} from "@/lib/apiPayloads";

// Samme CO₂-tilnærming som /compare — én felles formel i hele prototypen.
const co2g = (tokens: number) => (tokens / 1000) * 0.002;
const fmtCo2 = (tokens: number) =>
  co2g(tokens).toFixed(tokens > 1000 ? 3 : 4);

type Counts = { heavy: number; flat: number; yaml: number; tsv: number; task: number };

/** Teller tokens LIVE i nettleseren med js-tiktoken (cl100k_base) — samme
 *  encoder som measure-tokens.ts. Ingen hardkodede tall som kan bli stale. */
function useTokenCounts(): Counts | null {
  const [counts, setCounts] = useState<Counts | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("js-tiktoken").then(({ getEncoding }) => {
      if (cancelled) return;
      const enc = getEncoding("cl100k_base");
      setCounts({
        heavy: enc.encode(HEAVY_JSON).length,
        flat: enc.encode(FLAT_JSON).length,
        yaml: enc.encode(AGENT_YAML).length,
        tsv: enc.encode(AGENT_TSV).length,
        task: enc.encode(TASK_ANSWER).length,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return counts;
}

function StatRow({
  tokens,
  heavy,
  color,
}: {
  tokens: number | undefined;
  heavy: number | undefined;
  color: string;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
      <div>
        <div className={`text-xl font-bold ${color}`}>
          {tokens != null ? tokens.toLocaleString() : "…"}
        </div>
        <div className="text-xs text-gray-500">tokens</div>
      </div>
      <div>
        <div className={`text-xl font-bold ${color}`}>
          {tokens != null && heavy ? `${Math.round((tokens / heavy) * 100)}%` : "…"}
        </div>
        <div className="text-xs text-gray-500">av tung JSON</div>
      </div>
      <div>
        <div className={`text-xl font-bold ${color}`}>
          {tokens != null ? fmtCo2(tokens) : "…"}
        </div>
        <div className="text-xs text-gray-500">g CO₂ / kall</div>
      </div>
    </div>
  );
}

export default function ApiLlmPage() {
  const counts = useTokenCounts();
  const [agentFormat, setAgentFormat] = useState<"yaml" | "tsv">("yaml");

  const agentTokens =
    counts == null ? undefined : agentFormat === "yaml" ? counts.yaml : counts.tsv;
  const agentPayload = agentFormat === "yaml" ? AGENT_YAML : AGENT_TSV;

  const saved =
    counts != null ? Math.round((1 - counts.yaml / counts.heavy) * 100) : null;

  const SCALES = [
    { label: "1 kall", n: 1 },
    { label: "10 000 kall / dag", n: 10_000 },
    { label: "1 mill. kall", n: 1_000_000 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-8 text-center">
        <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest">
          Datalaget · PAE Demo
        </span>
        <h1 className="text-3xl font-bold text-white mt-2">
          Samme data — fire API-formater
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm">
          <Link href="/compare" className="text-indigo-400 hover:underline">/compare</Link>{" "}
          viser hva <em>interaksjonen</em> koster. Denne siden viser hva{" "}
          <em>payloaden</em> koster: et API kan være maskinvennlig i transport og
          likevel dyrt i form. Alle fire svar under inneholder nøyaktig samme
          fakta om hytta — tokens telles live i nettleseren din med js-tiktoken
          (cl100k_base).
        </p>
      </div>

      {/* Three-column comparison */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-5">
        {/* ── HEAVY ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏢</span>
            <h2 className="font-bold text-white text-sm">Tradisjonell API-respons</h2>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">
            enterprise-REST — konvolutt, HAL-lenker, lange nøkler
          </p>
          <pre className="text-[10px] leading-snug text-orange-200/90 font-mono bg-gray-950/60 border border-orange-900/30 rounded-lg p-3 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {HEAVY_JSON}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Designet for maskin-til-maskin-integrasjon og menneskelige utviklere.
            Ingen av delene betaler per token — det gjør leseren nå.
          </p>
          <StatRow tokens={counts?.heavy} heavy={counts?.heavy} color="text-orange-400" />
        </div>

        {/* ── FLAT ── */}
        <div className="bg-gray-900 border border-purple-900/50 rounded-xl p-5 relative">
          <div className="absolute top-3 right-3">
            <span className="text-xs font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50">
              PAE
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✦</span>
            <h2 className="font-bold text-white text-sm">Flatet JSON</h2>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">
            samme fakta — konvolutt og gjentakelser fjernet
          </p>
          <pre className="text-xs leading-snug text-purple-200 font-mono bg-gray-950/60 border border-purple-900/30 rounded-lg p-3 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {FLAT_JSON}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Fortsatt gyldig JSON — eksisterende integrasjoner kan leve videre.
            Det eneste som er borte, er det ingen leser trengte.
          </p>
          <StatRow tokens={counts?.flat} heavy={counts?.heavy} color="text-purple-400" />
        </div>

        {/* ── AGENT-SHAPED ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="font-bold text-white text-sm">Agent-formet</h2>
            </div>
            <div className="flex gap-1">
              {(["yaml", "tsv"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setAgentFormat(f)}
                  className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${
                    agentFormat === f
                      ? "bg-green-800 text-green-200"
                      : "bg-gray-800 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">
            syntaks borte, datoer komprimert — formen følger leseren
          </p>
          <pre className="text-xs leading-relaxed text-green-200 font-mono bg-gray-950/60 border border-green-900/40 rounded-lg p-3 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {agentPayload}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Et <code className="text-green-300">?format=agent</code>-parameter — eller
            en egen agent-endepunktvariant — kan levere dette ved siden av
            dagens JSON. Ingen eksisterende klient brekker.
          </p>
          <StatRow tokens={agentTokens} heavy={counts?.heavy} color="text-green-400" />
        </div>
      </div>

      {/* Savings + scale */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            {saved != null ? `−${saved}%` : "…"}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            tokens fra tung JSON til agent-formet YAML — uten å miste ett eneste faktum
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 font-normal">Skala</th>
                  <th className="text-right py-2 font-normal text-orange-400">Tung JSON</th>
                  <th className="text-right py-2 font-normal text-purple-400">Flatet</th>
                  <th className="text-right py-2 font-normal text-green-400">Agent-formet</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {SCALES.map((s) => (
                  <tr key={s.label} className="border-b border-gray-800/60">
                    <td className="text-left py-2 text-gray-400">{s.label}</td>
                    <td className="text-right py-2 text-orange-300">
                      {counts ? (counts.heavy * s.n).toLocaleString() : "…"} tok ·{" "}
                      {counts ? fmtCo2(counts.heavy * s.n) : "…"} g
                    </td>
                    <td className="text-right py-2 text-purple-300">
                      {counts ? (counts.flat * s.n).toLocaleString() : "…"} tok ·{" "}
                      {counts ? fmtCo2(counts.flat * s.n) : "…"} g
                    </td>
                    <td className="text-right py-2 text-green-300">
                      {counts ? (counts.yaml * s.n).toLocaleString() : "…"} tok ·{" "}
                      {counts ? fmtCo2(counts.yaml * s.n) : "…"} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* The provocation */}
      <div className="max-w-7xl mx-auto px-4 pb-8 grid lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-bold text-white mb-2">
            …og hva trengte oppgaven egentlig?
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Spørsmålet var: «Er hytta ledig 14.–16. juni, og hva koster to netter
            med sengetøy og frokost?» Svaret får plass i{" "}
            <span className="text-green-400 font-mono">
              {counts ? counts.task : "…"} tokens
            </span>
            :
          </p>
          <pre className="text-xs text-gray-300 font-mono bg-gray-950/60 border border-gray-800 rounded-lg p-3 whitespace-pre-wrap">
            {TASK_ANSWER}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Alt over dette tallet er formkostnad — prisen leseren betaler for at
            svaret ble pakket for et annet publikum enn den som leser det.
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-bold text-white mb-2">Metode og forbehold</h3>
          <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
            <li>
              · Tokens telles i nettleseren med{" "}
              <code className="text-gray-300">js-tiktoken</code> (cl100k_base) — samme
              encoder som <code className="text-gray-300">scripts/measure-tokens.ts</code>.
              CLI-variant: <code className="text-gray-300">npx tsx scripts/measure-api-payloads.ts</code>.
            </li>
            <li>
              · Alle fire payloads bærer samme fakta; forskjellen er utelukkende
              representasjon. Kvalitetssiden — at en modell svarer like riktig fra
              den komprimerte formen — er det masterprosjektet måler.
            </li>
            <li>
              · CO₂-tallene bruker samme forenklede omregning som{" "}
              <Link href="/compare" className="text-indigo-400 hover:underline">
                /compare
              </Link>{" "}
              og er retningsgivende, ikke målte.
            </li>
            <li>
              · Interaksjonslaget (nettsted vs. API) og datalaget (formen på svaret)
              er to uavhengige optimaliseringer — PAE-historien er summen av begge.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
