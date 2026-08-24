"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CANDIDATES,
  SHEET_VARIANTS,
  SheetVariantKey,
  JUDGE_ARMS,
  NARRATION_SOURCES,
  NARRATION_MIXES,
  MixKey,
  TEMPLATE_SKELETON,
  NARRATION_BUDGETS,
  renderNarrationInput,
  sheetSnapshot,
} from "@/lib/guidacleDemo";

const META = sheetSnapshot.meta;

/** Teller tokens LIVE i nettleseren med js-tiktoken (cl100k_base) — samme
 *  encoder som /api-llm og som scripts/measure-guidacle-demo.ts. Ingen
 *  hardkodede tall som kan bli stale. */
function useEncoder() {
  const [enc, setEnc] = useState<((s: string) => number) | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("js-tiktoken").then(({ getEncoding }) => {
      if (cancelled) return;
      const e = getEncoding("cl100k_base");
      setEnc(() => (s: string) => e.encode(s).length);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return enc;
}

function Num({ value, suffix }: { value: number | null; suffix?: string }) {
  return (
    <>
      {value != null ? value.toLocaleString("nb-NO") : "…"}
      {suffix}
    </>
  );
}

function Stat({
  value,
  label,
  color,
}: {
  value: string | null;
  label: string;
  color: string;
}) {
  return (
    <div>
      <div className={`text-xl font-bold ${color}`}>{value ?? "…"}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
  activeClass,
}: {
  options: Array<{ key: T; label: string }>;
  value: T;
  onChange: (k: T) => void;
  activeClass: string;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${
            value === o.key
              ? activeClass
              : "bg-gray-800 text-gray-500 hover:text-gray-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function GuidaclePage() {
  const enc = useEncoder();
  const [variant, setVariant] = useState<SheetVariantKey>("tsv");
  const [showAll, setShowAll] = useState(false);
  const [judgeIdx, setJudgeIdx] = useState(0);
  const [mix, setMix] = useState<MixKey>("extract");
  const [narrIdx, setNarrIdx] = useState(0);

  // Render once, count once — the sheet variants are pure functions of the
  // frozen snapshot, so there is nothing to recompute per keystroke.
  const sheets = useMemo(
    () =>
      Object.fromEntries(
        SHEET_VARIANTS.map((v) => [v.key, v.render()])
      ) as Record<SheetVariantKey, string>,
    []
  );
  const counts = useMemo(() => {
    if (!enc) return null;
    return Object.fromEntries(
      SHEET_VARIANTS.map((v) => [v.key, enc(sheets[v.key])])
    ) as Record<SheetVariantKey, number>;
  }, [enc, sheets]);

  const today = counts?.today ?? null;
  const chosen = counts?.[variant] ?? null;
  const saved =
    today != null && chosen != null ? Math.round((1 - chosen / today) * 100) : null;

  const activeVariant = SHEET_VARIANTS.find((v) => v.key === variant)!;
  const todaySheet = sheets.today;
  const todayLines = todaySheet.split("\n");
  const visibleToday = showAll ? todaySheet : todayLines.slice(0, 8).join("\n");

  const arm = JUDGE_ARMS[judgeIdx];
  const leadTok = enc ? enc(arm.leadExtract) : null;
  const factsTok = enc && arm.factsText ? enc(arm.factsText) : null;

  const narrSrc = NARRATION_SOURCES[narrIdx];
  const narrInput = renderNarrationInput(narrSrc, mix);
  const narrTok = enc ? enc(narrInput) : null;
  const narrBaseline = enc
    ? enc(renderNarrationInput(narrSrc, "extract"))
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-8 text-center">
        <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest">
          Ekte produksjonsdata · PAE Demo
        </span>
        <h1 className="text-3xl font-bold text-white mt-2">
          Hva Guidacles AI faktisk leser
        </h1>
        <p className="text-gray-400 mt-2 max-w-3xl mx-auto text-sm">
          <Link href="/api-llm" className="text-indigo-400 hover:underline">
            /api-llm
          </Link>{" "}
          bruker en oppdiktet hytte. Denne siden gjør det samme på{" "}
          <em>ekte data fra Guidacle</em>: teksten under er generert av
          produksjonskoden, for én fast startposisjon, og tokens telles live i
          nettleseren din. Ingen tall her er skrevet for hånd.
        </p>
        <p className="text-xs text-gray-600 mt-3 font-mono">
          {META.start.label} {META.start.lat},{META.start.lng} · {META.mode} ·{" "}
          {META.hours} t · {CANDIDATES.length} kandidater · guidora{" "}
          {META.guidoraCommit}
        </p>
      </div>

      {/* ─────────────── §1 ARKET ─────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-10" id="arket">
        <h2 className="text-xl font-bold text-white">
          §1 Arket — de 50 linjene planleggeren får
        </h2>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Før modellen foreslår én rute, leser den et kandidatark: ett sted per
          linje, med stjerner, avstand, retning og ledesetning. Dette er den
          faktiske strengen — samme kode som endepunktet kjører.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-5">
        {/* I dag */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🗺️</span>
            <h3 className="font-bold text-white text-sm">I dag — prosa-arket</h3>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">
            50 kandidater · ledesetning kuttet ved 220/120 tegn
          </p>
          <pre className="text-[10px] leading-snug text-orange-200/90 font-mono bg-gray-950/60 border border-orange-900/30 rounded-lg p-3 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {visibleToday}
          </pre>
          <button
            onClick={() => setShowAll((s) => !s)}
            className="text-xs font-mono text-orange-400 hover:text-orange-300 mt-2"
          >
            {showAll
              ? "vis færre"
              : `vis alle ${todayLines.length} linjer ↓`}
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Skrevet for et menneske som skal kjenne igjen stedet. Modellen
            trenger bare å kunne velge og rekkefølge dem.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
            <Stat
              value={today != null ? today.toLocaleString("nb-NO") : null}
              label="tokens"
              color="text-orange-400"
            />
            <Stat value="100%" label="av i dag" color="text-orange-400" />
            <Stat
              value={`${CANDIDATES.length}`}
              label="kandidater"
              color="text-orange-400"
            />
          </div>
        </div>

        {/* Variant */}
        <div className="bg-gray-900 border border-purple-900/50 rounded-xl p-5 relative">
          <div className="absolute top-3 right-3">
            <span className="text-xs font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50">
              PAE
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✦</span>
            <h3 className="font-bold text-white text-sm">Omformet</h3>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-3">
            {activeVariant.note}
          </p>
          <div className="mb-3">
            <Chips
              options={SHEET_VARIANTS.filter((v) => v.key !== "today").map(
                (v) => ({ key: v.key, label: v.label })
              )}
              value={variant}
              onChange={setVariant}
              activeClass="bg-green-800 text-green-200"
            />
          </div>
          <pre className="text-[10px] leading-snug text-green-200 font-mono bg-gray-950/60 border border-green-900/40 rounded-lg p-3 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {sheets[variant]}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Alle fire variantene bærer de samme stedene. Det som forsvinner er
            form — ikke hvilke steder modellen kan velge mellom.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
            <Stat
              value={chosen != null ? chosen.toLocaleString("nb-NO") : null}
              label="tokens"
              color="text-green-400"
            />
            <Stat
              value={
                chosen != null && today ? `${Math.round((chosen / today) * 100)}%` : null
              }
              label="av i dag"
              color="text-green-400"
            />
            <Stat
              value={saved != null ? `−${saved}%` : null}
              label="spart"
              color="text-green-400"
            />
          </div>
        </div>
      </div>

      {/* Savings + honesty */}
      <div className="max-w-7xl mx-auto px-4 pb-10 grid lg:grid-cols-3 gap-5">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center flex flex-col justify-center">
          <div className="text-4xl font-bold text-green-400">
            {saved != null ? `−${saved}%` : "…"}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            tokens fra prosa-arket til «{activeVariant.label}»
          </div>
          <div className="text-xs text-gray-600 mt-2 font-mono">
            <Num value={today} /> → <Num value={chosen} /> tokens
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-yellow-900/40 bg-yellow-950/10 p-5">
          <h3 className="text-sm font-bold text-yellow-200 mb-2">
            Kvalitetsporten
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Besparelsen over teller bare hvis rutene holder samme kvalitet — at
            modellen velger like gode steder, i like god rekkefølge, fra den
            komprimerte formen. Å måle akkurat det er masteroppgaven; denne
            siden måler bare den ene halvdelen, kostnaden. Et tall uten
            kvalitetsmåling er en hypotese, ikke et funn.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed mt-3">
            Merk også at «25/12 kandidater» her er de første N i snapshot-rekkefølge.
            Det <em>approksimerer</em> å senke{" "}
            <code className="text-gray-400">CANDIDATE_CAP</code> i produksjon — den
            ekte grensen settes før lokal-poolen rangeres, så et lavere tak kunne
            sluppet inn en litt annen hale.
          </p>
        </div>
      </div>

      {/* ─────────────── §2 DOMMEREN ─────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-4 border-t border-gray-800" id="dommeren">
        <h2 className="text-xl font-bold text-white mt-8">
          §2 Dommeren — ingress mot strukturerte fakta
        </h2>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Når et sted skal beskrives, mates modellen i dag Wikipedia-ingressen.
          Wikidata har de samme kjernefaktaene som påstander. Begge kolonnene
          under er ekte tekst for samme sted.
        </p>
        <div className="mt-4">
          <Chips
            options={JUDGE_ARMS.map((a, i) => ({
              key: String(i),
              label: a.title,
            }))}
            value={String(judgeIdx)}
            onChange={(k) => setJudgeIdx(Number(k))}
            activeClass="bg-indigo-700 text-indigo-100"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📄</span>
            <h3 className="font-bold text-white text-sm">
              Arm A — Wikipedia-ingress
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">
            {arm.language}.wikipedia · pageid {arm.pageid}
          </p>
          <pre className="text-xs leading-snug text-orange-200/90 font-mono bg-gray-950/60 border border-orange-900/30 rounded-lg p-3 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {arm.leadExtract}
          </pre>
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-2 text-center">
            <Stat
              value={leadTok != null ? leadTok.toLocaleString("nb-NO") : null}
              label="tokens"
              color="text-orange-400"
            />
            <Stat
              value={`${arm.articleLengthChars.toLocaleString("nb-NO")}`}
              label="tegn"
              color="text-orange-400"
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-purple-900/50 rounded-xl p-5 relative">
          <div className="absolute top-3 right-3">
            <span className="text-xs font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50">
              PAE
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚡</span>
            <h3 className="font-bold text-white text-sm">
              Arm B — Wikidata-fakta
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">
            {arm.qid ?? "ingen Wikidata-item"} · lib/wikidataFacts.ts
          </p>
          <pre className="text-xs leading-relaxed text-green-200 font-mono bg-gray-950/60 border border-green-900/40 rounded-lg p-3 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {arm.factsText ?? "(ingen fakta)"}
          </pre>
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-2 text-center">
            <Stat
              value={factsTok != null ? factsTok.toLocaleString("nb-NO") : null}
              label="tokens"
              color="text-green-400"
            />
            <Stat
              value={
                leadTok != null && factsTok
                  ? `${(leadTok / factsTok).toFixed(1)}×`
                  : null
              }
              label="ingress / fakta"
              color="text-green-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-xl border border-yellow-900/40 bg-yellow-950/10 p-5">
          <p className="text-xs text-gray-400 leading-relaxed">
            ÷-tallet gjelder <em>dette ene stedet</em>. Forskningsspørsmålet er om
            dommer-skårene holder over hele korpuset — og fakta-armen mister
            åpenbart noe: ingressen forteller hvorfor stedet betyr noe, ikke bare
            hva det er. Poenget er ikke at fakta er bedre, men at forskjellen i
            pris er stor nok til at spørsmålet er verdt å måle.
          </p>
        </div>
      </div>

      {/* ─────────────── §3 FORTELLEREN ─────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-4 border-t border-gray-800" id="fortelleren">
        <h2 className="text-xl font-bold text-white mt-8">
          §3 Fortelleren — hva som mates inn per minutt fortelling
        </h2>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Fortellingen skal være prosa — det er hele poenget med produktet.
          Spørsmålet er ikke hvor kort <em>utdata</em> kan bli, men hvor lite{" "}
          <em>inndata</em> som trengs for samme fortelling.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Chips
            options={NARRATION_SOURCES.map((s, i) => ({
              key: String(i),
              label: s.title,
            }))}
            value={String(narrIdx)}
            onChange={(k) => setNarrIdx(Number(k))}
            activeClass="bg-indigo-700 text-indigo-100"
          />
          <Chips
            options={NARRATION_MIXES.map((m) => ({ key: m.key, label: m.label }))}
            value={mix}
            onChange={setMix}
            activeClass="bg-green-800 text-green-200"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎙️</span>
            <h3 className="font-bold text-white text-sm">
              Episode 1-inndata — {narrSrc.title}
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-4">
            {NARRATION_MIXES.find((m) => m.key === mix)!.note}
          </p>
          <pre className="text-[10px] leading-snug text-purple-200 font-mono bg-gray-950/60 border border-purple-900/30 rounded-lg p-3 max-h-72 overflow-y-auto whitespace-pre-wrap">
            {narrInput}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Instruksjonsavsnittene er utelatt (
            <code className="text-gray-400">[instruksjoner utelatt]</code>) — de
            er like i alle tre variantene, så de flytter ikke forskjellen. Malens
            struktur og plassholdere er ekte.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
            <Stat
              value={narrTok != null ? narrTok.toLocaleString("nb-NO") : null}
              label="input-tokens"
              color="text-purple-400"
            />
            <Stat
              value={
                narrTok != null && narrBaseline
                  ? `${Math.round((narrTok / narrBaseline) * 100)}%`
                  : null
              }
              label="av «kun utdrag»"
              color="text-purple-400"
            />
            <Stat
              value={`${NARRATION_BUDGETS.normal}`}
              label="output-tak"
              color="text-purple-400"
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-white text-sm mb-1">
            Målt i produksjon (#1726)
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Hvorfor utdata-taket ikke kan settes etter ordtelling: tetthet per
            token varierer med kilden.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 font-normal">Kilde</th>
                  <th className="text-right py-2 font-normal">tegn/token</th>
                  <th className="text-right py-2 font-normal">tokens brukt</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-gray-800/60">
                  <td className="py-2 text-gray-400">Wikipedia (en)</td>
                  <td className="text-right py-2 text-green-300">3,6–4,8</td>
                  <td className="text-right py-2 text-gray-300">66–143</td>
                </tr>
                <tr className="border-b border-gray-800/60">
                  <td className="py-2 text-gray-400">tier-2 (en)</td>
                  <td className="text-right py-2 text-orange-300">2,4–2,9</td>
                  <td className="text-right py-2 text-gray-300">116–142</td>
                </tr>
                <tr className="border-b border-gray-800/60">
                  <td className="py-2 text-gray-400">tier-2 (no)</td>
                  <td className="text-right py-2 text-orange-300">2,1–2,3</td>
                  <td className="text-right py-2 text-gray-300">163–182</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="text-xs text-gray-400 space-y-2 leading-relaxed mt-4">
            <li>
              · Ved tak 110 ble 9 av 14 engelske genereringer klippet midt i en
              setning. Ved 150 klippes 0 av 14; taket ble satt til{" "}
              <span className="text-gray-300">160</span> for litt luft.
            </li>
            <li>
              · Budsjett i dag:{" "}
              <span className="text-gray-300 font-mono">
                {NARRATION_BUDGETS.normal} / {NARRATION_BUDGETS.deeper} /{" "}
                {NARRATION_BUDGETS.deep}
              </span>{" "}
              tokens for normal / deeper / deep.
            </li>
            <li>
              · Samme ordtelling, ~60 % flere tokens: en tier-2-kilde er tett med
              egennavn som fragmenterer hardt i tokenizeren. Det er en{" "}
              <em>form</em>-kostnad, ikke en innholdskostnad.
            </li>
          </ul>
        </div>
      </div>

      {/* Method */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-bold text-white mb-2">Metode og forbehold</h3>
          <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
            <li>
              · Alle payloads er generert av Guidacles produksjonskode (commit{" "}
              <code className="text-gray-300">{META.guidoraCommit}</code>) for
              startpunktet {META.start.label} ({META.start.lat},{META.start.lng}),{" "}
              {META.mode}, {META.hours} t. Arket er rendret av samme modul som
              endepunktet bruker; CLI-en{" "}
              <code className="text-gray-300">
                npx tsx scripts/measure-guidacle-demo.ts
              </code>{" "}
              sjekker at re-renderingen er byte-identisk med produksjonsstrengen.
            </li>
            <li>
              · Tokens telles live i nettleseren din med{" "}
              <code className="text-gray-300">js-tiktoken</code> (cl100k_base) —
              en OpenAI-tokenizer, brukt som felles målestokk i hele prototypen.
              Andre modeller deler opp litt annerledes; forholdstallene flytter
              seg lite, absoluttallene noe.
            </li>
            {!META.enrichments.judgedRelevance && (
              <li className="text-yellow-200/80">
                · Stjernene i arket kommer fra <em>fame-terciler</em>, ikke fra
                den dømte relevansen: dette snapshotet ble kjørt uten
                databasetilgang, samme fail-open-vei produksjonen tar ved
                DB-bom. Linjeformen og antall kandidater er upåvirket, men
                hvilke steder som har stjerne — og dermed hvilke som får 220
                mot 120 tegn — kan avvike noe fra et kjørende produksjonsmiljø.
              </li>
            )}
            <li>
              · Ingen systemprompter, nøkler eller brukerdata er publisert her.
              Fortellermalens instruksjonsavsnitt er erstattet med{" "}
              <code className="text-gray-300">[instruksjoner utelatt]</code>.
            </li>
            <li>
              · Interaksjonslaget (
              <Link href="/compare" className="text-indigo-400 hover:underline">
                /compare
              </Link>
              ), datalaget (
              <Link href="/api-llm" className="text-indigo-400 hover:underline">
                /api-llm
              </Link>
              ) og denne siden måler tre uavhengige steder formen koster noe.
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 text-center">
        <p className="text-xs text-gray-600">
          Tallene er ekte: generert av produksjonskoden (commit{" "}
          <span className="font-mono">{META.guidoraCommit}</span>){" "}
          {new Date(META.generatedAt).toLocaleDateString("nb-NO")}, telling skjer
          live i nettleseren din (js-tiktoken, cl100k_base).
        </p>
      </div>
    </div>
  );
}
