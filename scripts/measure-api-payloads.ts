/**
 * measure-api-payloads.ts
 *
 * Teller tokens i de fire API-payload-variantene på /api-llm-siden —
 * samme metode som measure-tokens.ts (js-tiktoken, cl100k_base).
 *
 * Kjør:  npx tsx scripts/measure-api-payloads.ts
 * (Selve /api-llm-siden teller live i nettleseren — dette er CLI-varianten
 * for terminal og rapport.)
 */

import { getEncoding } from "js-tiktoken";
import {
  HEAVY_JSON,
  FLAT_JSON,
  AGENT_YAML,
  AGENT_TSV,
  TASK_ANSWER,
} from "../lib/apiPayloads";

const enc = getEncoding("cl100k_base");
const count = (t: string) => enc.encode(t).length;

const rows = [
  ["Tung enterprise-JSON", HEAVY_JSON],
  ["Flatet JSON", FLAT_JSON],
  ["Agent-formet YAML", AGENT_YAML],
  ["Agent-formet TSV", AGENT_TSV],
  ["(det oppgaven trengte)", TASK_ANSWER],
] as const;

const heavy = count(HEAVY_JSON);
console.log("Payload".padEnd(26), "tokens".padStart(7), "% av tung".padStart(10));
for (const [name, text] of rows) {
  const c = count(text);
  console.log(
    name.padEnd(26),
    String(c).padStart(7),
    `${((c / heavy) * 100).toFixed(1)}%`.padStart(10)
  );
}
console.log(
  `\nBesparelse tung → YAML: ${((1 - count(AGENT_YAML) / heavy) * 100).toFixed(1)}%`
);
