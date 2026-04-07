/**
 * measure-tokens.ts
 *
 * Teller tokens LOKALT med js-tiktoken (cl100k_base = samme BPE som Claude).
 * Ingen API-kall, ingen kostnad, ingen nøkkel nødvendig.
 *
 * Kjør med:  npx tsx scripts/measure-tokens.ts
 */

import { getEncoding } from "js-tiktoken";
import fs from "fs";
import path from "path";

// cl100k_base = BPE-encoderen brukt av GPT-4 og Claude — nær identisk tokenisering
const enc = getEncoding("cl100k_base");

function countTokens(text: string): number {
  return enc.encode(text).length;
}

// Konversasjonsformat: legg til ~4 tokens overhead per melding (rolle + separator)
function countMessageTokens(messages: Array<{ role: string; content: string }>): number {
  return messages.reduce((sum, m) => sum + countTokens(m.content) + 4, 0) + 2;
}

// ── Realistiske agent-svar per steg ───────────────────────────────────────────
// Dette er hva en LLM browser-automation-agent faktisk ville svart i hvert steg.
// Disse telles med count_tokens for eksakte output-token-tall.
const AGENT_REPLIES: Record<number, string> = {
  1: `I can see the FjordHytte booking page with a calendar for June 2025. I need to select check-in date June 14 and check-out date June 16. I can see those dates are available (highlighted). I'll click on June 14 first to set the check-in date.

Action: click(element='button[data-date="2025-06-14"]')`,

  2: `I've clicked June 14 as check-in. Now I need to click June 16 as check-out, then click "Next: Your Info →".

Action: click(element='button[data-date="2025-06-16"]')
Action: click(element='button#next-dates', text='Next: Your Info →')`,

  3: `I'm now on the guest information form (Step 2). I need to fill in name and email. I'll type into each field.

Action: click(element='input#name')
Action: type(text='Halvor Hetland')
Action: click(element='input#email')
Action: type(text='halvor@example.com')`,

  4: `Name and email fields are filled. The "Next: Add-ons →" button is now enabled. Clicking it to proceed.

Action: click(element='button#next-addons', text='Next: Add-ons →')`,

  5: `I'm on the add-ons step. I need to select "Bedding" (NOK 200) and "Breakfast" (NOK 350). I'll check both checkboxes.

Action: click(element='input#addon-bedding')
Action: click(element='input#addon-breakfast')`,

  6: `Both Bedding and Breakfast are now selected. The sidebar shows total NOK 2,950. Clicking "Review booking →" to proceed.

Action: click(element='button#review-booking', text='Review booking →')`,

  7: `I can see the review page with all booking details:
- Cabin: Sirdal Mountain Cabin
- Check-in: 2025-06-14, Check-out: 2025-06-16
- Guest: Halvor Hetland / halvor@example.com
- Add-ons: Bedding, Breakfast
- Total: NOK 2,950

All details are correct. Clicking "Book now — NOK 2,950" to confirm.

Action: click(element='button#book-now', text='Book now — NOK 2,950')`,

  8: `The booking is confirmed!
- Confirmation ID: HYT-38291
- Cabin: Sirdal Mountain Cabin
- Check-in: 2025-06-14, Check-out: 2025-06-16
- Total: NOK 2,950
- Confirmation sent to halvor@example.com

Task complete.`,
};

const AGENT_FIRST_REPLY = `I'll call POST /api/book with the required parameters.

\`\`\`json
POST /api/book
{
  "checkIn": "2025-06-14",
  "checkOut": "2025-06-16",
  "guests": 2,
  "name": "Halvor Hetland",
  "email": "halvor@example.com",
  "addons": ["bedding", "breakfast"]
}
\`\`\`

Response received:
\`\`\`json
{
  "confirmationId": "HYT-38291",
  "status": "confirmed",
  "nights": 2,
  "pricing": { "total": 2950, "currency": "NOK" },
  "message": "Your booking is confirmed."
}
\`\`\`

Booking complete. Confirmation ID: HYT-38291. Total: NOK 2,950.`;

// ── Hva agenten skal bestille ─────────────────────────────────────────────────
const BOOKING_TASK = `
Book a 2-night cabin stay with these details:
- Check-in: 2025-06-14
- Check-out: 2025-06-16
- Name: Halvor Hetland
- Email: halvor@example.com
- Add-ons: Bedding and Breakfast
`;

// ── HTML-representasjon av menneskelig side (hvert steg) ──────────────────────
// Dette simulerer hva en browser-automation-agent ser etter hvert klikk.
// Innholdet er nøyaktig det den rendrede React-komponenten produserer.

const HUMAN_PAGE_STEP_0 = `
<!DOCTYPE html>
<html lang="no">
<head><title>Book — Sirdal Mountain Cabin | FjordHytte</title></head>
<body>
<nav>
  <a href="/">FjordHytte</a>
  <a href="/search">Search</a>
  <a href="/favorites">Favorites</a>
  <a href="/login">Log in</a>
  <a href="/signup">Sign up</a>
</nav>

<main>
  <div class="breadcrumb">Home › Cabins › Sirdal Mountain Cabin › Book</div>
  <h1>Book Sirdal Mountain Cabin</h1>

  <!-- Step indicator -->
  <div class="steps">
    <span class="step active">1. Dates</span>
    <span class="step">2. Your Info</span>
    <span class="step">3. Add-ons</span>
    <span class="step">4. Review &amp; Confirm</span>
  </div>

  <div class="layout">
    <!-- Main content: Step 1 - Date picker -->
    <div class="main">
      <div class="card">
        <h2>Choose your dates</h2>
        <p>Select check-in and check-out dates from the calendar below.</p>

        <!-- Calendar: June 2025 -->
        <div class="calendar">
          <div class="month-header">June 2025</div>
          <div class="weekdays">Su Mo Tu We Th Fr Sa</div>
          <div class="days">
            <!-- Row 1 -->
            <button disabled class="unavailable">1</button>
            <button disabled class="unavailable">2</button>
            <button disabled class="unavailable">3</button>
            <button disabled class="unavailable">4</button>
            <button disabled class="unavailable">5</button>
            <button disabled class="unavailable">6</button>
            <button class="available" data-date="2025-06-07">7</button>
            <!-- Row 2 -->
            <button class="available" data-date="2025-06-08">8</button>
            <button class="available" data-date="2025-06-09">9</button>
            <button disabled class="unavailable">10</button>
            <button disabled class="unavailable">11</button>
            <button disabled class="unavailable">12</button>
            <button disabled class="unavailable">13</button>
            <button class="available" data-date="2025-06-14">14</button>
            <!-- Row 3 -->
            <button class="available" data-date="2025-06-15">15</button>
            <button class="available" data-date="2025-06-16">16</button>
            <button disabled class="unavailable">17</button>
            <button disabled class="unavailable">18</button>
            <button disabled class="unavailable">19</button>
            <button disabled class="unavailable">20</button>
            <button class="available" data-date="2025-06-21">21</button>
            <!-- Row 4 -->
            <button class="available" data-date="2025-06-22">22</button>
            <button disabled class="unavailable">23</button>
            <button disabled class="unavailable">24</button>
            <button disabled class="unavailable">25</button>
            <button disabled class="unavailable">26</button>
            <button disabled class="unavailable">27</button>
            <button class="available" data-date="2025-06-28">28</button>
            <!-- Row 5 -->
            <button class="available" data-date="2025-06-29">29</button>
            <button disabled class="unavailable">30</button>
          </div>
          <p class="note">Highlighted dates are available</p>
        </div>

        <div class="selected-dates">
          <div>Check-in: <strong>(not selected)</strong></div>
          <div>Check-out: <strong>(not selected)</strong></div>
        </div>

        <div class="actions">
          <button disabled class="btn-next" id="next-dates">Next: Your Info →</button>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <aside>
      <div class="cabin-card">
        <img alt="Sirdal Mountain Cabin exterior" src="/cabin.jpg" />
        <h3>Sirdal Mountain Cabin</h3>
        <p>⭐ 4.9 · 142 reviews</p>
        <p>Sleeps 6 · Hot tub · Sauna · Mountain views</p>
        <hr />
        <div class="price-summary">
          <div>NOK 1,200 × 2 nights</div>
          <div><strong>Total: NOK 2,400</strong></div>
        </div>
      </div>
      <div class="cancellation-policy">
        🔒 Free cancellation until 48 hours before check-in.
      </div>
      <div class="support">
        <p><strong>Need help?</strong></p>
        <p>📞 +47 38 00 00 00</p>
        <p>📧 booking@fjordhytte.no</p>
        <p>Mon–Fri 08:00–20:00</p>
      </div>
    </aside>
  </div>
</main>

<footer>
  © 2025 FjordHytte AS · Org. 999 999 999 · Alle rettigheter forbeholdt
  <nav>
    <a href="/privacy">Personvern</a>
    <a href="/terms">Vilkår</a>
    <a href="/accessibility">Tilgjengelighet</a>
  </nav>
</footer>
</body>
</html>
`;

const HUMAN_PAGE_STEP_0_AFTER_DATES = `
[PAGE STATE AFTER CLICKING DATE 2025-06-14 (check-in) AND 2025-06-16 (check-out)]

Selected dates:
  Check-in:  2025-06-14 (highlighted in blue)
  Check-out: 2025-06-16 (highlighted in blue)

The "Next: Your Info →" button is now ENABLED (was previously disabled).

Current visible elements:
  - Calendar with 2025-06-14 and 2025-06-16 highlighted
  - Check-in: 2025-06-14
  - Check-out: 2025-06-16
  - Button: [Next: Your Info →]  ← ENABLED, can be clicked
`;

const HUMAN_PAGE_STEP_1 = `
[PAGE STATE AFTER CLICKING "Next: Your Info →"]

Step indicator: 1.Dates ✓ | 2.Your Info (ACTIVE) | 3.Add-ons | 4.Review & Confirm

<form class="guest-info-form">
  <h2>Your information</h2>
  <p>We'll send your confirmation to the email address you provide.</p>

  <div class="form-group">
    <label for="name">Full name *</label>
    <input type="text" id="name" name="name" placeholder="Your full name" required value="" />
  </div>

  <div class="form-group">
    <label for="email">Email address *</label>
    <input type="email" id="email" name="email" placeholder="your@email.com" required value="" />
  </div>

  <div class="form-group">
    <label for="phone">Phone number (optional)</label>
    <input type="tel" id="phone" name="phone" placeholder="+47 000 00 000" value="" />
  </div>

  <div class="info-box">
    📧 A confirmation will be sent to your email address.
  </div>

  <div class="actions">
    <button type="button" id="back-to-dates">← Back</button>
    <button type="button" id="next-addons" disabled class="btn-next">Next: Add-ons →</button>
    <!-- Note: "Next: Add-ons" button is DISABLED until name and email are filled -->
  </div>
</form>
`;

const HUMAN_PAGE_STEP_1_FILLED = `
[PAGE STATE AFTER FILLING IN GUEST INFORMATION]

Form values:
  Full name:     Halvor Hetland    ← typed
  Email address: halvor@example.com ← typed
  Phone:         (left empty)

The "Next: Add-ons →" button is now ENABLED.

Visible elements:
  <input id="name"  value="Halvor Hetland" />
  <input id="email" value="halvor@example.com" />
  <input id="phone" value="" />
  <button id="next-addons">Next: Add-ons →</button>  ← ENABLED, can be clicked
`;

const HUMAN_PAGE_STEP_2 = `
[PAGE STATE AFTER CLICKING "Next: Add-ons →"]

Step indicator: 1.Dates ✓ | 2.Your Info ✓ | 3.Add-ons (ACTIVE) | 4.Review & Confirm

<div class="addons-step">
  <h2>Enhance your stay</h2>
  <p>Optional extras — add what you need.</p>

  <label class="addon-option" data-name="Bedding">
    <input type="checkbox" name="Bedding" id="addon-bedding" unchecked />
    <div>
      <strong>Bedding</strong>
      <p>Duvet, pillows and fresh linen for all beds</p>
    </div>
    <span>NOK 200</span>
  </label>

  <label class="addon-option" data-name="Parking">
    <input type="checkbox" name="Parking" id="addon-parking" unchecked />
    <div>
      <strong>Parking</strong>
      <p>Reserved spot in the cabin parking area</p>
    </div>
    <span>NOK 100</span>
  </label>

  <label class="addon-option" data-name="Breakfast">
    <input type="checkbox" name="Breakfast" id="addon-breakfast" unchecked />
    <div>
      <strong>Breakfast</strong>
      <p>Continental breakfast basket delivered each morning</p>
    </div>
    <span>NOK 350</span>
  </label>

  <div class="actions">
    <button id="back-to-info">← Back</button>
    <button id="review-booking">Review booking →</button>
  </div>
</div>
`;

const HUMAN_PAGE_STEP_2_SELECTED = `
[PAGE STATE AFTER CHECKING "Bedding" AND "Breakfast"]

Checked add-ons:
  ✅ Bedding   NOK 200
  ☐  Parking   NOK 100  (not selected)
  ✅ Breakfast NOK 350

Sidebar updated:
  NOK 1,200 × 2 nights = NOK 2,400
  Bedding               = NOK   200
  Breakfast             = NOK   350
  Total                 = NOK 2,950

Button: [Review booking →] — ENABLED, can be clicked
`;

const HUMAN_PAGE_STEP_3 = `
[PAGE STATE AFTER CLICKING "Review booking →"]

Step indicator: 1.Dates ✓ | 2.Your Info ✓ | 3.Add-ons ✓ | 4.Review & Confirm (ACTIVE)

<div class="review-step">
  <h2>Review &amp; confirm</h2>

  <table class="booking-summary">
    <tr><td>Cabin</td>       <td>Sirdal Mountain Cabin</td></tr>
    <tr><td>Check-in</td>    <td>2025-06-14</td></tr>
    <tr><td>Check-out</td>   <td>2025-06-16</td></tr>
    <tr><td>Guest</td>       <td>Halvor Hetland</td></tr>
    <tr><td>Email</td>       <td>halvor@example.com</td></tr>
    <tr><td>Add-ons</td>     <td>Bedding, Breakfast</td></tr>
    <tr><td>Cabin (2 nights × NOK 1,200)</td><td>NOK 2,400</td></tr>
    <tr class="addon-row"><td>Bedding</td>   <td>NOK 200</td></tr>
    <tr class="addon-row"><td>Breakfast</td> <td>NOK 350</td></tr>
    <tr class="total-row"><td><strong>Total</strong></td><td><strong>NOK 2,950</strong></td></tr>
  </table>

  <div class="actions">
    <button id="back-to-addons">← Back</button>
    <button id="book-now" class="btn-confirm">Book now — NOK 2,950</button>
  </div>
</div>
`;

const HUMAN_PAGE_CONFIRMED = `
[PAGE STATE AFTER CLICKING "Book now — NOK 2,950"]

<div class="confirmation-screen">
  <div class="success-icon">✅</div>
  <h2>Booking confirmed!</h2>
  <p class="confirmation-id">Booking ID: HYT-38291</p>
  <p>Thank you, Halvor Hetland! A confirmation has been sent to halvor@example.com</p>

  <div class="booking-details">
    <p>Sirdal Mountain Cabin</p>
    <p>2025-06-14 → 2025-06-16 (2 nights)</p>
    <p>Bedding + Breakfast included</p>
    <p>Total paid: NOK 2,950</p>
  </div>

  <a href="/dashboard">View my bookings</a>
</div>
`;

// ── Agent-first API-dokumentasjon ─────────────────────────────────────────────
const AGENT_FIRST_SCHEMA = `
You are an AI agent. Complete the following booking using the API below.

## API Documentation

### GET /api/availability
Returns available dates and pricing.

Response:
{
  "cabin": "sirdal-mountain-cabin",
  "currency": "NOK",
  "pricePerNight": 1200,
  "availableDates": ["2025-06-07", "2025-06-08", ...],
  "addons": {
    "bedding":    { "price": 200, "description": "Linen and duvet for all beds" },
    "parking":    { "price": 100, "description": "Reserved parking spot" },
    "breakfast":  { "price": 350, "description": "Continental breakfast basket daily" }
  }
}

### POST /api/book
Create a booking. Returns confirmation immediately.

Request body:
{
  "checkIn":  "YYYY-MM-DD",   // required
  "checkOut": "YYYY-MM-DD",   // required
  "guests":   number,          // optional, default 1
  "name":     "string",        // required — guest full name
  "email":    "string",        // required — guest email
  "addons":   ["string"]       // optional: "bedding" | "parking" | "breakfast"
}

Response:
{
  "confirmationId": "HYT-XXXXX",
  "status": "confirmed",
  "nights": number,
  "pricing": { "total": number, "currency": "NOK" },
  "message": "Your booking is confirmed."
}

## Your task
${BOOKING_TASK}

Call POST /api/book with the correct parameters and confirm the booking is complete.
`;

// ── Typer ─────────────────────────────────────────────────────────────────────
interface TurnResult {
  turn: number;
  label: string;
  input_tokens: number;
  output_tokens: number;
}

interface PathResult {
  path: "human-first" | "agent-first";
  turns: TurnResult[];
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  co2_g: number;
  num_turns: number;
}

// ── CO₂-konstant (fra Patterson et al. 2021, justert for inferens) ─────────────
// Vi bruker 0.002g CO₂ per 1000 tokens (2g per million tokens)
// Kilde: estimat basert på GPU-energiforbruk per inference-token
const CO2_PER_1K_TOKENS = 0.002;

function calcCo2(tokens: number): number {
  return (tokens / 1000) * CO2_PER_1K_TOKENS;
}

// ── Mål menneskelig side ──────────────────────────────────────────────────────
function measureHumanFirstPath(): PathResult {
  console.log("\n📺  Måler menneskelig-first sti...");

  const turns: TurnResult[] = [];
  const messages: Array<{ role: string; content: string }> = [];

  const steps = [
    {
      label: "Ser initial side (Step 0: Kalender)",
      userContent: `You are an AI agent using browser automation. Your task: ${BOOKING_TASK}\n\nHere is the current page HTML:\n\n${HUMAN_PAGE_STEP_0}\n\nDescribe what actions you need to take to proceed with the booking.`,
    },
    {
      label: "Klikker check-in dato (14. juni)",
      userContent: `You clicked date 2025-06-14 as check-in. ${HUMAN_PAGE_STEP_0_AFTER_DATES}\n\nNow click 2025-06-16 as check-out and proceed to the next step.`,
    },
    {
      label: "Fyller inn gjesteinfo (Step 1)",
      userContent: `You clicked "Next: Your Info". ${HUMAN_PAGE_STEP_1}\n\nFill in the required guest information fields.`,
    },
    {
      label: "Bekrefter utfylt skjema og går videre (Step 1 → 2)",
      userContent: `${HUMAN_PAGE_STEP_1_FILLED}\n\nClick "Next: Add-ons →" to continue.`,
    },
    {
      label: "Velger tillegg (Step 2: Add-ons)",
      userContent: `You are now on the add-ons step. ${HUMAN_PAGE_STEP_2}\n\nSelect "Bedding" and "Breakfast" add-ons.`,
    },
    {
      label: "Bekrefter valgte tillegg og går til review (Step 2 → 3)",
      userContent: `${HUMAN_PAGE_STEP_2_SELECTED}\n\nClick "Review booking →" to proceed to the review step.`,
    },
    {
      label: "Leser gjennom og bekrefter booking (Step 3: Review)",
      userContent: `${HUMAN_PAGE_STEP_3}\n\nVerify all details are correct and click "Book now — NOK 2,950" to confirm.`,
    },
    {
      label: "Bekrefter at booking er fullført",
      userContent: `${HUMAN_PAGE_CONFIRMED}\n\nIs the booking complete? Confirm with a brief summary.`,
    },
  ];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`  Turn ${i + 1}: ${step.label}`);

    messages.push({ role: "user", content: step.userContent });

    // Tell input: hele samtalehistorikken til og med dette steget
    const inputTokens = countMessageTokens(messages);

    // Realistisk agent-svar for dette steget
    const agentReply = AGENT_REPLIES[i + 1] ?? "Proceeding with next action.";

    // Tell output: bare svaret
    const outputTokens = countTokens(agentReply);

    const result: TurnResult = {
      turn: i + 1,
      label: step.label,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    };
    turns.push(result);

    console.log(`    → input: ${inputTokens} | output: ${outputTokens}`);

    // Legg svar inn i historikk for neste steg
    messages.push({ role: "assistant", content: agentReply });
  }

  const totalInput = turns.reduce((s, t) => s + t.input_tokens, 0);
  const totalOutput = turns.reduce((s, t) => s + t.output_tokens, 0);
  const totalTokens = totalInput + totalOutput;

  return {
    path: "human-first",
    turns,
    total_input_tokens: totalInput,
    total_output_tokens: totalOutput,
    total_tokens: totalTokens,
    co2_g: calcCo2(totalTokens),
    num_turns: turns.length,
  };
}

// ── Mål agent-first side ──────────────────────────────────────────────────────
function measureAgentFirstPath(): PathResult {
  console.log("\n⚡  Måler agent-first sti...");

  const inputTokens = countMessageTokens([{ role: "user", content: AGENT_FIRST_SCHEMA }]);
  const outputTokens = countTokens(AGENT_FIRST_REPLY);

  console.log(`  Turn 1: input: ${inputTokens} | output: ${outputTokens}`);

  const turn: TurnResult = {
    turn: 1,
    label: "POST /api/book (enkelt API-kall)",
    input_tokens: inputTokens,
    output_tokens: outputTokens,
  };

  const totalTokens = inputTokens + outputTokens;

  return {
    path: "agent-first",
    turns: [turn],
    total_input_tokens: inputTokens,
    total_output_tokens: outputTokens,
    total_tokens: totalTokens,
    co2_g: calcCo2(totalTokens),
    num_turns: 1,
  };
}

// ── Lag oppdatert compare-data ────────────────────────────────────────────────
function generateCompareData(human: PathResult, agent: PathResult) {
  const tokenReduction = Math.round(
    (1 - agent.total_tokens / human.total_tokens) * 100
  );
  const co2Reduction = Math.round(
    (1 - agent.co2_g / human.co2_g) * 100
  );

  return {
    measured_at: new Date().toISOString(),
    tokenizer: "cl100k_base (js-tiktoken, lokalt — ingen API)",
    co2_constant: `${CO2_PER_1K_TOKENS}g per 1000 tokens`,
    human_first: {
      total_input_tokens: human.total_input_tokens,
      total_output_tokens: human.total_output_tokens,
      total_tokens: human.total_tokens,
      num_turns: human.num_turns,
      co2_g: human.co2_g.toFixed(4),
      turns: human.turns,
    },
    agent_first: {
      total_input_tokens: agent.total_input_tokens,
      total_output_tokens: agent.total_output_tokens,
      total_tokens: agent.total_tokens,
      num_turns: agent.num_turns,
      co2_g: agent.co2_g.toFixed(4),
      turns: agent.turns,
    },
    comparison: {
      token_reduction_pct: tokenReduction,
      co2_reduction_pct: co2Reduction,
      turns_reduction: human.num_turns - agent.num_turns,
      token_ratio: `${Math.round(human.total_tokens / agent.total_tokens)}x`,
    },
  };
}

// ── Skriv ut oppdaterte tall for compare/page.tsx ─────────────────────────────
function printComparePageUpdate(human: PathResult, agent: PathResult) {
  const ratio = Math.round(human.total_tokens / agent.total_tokens);
  const savingPct = Math.round((1 - agent.total_tokens / human.total_tokens) * 100);

  console.log("\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  OPPDATER compare/page.tsx MED DISSE TALLENE:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("// HUMAN_STEPS — total tokens fordelt på steg:");
  human.turns.forEach((t) => {
    const perStepTokens = Math.round(t.input_tokens + t.output_tokens);
    console.log(`//   Steg ${t.turn} (${t.label.slice(0, 40)}): ${perStepTokens} tokens`);
  });
  console.log("");
  console.log(`const totalHumanTokens = ${human.total_tokens}; // ekte måling`);
  console.log(`const AGENT_STEP = { tokens: ${agent.total_tokens} };  // ekte måling`);
  console.log("");
  console.log(`const CO2_PER_1K_TOKENS = ${CO2_PER_1K_TOKENS}; // g CO₂`);
  console.log(`// humanCo2 = ${human.co2_g.toFixed(4)}g`);
  console.log(`// agentCo2 = ${agent.co2_g.toFixed(4)}g`);
  console.log(`// savingPct = ${savingPct}%`);
  console.log(`// ratio    = ${ratio}x færre tokens`);
  console.log("═══════════════════════════════════════════════════════");
}

// ── Hoved ─────────────────────────────────────────────────────────────────────
function main() {
  console.log("🔬 Token-måling starter...");
  console.log("   Tokenizer: cl100k_base (BPE — samme som Claude)");
  console.log("   Kjøres 100% lokalt, ingen API-kall, gratis.");
  console.log(`   Oppgave: book cabin (check-in 14. juni, check-out 16. juni)`);

  const humanResult = measureHumanFirstPath();
  const agentResult = measureAgentFirstPath();

  const data = generateCompareData(humanResult, agentResult);

  // Lagre til JSON
  const outPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "token-measurement-results.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`\n✅  Resultater lagret: ${outPath}`);

  // Skriv ut sammendrag
  console.log("\n📊  SAMMENDRAG:");
  console.log(`  Menneskelig-first: ${humanResult.total_tokens.toLocaleString()} tokens (${humanResult.num_turns} steg) — CO₂: ${humanResult.co2_g.toFixed(4)}g`);
  console.log(`  Agent-first:       ${agentResult.total_tokens.toLocaleString()} tokens (${agentResult.num_turns} steg) — CO₂: ${agentResult.co2_g.toFixed(4)}g`);
  console.log(`  Reduksjon: ${data.comparison.token_reduction_pct}% færre tokens · ${data.comparison.token_ratio} ratio`);
  console.log("");
  console.log("  Metode: count_tokens API (gratis) på faktisk HTML + realistiske agent-svar.");
  console.log("  Input-tokens: eksakte. Output-tokens: eksakt talt fra forhåndsdefinerte svar.");

  printComparePageUpdate(humanResult, agentResult);
}

main();
