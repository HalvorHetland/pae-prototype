"use client";
import { useState } from "react";

const STEPS = ["Dates", "Your Info", "Add-ons", "Review & Confirm"];

const AVAILABLE_DATES = [
  "2025-06-07", "2025-06-08", "2025-06-09", "2025-06-14", "2025-06-15",
  "2025-06-16", "2025-06-21", "2025-06-22", "2025-06-28", "2025-06-29",
];

function CalendarMonth({
  selected,
  onSelect,
}: {
  selected: { from: string; to: string };
  onSelect: (d: string) => void;
}) {
  const days = [];
  const firstDay = new Date("2025-06-01").getDay();
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= 30; d++) {
    days.push(d);
  }
  return (
    <div>
      <div className="text-center font-semibold text-gray-700 mb-3">June 2025</div>
      <div className="grid grid-cols-7 text-xs text-center text-gray-400 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = `2025-06-${String(d).padStart(2,"0")}`;
          const avail = AVAILABLE_DATES.includes(iso);
          const isFrom = selected.from === iso;
          const isTo = selected.to === iso;
          return (
            <button
              key={i}
              onClick={() => avail && onSelect(iso)}
              className={`rounded py-1.5 transition-colors text-center
                ${!avail ? "text-gray-300 cursor-not-allowed" : "cursor-pointer hover:bg-blue-100"}
                ${isFrom || isTo ? "bg-blue-500 text-white font-bold" : avail ? "text-gray-700" : ""}
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

export default function HumanPage() {
  const [step, setStep] = useState(0);
  const [dates, setDates] = useState({ from: "", to: "" });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [addons, setAddons] = useState<string[]>([]);
  const [booked, setBooked] = useState(false);

  const toggleAddon = (a: string) =>
    setAddons((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleDateSelect = (iso: string) => {
    if (!dates.from || (dates.from && dates.to)) {
      setDates({ from: iso, to: "" });
    } else {
      setDates((prev) => ({ ...prev, to: iso }));
    }
  };

  const addonPrices: Record<string, number> = { Bedding: 200, Parking: 100, Breakfast: 350 };
  const nights = dates.from && dates.to
    ? Math.max(1, Math.round((new Date(dates.to).getTime() - new Date(dates.from).getTime()) / 86400000))
    : 2;
  const basePrice = nights * 1200;
  const addonTotal = addons.reduce((s, a) => s + (addonPrices[a] ?? 0), 0);
  const total = basePrice + addonTotal;

  if (booked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-10 max-w-md">
          <div className="text-5xl mb-4">🏡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-1">Confirmation #: <span className="font-mono font-semibold">HYT-{Math.floor(Math.random()*90000+10000)}</span></p>
          <p className="text-gray-500">{dates.from} → {dates.to || dates.from}</p>
          <p className="text-gray-700 font-semibold mt-4">Total: NOK {total}</p>
          <button onClick={() => { setBooked(false); setStep(0); }} className="mt-6 text-sm text-blue-600 underline">
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800 font-sans">
      {/* Agent complexity badge */}
      <div className="bg-orange-50 border-b border-orange-200 text-orange-800 text-xs px-4 py-2 text-center font-mono">
        🤖 Agent på denne siden må: laste HTML (8 200 tokens) → finne datovelger → klikke kalender 4× → fylle 3 skjemafelt → navigere 3 steg → velge tillegg → klikke send — <strong>~12 handlinger, ~45 sekunder</strong>
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
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')]" />
        <h1 className="text-3xl font-bold mb-2 relative">Sirdal Mountain Cabin</h1>
        <p className="text-slate-300 text-sm relative">Peaceful retreat in the Norwegian highlands · Sleeps 6 · Free WiFi · Hot tub</p>
        <div className="flex justify-center gap-4 mt-4 text-xs text-slate-300 relative">
          <span>⭐ 4.9 (142 reviews)</span>
          <span>📍 Sirdal, Vest-Agder</span>
          <span>🛏 3 bedrooms</span>
        </div>
      </div>

      {/* Booking form area */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main booking flow */}
          <div className="md:col-span-2">
            {/* Step indicator */}
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

            {/* Step 1: Dates */}
            {step === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Select your dates</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <CalendarMonth selected={dates} onSelect={handleDateSelect} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Check-in</label>
                    <input value={dates.from} readOnly placeholder="Select above"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Check-out</label>
                    <input value={dates.to} readOnly placeholder="Select above"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {dates.from && dates.to ? `${nights} nights selected` : "Pick a check-in and check-out date"}
                  </span>
                  <button disabled={!dates.from}
                    onClick={() => setStep(1)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors">
                    Next: Guest info →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Guest info */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Your information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ola Nordmann"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ola@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+47 000 00 000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    📧 A confirmation will be sent to your email address.
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(0)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
                  <button disabled={!form.name || !form.email}
                    onClick={() => setStep(2)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700">
                    Next: Add-ons →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Add-ons */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-1 text-gray-800">Enhance your stay</h2>
                <p className="text-sm text-gray-500 mb-4">Optional extras — add what you need.</p>
                <div className="space-y-3">
                  {Object.entries(addonPrices).map(([name, price]) => (
                    <label key={name} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${addons.includes(name) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="checkbox" checked={addons.includes(name)} onChange={() => toggleAddon(name)} className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">{name}</div>
                        <div className="text-xs text-gray-400">
                          {name === "Bedding" && "Duvet, pillows and fresh linen for all beds"}
                          {name === "Parking" && "Reserved spot in the cabin parking area"}
                          {name === "Breakfast" && "Continental breakfast basket delivered each morning"}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">NOK {price}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
                  <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Review booking →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Review & confirm</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Cabin</span>
                    <span className="font-medium">Sirdal Mountain Cabin</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium">{dates.from}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-medium">{dates.to || dates.from}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Guest</span>
                    <span className="font-medium">{form.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium">{form.email}</span>
                  </div>
                  {addons.length > 0 && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Add-ons</span>
                      <span className="font-medium">{addons.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Cabin ({nights} nights × NOK 1,200)</span>
                    <span>NOK {basePrice}</span>
                  </div>
                  {addons.map((a) => (
                    <div key={a} className="flex justify-between text-gray-400 text-xs">
                      <span>{a}</span><span>NOK {addonPrices[a]}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>Total</span>
                    <span className="text-green-700">NOK {total}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
                  <button onClick={() => setBooked(true)}
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
              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-green-700 to-slate-600 mb-3 flex items-center justify-center text-4xl">
                🏔️
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Sirdal Mountain Cabin</h3>
              <p className="text-xs text-gray-500">⭐ 4.9 · 142 reviews</p>
              <p className="text-xs text-gray-400 mt-1">Sleeps 6 · Hot tub · Sauna · Mountain views</p>
              <hr className="my-3" />
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between"><span>NOK 1,200 × {nights} nights</span><span>NOK {basePrice}</span></div>
                {addons.map((a) => (
                  <div key={a} className="flex justify-between text-gray-400">
                    <span>{a}</span><span>NOK {addonPrices[a]}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-1 border-t text-gray-800">
                  <span>Total</span><span>NOK {total}</span>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              🔒 Free cancellation until 48 hours before check-in.
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Need help?</p>
              <p>📞 +47 38 00 00 00</p>
              <p>📧 booking@fjordhytte.no</p>
              <p>Mon–Fri 08:00–20:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-xs text-center py-6 mt-10">
        <p>© 2025 FjordHytte AS · Org. 999 999 999 · Alle rettigheter forbeholdt</p>
        <p className="mt-1 flex justify-center gap-4 mt-2">
          <a href="#" className="hover:text-white">Personvern</a>
          <a href="#" className="hover:text-white">Vilkår</a>
          <a href="#" className="hover:text-white">Tilgjengelighet</a>
        </p>
      </footer>
    </div>
  );
}
