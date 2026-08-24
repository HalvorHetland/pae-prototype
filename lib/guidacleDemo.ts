// Pure derivations over the frozen Guidacle snapshot in lib/guidacle/.
//
// The snapshot's `sheetText` was produced by running guidora's own candidate-line
// template (routes/poi/chat.ts) over a real pool. This file re-renders that sheet
// from the structured `candidates` array, and scripts/measure-guidacle-demo.ts
// asserts the two are byte-equal.
//
// That assert is what lets the variants below be trusted: they are the same
// template with one thing removed, not a lookalike written from memory. It is
// also the only thing holding the two in sync — the renderer here is a copy, so
// if chat.ts ever changes its line format, the assert fails on the next snapshot
// and the copy has to be updated. Fix the renderer, never the assert.
//
// Everything here is pure so the CLI and the page compute identical numbers.

import sheetSnapshot from "./guidacle/sheetSnapshot.json";
import judgeArms from "./guidacle/judgeArms.json";
import narrationSources from "./guidacle/narrationSources.json";

export { sheetSnapshot, judgeArms, narrationSources };

export interface SnapshotCandidate {
  title: string;
  pageid: number;
  language: string;
  lat: number;
  lng: number;
  distanceM: number;
  bearing: string;
  distanceLabel: string;
  stars: number;
  firstSentence: string;
}

export const CANDIDATES = sheetSnapshot.candidates as SnapshotCandidate[];
export const SHEET_TEXT = sheetSnapshot.sheetText as string;

// --------------------------------------------------------------- the sheet

/** Snippet budget: starred candidates get the fuller lead sentence, unstarred
 *  ones a shorter one. Mirrors snippetLimit() in guidora. */
export function snippetLimit(stars: number): number {
  return stars > 0 ? 220 : 120;
}

/** One candidate line, the production template verbatim. */
export function renderSheetLine(c: SnapshotCandidate): string {
  const stars = "★".repeat(c.stars);
  const lang = c.language && c.language !== "en" ? `, ${c.language}` : "";
  const snippet = c.firstSentence.slice(0, snippetLimit(c.stars));
  const where = `${c.distanceLabel} ${c.bearing}`;
  return `- ${stars ? `${stars} ` : ""}${c.title} (pageid: ${
    c.pageid
  }, ${where}${lang}): ${snippet}`;
}

export function renderSheet(cands: SnapshotCandidate[]): string {
  return cands.map(renderSheetLine).join("\n");
}

// ------------------------------------------------------------- the variants

/** First N in snapshot order. NOTE: this approximates lowering guidora's
 *  CANDIDATE_CAP — the real cap is applied before the locals are ranked, so a
 *  smaller cap in production could admit a slightly different tail. The
 *  headliners, which carry the stars, come first either way. */
export function topN(n: number, cands: SnapshotCandidate[] = CANDIDATES): string {
  return renderSheet(cands.slice(0, n));
}

/** Same lines, snippet dropped — the geometry and the name survive. */
export function noSnippets(cands: SnapshotCandidate[] = CANDIDATES): string {
  return cands
    .map((c) => {
      const stars = "★".repeat(c.stars);
      const lang = c.language && c.language !== "en" ? `, ${c.language}` : "";
      return `- ${stars ? `${stars} ` : ""}${c.title} (pageid: ${
        c.pageid
      }, ${c.distanceLabel} ${c.bearing}${lang})`;
    })
    .join("\n");
}

/** Tab-separated: the same fields with the prose syntax removed entirely. */
export function toTSV(cands: SnapshotCandidate[] = CANDIDATES): string {
  const header = "title\tstars\tdist_m\tbearing";
  const rows = cands.map(
    (c) => `${c.title}\t${c.stars}\t${Math.round(c.distanceM)}\t${c.bearing}`
  );
  return [header, ...rows].join("\n");
}

export type SheetVariantKey = "today" | "n25" | "n12" | "nosnip" | "tsv";

export const SHEET_VARIANTS: Array<{
  key: SheetVariantKey;
  label: string;
  note: string;
  render: () => string;
}> = [
  {
    key: "today",
    label: "i dag",
    note: "50 kandidater, full prosa — det modellen faktisk leser nå",
    render: () => renderSheet(CANDIDATES),
  },
  {
    key: "n25",
    label: "25 kandidater",
    note: "halve listen — samme linjeform, færre steder å velge mellom",
    render: () => topN(25),
  },
  {
    key: "n12",
    label: "12 kandidater",
    note: "bare toppen av listen; stjernene ligger først uansett",
    render: () => topN(12),
  },
  {
    key: "nosnip",
    label: "uten utdrag",
    note: "navn, pageid og geometri beholdt — ledesetningen fjernet",
    render: () => noSnippets(),
  },
  {
    key: "tsv",
    label: "TSV",
    note: "samme felter, all syntaks borte",
    render: () => toTSV(),
  },
];

// -------------------------------------------------------------- §2 dommeren

export interface JudgeArm {
  source: string;
  qid: string | null;
  title: string;
  pageid: number;
  language: string;
  leadExtract: string;
  factsText: string | null;
  articleLengthChars: number;
  articleLengthBytes: number | null;
}

export const JUDGE_ARMS = judgeArms.arms as JudgeArm[];

// ------------------------------------------------------------ §3 fortelleren

export interface NarrationSource {
  title: string;
  pageid: number;
  language: string;
  extract: string;
  factsText: string | null;
  wikivoyageExtract: string | null;
}

export const NARRATION_SOURCES = narrationSources.sources as NarrationSource[];
export const TEMPLATE_SKELETON = narrationSources.templateSkeleton as string;
export const NARRATION_BUDGETS = narrationSources.meta.budgets as {
  normal: number;
  deeper: number;
  deep: number;
};

export type MixKey = "extract" | "both" | "facts";

export const NARRATION_MIXES: Array<{
  key: MixKey;
  label: string;
  note: string;
}> = [
  { key: "extract", label: "kun utdrag (i dag)", note: "Wikipedia-ingressen, som i produksjon" },
  { key: "both", label: "utdrag + fakta", note: "ingressen pluss Wikidata-blokken" },
  { key: "facts", label: "kun fakta", note: "bare de strukturerte påstandene" },
];

/** Render the ep1 skeleton with one source mix substituted in. The prompt's
 *  instruction paragraphs are withheld upstream (see the exporter), so this
 *  measures how the SOURCE half of the input moves — the withheld half is a
 *  constant that shifts every variant by the same amount. */
export function renderNarrationInput(
  src: NarrationSource,
  mix: MixKey
): string {
  const material =
    mix === "extract"
      ? src.extract
      : mix === "facts"
        ? (src.factsText ?? "")
        : [src.extract, src.factsText ?? ""].filter(Boolean).join("\n\n");
  return TEMPLATE_SKELETON.replace("{{sourceName}}", "Wikipedia")
    .replace("{{title}}", src.title)
    .replace("{{extract}}", material);
}
