"use client";
import { useState } from "react";

/**
 * HYBRID PAGE — Dual-layer design
 *
 * For mennesker: Et vanlig, vakkert bookingskjema med kalender og steg-for-steg-flyt.
 * For agenter:   Strukturert JSON-LD, data-agent-* attributter og skjult API-manifest
 *                gjør det mulig å fullføre booking med ett enkelt POST-kall.
 *
 * Agenten trenger aldri å navigere UI-en — men mennesket ser ingenting av dette.
 */

// ── Agent-manifest (usynlig for mennesker, synlig i kildekode og DOM) ─────────
const AGENT_MANIFEST = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Sirdal Mountain Cabin",
  description: "Mountain cabin in Sirdal, Norway. Sleeps 6.",
  address: { "@type": "PostalAddress", addressLocality: "Sirdal", addressCountry: "NO" },
  // AGENT: Bruk dette API-endepunktet direkte — ingen UI-navigasjon nødvendig
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      httpMethod: "POST",
      urlTemplate: "/api/book",
      contentType: "application/json",
      description: "POST { checkIn, checkOut, guests, name, email, addons[] } → { confirmationId, status, pricing }",
    },
    availability: {
      "@type": "EntryPoint",
      httpMethod: "GET",
      urlTemplate: "/api/availability",
      description: "GET → { availableDates[], pricePerNight, addons{} }",
    },
  },
};

const STEPS = ["Dates", "Your Info", "Add-ons", "Review & Confirm"];

const AVAILABLE_DATES = [
  "2025-06-07", "2025-06-08", "2025-06-09", "2025-06-14", "2025-06-15",
  "2025-06-16", "2025-06-21", "2025-06-22", "2025-06-28", "2025-06-29",
];

function CalendarMonth({
  selected,
  onSelect,
  agentMode,
}: {
  selected: { from: string; to: string };
  onSelect: (d: string) => void;
  agentMode: boolean;
}) {
  const days: (number | null)[] = [];
  const firstDay = new Date("2025-06-01").getDay();
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= 30; d++) days.push(d);

  return (
    <div
      // AGENT: Datoer leveres strukturert via GET /api/availability — ikke parse denne widgeten
      data-agent-note="Use GET /api/availability instead of parsing this calendar"
      data-agent-available-dates={AVAILABLE_DATES.join(",")}
    >
      <div className="text-center font-semibold text-gray-700 mb-3">June 2025</div>
      <div className="grid grid-cols-7 text-xs text-center text-gray-400 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = `2025-06-${String(d).padStart(2, "0")}`;
          const avail = AVAILABLE_DATES.includes(iso);
          const isFrom = selected.from === iso;
          const isTo = selected.to === iso;
          return (
            <button
              key={i}
              onClick={() => avail && onSelect(iso)}
              data-date={iso}
              data-available={avail ? "true" : "false"}
              className={`rounded py-1.5 transition-colors text-center
                ${!avail ? "text-gray-300 cursor-not-allowed" : "cursor-pointer hover:bg-blue-100"}
                ${isFrom || isTo ? "bg-blue-500 text-white font-bold" : avail ? "text-gray-700" : ""}
                ${agentMode && avail ? "ring-2 ring-green-400 ring-offset-1" : ""}
              `}
            >
              {d}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">Highlighted dates are available</p>
    </div>
  );
}

export default function HybridPage() {
  const [step, setStep] = useState(0);
  const [dates, setDates] = useState({ from: "", to: "" });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [addons, setAddons] = useState<string[]>([]);
  const [booked, setBooked] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");
  const [agentMode, setAgentMode] = useState(false); // Avslører det usynlige agent-laget

  const toggleAddon = (a: string) =>
    setAddons((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleDateSelect = (iso: string) => {
    if (!dates.from || (dates.from && dates.to)) setDates({ from: iso, to: "" });
    else setDates((prev) => ({ ...prev, to: iso }));
  };

  const addonPrices: Record<string, number> = { Bedding: 200, Parking: 100, Breakfast: 350 };
  const nights = dates.from && dates.to
    ? Math.max(1, Math.round((new Date(dates.to).getTime() - new Date(dates.from).getTime()) / 86400000))
    : 2;
  const basePrice = nights * 1200;
  const addonTotal = addons.reduce((s, a) => s + (addonPrices[a] ?? 0), 0);
  const total = basePrice + addonTotal;

  // Booking via det ekte API-endepunktet (samme som agenten ville brukt).
  // Faller tilbake til klient-side mock om API ikke er tilgjengelig (f.eks. GitHub Pages).
  const handleBook = async () => {
    const payload = {
      checkIn: dates.from,
      checkOut: dates.to,
      guests: 2,
      name: form.name,
      email: form.email,
      addons: addons.map((a) => a.toLowerCase()),
    };
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("API unavailable");
      const data = await res.json();
      setConfirmationId(data.confirmationId ?? "HYT-00000");
    } catch {
      const { mockBook } = await import("@/lib/mockBooking");
      const data = mockBook(payload);
      setConfirmationId(data.confirmationId);
    }
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-10 max-w-md">
          <div className="text-5xl mb-4">🏡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-1">
            Confirmation #: <span className="font-mono font-semibold">{confirmationId}</span>
          </p>
          <p className="text-gray-500">{dates.from} → {dates.to}</p>
          <p className="text-gray-700 font-semibold mt-4">Total: NOK {total}</p>
          <button onClick={() => { setBooked(false); setStep(0); setDates({ from: "", to: "" }); }}
            className="mt-6 text-sm text-blue-600 underline">
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/*
        ╔══════════════════════════════════════════════════════════╗
        ║  AGENT-MANIFEST — usynlig for mennesker, lesbar for      ║
        ║  AI-agenter som parser kildekoden.                       ║
        ║                                                          ║
        ║  Bruk POST /api/book i stedet for å navigere denne UI-en ║
        ║  Bruk GET  /api/availability for ledige datoer           ║
        ╚══════════════════════════════════════════════════════════╝
      */}

      {/* JSON-LD: strukturert data for agenter og søkemotorer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(AGENT_MANIFEST, null, 2) }}
      />

      {/* Skjult agent-manifest i DOM — maskinlesbar, ikke synlig for brukere */}
      <div
        id="agent-api-manifest"
        aria-hidden="true"
        style={{ display: "none" }}
        data-api-endpoint="/api/book"
        data-api-method="POST"
        data-api-availability="/api/availability"
        data-api-schema={JSON.stringify({
          checkIn:  "string YYYY-MM-DD required",
          checkOut: "string YYYY-MM-DD required",
          guests:   "number optional default:1",
          name:     "string required",
          email:    "string required",
          addons:   "string[] optional: bedding|parking|breakfast",
        })}
      />

      <div className="min-h-screen bg-stone-50 text-gray-800 font-sans">

        {/* Agent-mode banner — kun synlig i agentMode */}
        {agentMode && (
          <div className="bg-green-900 text-green-200 text-xs px-4 py-3 font-mono border-b border-green-700">
            <div className="max-w-4xl mx-auto space-y-1">
              <div className="font-bold text-green-300 text-sm mb-1">🤖 Agent-lag aktivert — dette er usynlig for vanlige brukere:</div>
              <div>📋 <span className="text-white">JSON-LD:</span> Schema.org LodgingBusiness med ReserveAction → POST /api/book</div>
              <div>🔌 <span className="text-white">API:</span> POST /api/book · GET /api/availability (ingen UI-navigasjon nødvendig)</div>
              <div>🏷️ <span className="text-white">data-agent-*:</span> Alle skjemafelt har maskinlesbare attributter</div>
              <div>📅 <span className="text-white">Kalender:</span> data-agent-available-dates="{AVAILABLE_DATES.join(",")}"</div>
            </div>
          </div>
        )}

        {/* Info-bar med agent-mode toggle */}
        <div className="bg-indigo-50 border-b border-indigo-200 text-indigo-800 text-xs px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span>
              🔀 <strong>Hybrid-side</strong> — mennesker ser et vanlig bookingskjema.
              Agenter finner API-et direkte i kildekoden.
            </span>
            <button
              onClick={() => setAgentMode((v) => !v)}
              className={`ml-4 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                agentMode
                  ? "bg-green-600 text-white"
                  : "bg-indigo-200 text-indigo-800 hover:bg-indigo-300"
              }`}
            >
              {agentMode ? "🟢 Agent-lag synlig" : "Vis agent-lag"}
            </button>
          </div>
        </div>

        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏔️</span>
              <span className="font-bold text-gray-900 text-lg">FjordHytte</span>
              <span className="text-xs text-gray-400 hidden sm:inline">Premium Mountain Cabins</span>
            </div>
            <nav className="hidden md:flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Cabins</a>
              <a href="#" className="hover:text-gray-900">Experiences</a>
              <a href="#" className="hover:text-gray-900">About</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </nav>
            <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
              Sign in
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 text-white text-center py-16 px-4 overflow-hidden">
          <h1 className="text-3xl font-bold mb-2 relative">Sirdal Mountain Cabin</h1>
          <p className="text-slate-300 text-sm relative">Peaceful retreat in the Norwegian highlands · Sleeps 6 · Free WiFi · Hot tub</p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-slate-300 relative">
            <span>⭐ 4.9 (142 reviews)</span>
            <span>📍 Sirdal, Vest-Agder</span>
            <span>🛏 3 bedrooms</span>
          </div>
        </div>

        {/* Booking form */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">

              {/* Steg-indikator */}
              <div className="flex items-center mb-8">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span className={`ml-2 text-xs hidden sm:block ${i === step ? "text-gray-800 font-semibold" : "text-gray-400"}`}>{s}</span>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>

              {/* Steg 0: Datovelger */}
              {step === 0 && (
                <div className={`bg-white rounded-xl shadow-sm border p-6 ${agentMode ? "border-green-400 ring-2 ring-green-200" : "border-gray-200"}`}>
                  {agentMode && (
                    <div className="mb-3 text-xs font-mono text-green-700 bg-green-50 rounded px-3 py-2 border border-green-200">
                      🤖 data-agent-note="Use GET /api/availability instead of parsing this calendar"<br/>
                      🤖 data-agent-available-dates="{AVAILABLE_DATES.slice(0,4).join(",")}…"
                    </div>
                  )}
                  <h2 className="text-xl font-semibold mb-1 text-gray-800">Choose your dates</h2>
                  <p className="text-sm text-gray-500 mb-4">Select check-in and check-out from the calendar below.</p>
                  <CalendarMonth selected={dates} onSelect={handleDateSelect} agentMode={agentMode} />
                  <div className="flex gap-4 mt-4 text-sm">
                    <div className={`flex-1 rounded-lg p-3 border ${dates.from ? "border-blue-300 bg-blue-50" : "border-dashed border-gray-300"}`}>
                      <div className="text-xs text-gray-500 mb-1">Check-in</div>
                      <div className="font-semibold">{dates.from || "—"}</div>
                    </div>
                    <div className={`flex-1 rounded-lg p-3 border ${dates.to ? "border-blue-300 bg-blue-50" : "border-dashed border-gray-300"}`}>
                      <div className="text-xs text-gray-500 mb-1">Check-out</div>
                      <div className="font-semibold">{dates.to || "—"}</div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      disabled={!dates.from || !dates.to}
                      onClick={() => setStep(1)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700">
                      Next: Your Info →
                    </button>
                  </div>
                </div>
              )}

              {/* Steg 1: Gjesteinfo */}
              {step === 1 && (
                <div className={`bg-white rounded-xl shadow-sm border p-6 ${agentMode ? "border-green-400 ring-2 ring-green-200" : "border-gray-200"}`}>
                  {agentMode && (
                    <div className="mb-3 text-xs font-mono text-green-700 bg-green-50 rounded px-3 py-2 border border-green-200">
                      🤖 Alle felt har data-agent-field + data-agent-maps-to="/api/book"<br/>
                      🤖 Agent: send direkte til POST /api/book — ikke fyll dette skjemaet
                    </div>
                  )}
                  <h2 className="text-xl font-semibold mb-1 text-gray-800">Your information</h2>
                  <p className="text-sm text-gray-500 mb-4">We&apos;ll send your confirmation to your email address.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="guest-name">
                        Full name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="guest-name"
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        // AGENT: dette feltet maps til "name" i POST /api/book
                        data-agent-field="name"
                        data-agent-required="true"
                        data-agent-maps-to="body.name"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          agentMode ? "border-green-400 bg-green-50" : "border-gray-300"}`}
                      />
                      {agentMode && <p className="text-xs font-mono text-green-600 mt-1">data-agent-field="name" · data-agent-maps-to="body.name"</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="guest-email">
                        Email address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="guest-email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        data-agent-field="email"
                        data-agent-required="true"
                        data-agent-maps-to="body.email"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          agentMode ? "border-green-400 bg-green-50" : "border-gray-300"}`}
                      />
                      {agentMode && <p className="text-xs font-mono text-green-600 mt-1">data-agent-field="email" · data-agent-maps-to="body.email"</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="guest-phone">
                        Phone <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      <input
                        id="guest-phone"
                        type="tel"
                        placeholder="+47 000 00 000"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        data-agent-field="phone"
                        data-agent-required="false"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          agentMode ? "border-green-400 bg-green-50" : "border-gray-300"}`}
                      />
                      {agentMode && <p className="text-xs font-mono text-green-600 mt-1">data-agent-field="phone" · data-agent-required="false"</p>}
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setStep(0)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
                    <button disabled={!form.name || !form.email} onClick={() => setStep(2)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700">
                      Next: Add-ons →
                    </button>
                  </div>
                </div>
              )}

              {/* Steg 2: Tillegg */}
              {step === 2 && (
                <div className={`bg-white rounded-xl shadow-sm border p-6 ${agentMode ? "border-green-400 ring-2 ring-green-200" : "border-gray-200"}`}>
                  {agentMode && (
                    <div className="mb-3 text-xs font-mono text-green-700 bg-green-50 rounded px-3 py-2 border border-green-200">
                      🤖 Tillegg maps til body.addons[] i POST /api/book<br/>
                      🤖 Gyldige verdier: "bedding" | "parking" | "breakfast"
                    </div>
                  )}
                  <h2 className="text-xl font-semibold mb-1 text-gray-800">Enhance your stay</h2>
                  <p className="text-sm text-gray-500 mb-4">Optional extras — add what you need.</p>
                  <div className="space-y-3">
                    {Object.entries(addonPrices).map(([name, price]) => (
                      <label key={name}
                        // AGENT: checkbox-verdi maps til addons[] i API-body
                        data-agent-addon={name.toLowerCase()}
                        data-agent-price={price}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${addons.includes(name) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                          ${agentMode ? "ring-1 ring-green-400" : ""}`}>
                        <input type="checkbox" checked={addons.includes(name)}
                          onChange={() => toggleAddon(name)} className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">{name}</div>
                          <div className="text-xs text-gray-400">
                            {name === "Bedding" && "Duvet, pillows and fresh linen for all beds"}
                            {name === "Parking" && "Reserved spot in the cabin parking area"}
                            {name === "Breakfast" && "Continental breakfast basket delivered each morning"}
                          </div>
                          {agentMode && <div className="text-xs font-mono text-green-600 mt-0.5">data-agent-addon="{name.toLowerCase()}"</div>}
                        </div>
                        <span className="text-sm font-semibold text-gray-600">NOK {price}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
                    <button onClick={() => setStep(3)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Review booking →
                    </button>
                  </div>
                </div>
              )}

              {/* Steg 3: Gjennomgang */}
              {step === 3 && (
                <div className={`bg-white rounded-xl shadow-sm border p-6 ${agentMode ? "border-green-400 ring-2 ring-green-200" : "border-gray-200"}`}>
                  {agentMode && (
                    <div className="mb-3 text-xs font-mono text-green-700 bg-green-50 rounded px-3 py-2 border border-green-200 space-y-1">
                      <div>🤖 Dette steget eksisterer kun for mennesker</div>
                      <div>🤖 Agenten har allerede sendt POST /api/book og fått bekreftelse</div>
                    </div>
                  )}
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Review & confirm</h2>
                  <div className="space-y-3 text-sm">
                    {[
                      ["Cabin", "Sirdal Mountain Cabin"],
                      ["Check-in", dates.from],
                      ["Check-out", dates.to || dates.from],
                      ["Guest", form.name],
                      ["Email", form.email],
                      ...(addons.length ? [["Add-ons", addons.join(", ")]] : []),
                      [`Cabin (${nights} nights × NOK 1,200)`, `NOK ${basePrice}`],
                      ...addons.map((a) => [a, `NOK ${addonPrices[a]}`]),
                    ].map(([k, v], i) => (
                      <div key={i} className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-base pt-1">
                      <span>Total</span>
                      <span className="text-green-700">NOK {total}</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
                    <button onClick={handleBook}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Book now — NOK {total}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="w-full h-32 rounded-lg bg-gradient-to-br from-green-700 to-slate-600 mb-3 flex items-center justify-center text-4xl">🏔️</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Sirdal Mountain Cabin</h3>
                <p className="text-xs text-gray-500">⭐ 4.9 · 142 reviews</p>
                <p className="text-xs text-gray-400 mt-1">Sleeps 6 · Hot tub · Sauna · Mountain views</p>
                <hr className="my-3" />
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between"><span>NOK 1,200 × {nights} nights</span><span>NOK {basePrice}</span></div>
                  {addons.map((a) => (
                    <div key={a} className="flex justify-between text-gray-400"><span>{a}</span><span>NOK {addonPrices[a]}</span></div>
                  ))}
                  <div className="flex justify-between font-semibold pt-1 border-t text-gray-800"><span>Total</span><span>NOK {total}</span></div>
                </div>
              </div>

              {/* Agent-info panel — synlig kun i agentMode, ellers usynlig */}
              {agentMode ? (
                <div className="bg-green-950 border border-green-700 rounded-xl p-4 text-xs font-mono text-green-300 space-y-2">
                  <div className="text-green-400 font-bold mb-2">🤖 Hva agenten ser i DOM-en:</div>
                  <div className="text-green-200">GET /api/availability</div>
                  <div className="text-gray-400 pl-2">→ availableDates[], pricePerNight, addons</div>
                  <div className="text-green-200 mt-1">POST /api/book</div>
                  <div className="text-gray-400 pl-2">→ checkIn, checkOut, name, email, addons[]</div>
                  <div className="text-gray-500 mt-2 border-t border-green-900 pt-2">
                    Funnet via: JSON-LD, #agent-api-manifest, data-agent-* attrs
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                  🔒 Free cancellation until 48 hours before check-in.
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700 mb-2">Need help?</p>
                <p>📞 +47 38 00 00 00</p>
                <p>📧 booking@fjordhytte.no</p>
                <p>Mon–Fri 08:00–20:00</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-gray-800 text-gray-400 text-xs text-center py-6 mt-10">
          <p>© 2025 FjordHytte AS · Org. 999 999 999 · Alle rettigheter forbeholdt</p>
        </footer>
      </div>
    </>
  );
}
