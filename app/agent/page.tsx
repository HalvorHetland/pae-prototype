"use client";
import { useState } from "react";
import { fetchBook, fetchAvailability } from "@/lib/mockBooking";

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    checkIn: "2025-06-14",
    checkOut: "2025-06-16",
    guests: 2,
    name: "Halvor Hetland",
    email: "halvor@example.com",
    addons: ["bedding", "breakfast"],
  },
  null,
  2
);

const SCHEMA = {
  endpoint: "POST /api/book",
  description: "Create a cabin booking. Returns confirmation immediately.",
  request: {
    checkIn: "string  // YYYY-MM-DD, required",
    checkOut: "string  // YYYY-MM-DD, required",
    guests: "number  // optional, default 1",
    name: "string   // guest full name, required",
    email: "string  // guest email, required",
    "addons[]": "string  // optional: 'bedding' | 'parking' | 'breakfast'",
  },
  response: {
    confirmationId: "string  // e.g. HYT-38291",
    status: "string  // 'confirmed'",
    checkIn: "string",
    checkOut: "string",
    nights: "number",
    pricing: {
      cabinBase: "number  // nights × 1200 NOK",
      addonTotal: "number",
      total: "number",
      currency: "string  // 'NOK'",
    },
    summary: "string  // human-readable summary",
    message: "string  // confirmation message",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Sirdal Mountain Cabin",
  description: "Peaceful mountain cabin in Sirdal, Norway. Sleeps 6.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sirdal",
    addressRegion: "Vest-Agder",
    addressCountry: "NO",
  },
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      httpMethod: "POST",
      urlTemplate: "/api/book",
      contentType: "application/json",
    },
  },
};

export default function AgentPage() {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availData, setAvailData] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const json = await fetchBook(JSON.parse(payload));
      setResponse(JSON.stringify(json, null, 2));
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvail = async () => {
    const json = await fetchAvailability();
    setAvailData(JSON.stringify(json, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Agent badge */}
      <div className="bg-green-950 border-b border-green-700 text-green-300 text-xs px-4 py-2 text-center">
        ⚡ Agent på denne siden: <strong>send 1 POST-forespørsel → ferdig</strong> · ~150 tokens · ~0.3s · 1 handling
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs text-green-400 uppercase tracking-widest">Agent-First API</span>
          <h1 className="text-2xl font-bold text-white mt-1">Sirdal Mountain Cabin — Booking API</h1>
          <p className="text-gray-400 text-sm mt-1">
            Machine-readable booking interface. No UI traversal required.
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 mb-8 flex items-center gap-3">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Base URL</span>
          <code className="text-green-400 text-sm">http://localhost:3000</code>
        </div>

        {/* Endpoints */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={fetchAvail}
            className="text-left bg-gray-900 border border-gray-700 hover:border-green-600 rounded-lg p-4 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-800 text-blue-300 text-xs px-2 py-0.5 rounded">GET</span>
              <code className="text-sm text-white">/api/availability</code>
            </div>
            <p className="text-xs text-gray-400">Returns available dates, prices, and addon options as JSON.</p>
            <p className="text-xs text-green-500 mt-2">Click to fetch →</p>
          </button>
          <div className="text-left bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-800 text-green-300 text-xs px-2 py-0.5 rounded">POST</span>
              <code className="text-sm text-white">/api/book</code>
            </div>
            <p className="text-xs text-gray-400">Create a booking. Returns confirmation with ID and total.</p>
            <p className="text-xs text-gray-500 mt-2">Try it below ↓</p>
          </div>
        </div>

        {/* Availability response */}
        {availData && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wide">GET /api/availability — Response</span>
              <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">200 OK</span>
            </div>
            <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-green-300 overflow-auto max-h-64">
              {availData}
            </pre>
          </div>
        )}

        {/* Schema */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-3">Request Schema</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">POST /api/book — Request body</div>
              <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-yellow-300 overflow-auto">
                {JSON.stringify(SCHEMA.request, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Response</div>
              <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-blue-300 overflow-auto">
                {JSON.stringify(SCHEMA.response, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* JSON-LD info */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-3">Structured Data (JSON-LD)</h2>
          <p className="text-xs text-gray-500 mb-2">This page embeds machine-readable metadata in the HTML &lt;head&gt; so agents can discover the booking endpoint without parsing UI.</p>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-purple-300 overflow-auto">
            {JSON.stringify(JSON_LD, null, 2)}
          </pre>
        </div>

        {/* Live Try-it */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-3">Try it — POST /api/book</h2>
          <p className="text-xs text-gray-500 mb-3">Edit the JSON payload and click Send. This is a real API call.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                <span>Request body</span>
                <button
                  onClick={() => setPayload(DEFAULT_PAYLOAD)}
                  className="text-gray-500 hover:text-gray-300 text-xs"
                >
                  reset
                </button>
              </div>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-yellow-200 font-mono resize-none focus:outline-none focus:border-green-500"
                spellCheck={false}
              />
              <button
                onClick={submit}
                disabled={loading}
                className="mt-2 w-full bg-green-700 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "⚡ Send POST request"}
              </button>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Response</div>
              <div className="h-64 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs overflow-auto">
                {!response && !error && !loading && (
                  <span className="text-gray-600">Response will appear here…</span>
                )}
                {loading && <span className="text-gray-400 animate-pulse">Waiting…</span>}
                {error && <span className="text-red-400">{error}</span>}
                {response && (
                  <pre className="text-green-300 whitespace-pre-wrap">{response}</pre>
                )}
              </div>
              {response && (
                <div className="mt-2 bg-green-950 border border-green-700 rounded-lg px-3 py-2 text-xs text-green-300 flex items-center gap-2">
                  <span className="text-green-400 font-bold">200</span>
                  <span>Booking confirmed · 1 request · done</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-gray-800 pt-6 text-xs text-gray-600">
          <p>This page also contains a <code className="text-gray-400">application/ld+json</code> script tag with Schema.org metadata.</p>
          <p className="mt-1">An agent can discover and call this API without parsing any visual HTML.</p>
        </div>
      </div>
    </div>
  );
}
