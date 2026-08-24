// CLI mirror of /guidacle. Prints the same token counts the page computes in
// the browser, and — the part that matters — asserts that re-rendering the
// "i dag" sheet from the snapshot's structured candidates reproduces the
// production string BYTE-FOR-BYTE.
//
// That assert is the whole contract. The demo's claim is "this is what the
// model actually reads", and the only thing standing behind it is that
// lib/guidacleDemo.ts cuts the snippet, formats the distance and orders the
// fields exactly as guidora's routes/poi/chat.ts does. If this fails, the
// snapshot and the demo have drifted — fix the renderer, never the assert.
//
//   npx tsx scripts/measure-guidacle-demo.ts

import { getEncoding } from "js-tiktoken";
import {
  CANDIDATES,
  SHEET_TEXT,
  SHEET_VARIANTS,
  JUDGE_ARMS,
  NARRATION_SOURCES,
  NARRATION_MIXES,
  renderSheet,
  renderNarrationInput,
  sheetSnapshot,
} from "../lib/guidacleDemo";

const enc = getEncoding("cl100k_base");
const tok = (s: string) => enc.encode(s).length;
const pct = (part: number, whole: number) => `${Math.round((part / whole) * 100)}%`;

let failures = 0;

// --- the acceptance anchor ------------------------------------------------
const rerendered = renderSheet(CANDIDATES);
if (rerendered === SHEET_TEXT) {
  console.log(
    `✓ re-render === sheetText (${SHEET_TEXT.length} tegn, byte-identisk)\n`
  );
} else {
  failures++;
  console.error("✗ re-render != sheetText — demoen og produksjonen har drivt fra hverandre");
  console.error(`  re-render: ${rerendered.length} tegn`);
  console.error(`  sheetText: ${SHEET_TEXT.length} tegn`);
  const a = rerendered.split("\n");
  const b = SHEET_TEXT.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      console.error(`  første avvik på linje ${i + 1}:`);
      console.error(`    re-render: ${JSON.stringify(a[i])}`);
      console.error(`    sheetText: ${JSON.stringify(b[i])}`);
      break;
    }
  }
  console.error("");
}

// --- §1 arket -------------------------------------------------------------
const meta = sheetSnapshot.meta;
console.log(
  `Snapshot: ${meta.start.label} ${meta.start.lat},${meta.start.lng} · ` +
    `${meta.mode} · ${meta.hours}t · guidora ${meta.guidoraCommit}`
);
console.log(
  `Berikelser: judgedRelevance=${meta.enrichments.judgedRelevance} ` +
    `areaSelfFilter=${meta.enrichments.areaSelfFilter}` +
    (meta.enrichments.judgedRelevance ? "" : "  ← stjerner fra fame-terciler")
);
console.log(`Kandidater: ${CANDIDATES.length}\n`);

console.log("§1 ARKET — hva planleggeren leser");
console.log("Variant                tokens   % av i dag");
const today = tok(SHEET_VARIANTS[0].render());
for (const v of SHEET_VARIANTS) {
  const t = tok(v.render());
  console.log(
    `${v.label.padEnd(22)}${String(t).padStart(6)}${pct(t, today).padStart(12)}`
  );
}
console.log(
  `\nBesparelse i dag → TSV: ${Math.round(
    (1 - tok(SHEET_VARIANTS[4].render()) / today) * 100
  )}%\n`
);

// --- §2 dommeren ----------------------------------------------------------
console.log("§2 DOMMEREN — ingress vs. Wikidata-fakta");
console.log("Sted                        ingress   fakta   forhold");
for (const a of JUDGE_ARMS) {
  const lead = tok(a.leadExtract);
  const facts = a.factsText ? tok(a.factsText) : 0;
  const ratio = facts > 0 ? `${(lead / facts).toFixed(1)}×` : "—";
  console.log(
    `${a.title.padEnd(28)}${String(lead).padStart(7)}${String(facts).padStart(8)}${ratio.padStart(10)}`
  );
}
console.log("");

// --- §3 fortelleren -------------------------------------------------------
console.log("§3 FORTELLEREN — input per kildemiks (ep1-skjelett)");
console.log("Sted                  miks                  input-tokens");
for (const src of NARRATION_SOURCES) {
  for (const mix of NARRATION_MIXES) {
    const t = tok(renderNarrationInput(src, mix.key));
    console.log(
      `${src.title.padEnd(22)}${mix.label.padEnd(22)}${String(t).padStart(6)}`
    );
  }
}
console.log(
  "\nUtgangsbudsjett (målt i produksjon, #1726): normal 160 / deeper 320 / deep 800 tokens"
);

if (failures > 0) {
  console.error(`\n${failures} assert(er) feilet.`);
  process.exit(1);
}
