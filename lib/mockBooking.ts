/**
 * Client-side mock for /api/book and /api/availability.
 * Used when the real API routes are unavailable (e.g. GitHub Pages static hosting).
 * Returns identical shape to the real API responses.
 */

export const MOCK_AVAILABLE_DATES = [
  "2025-06-07", "2025-06-08", "2025-06-09",
  "2025-06-14", "2025-06-15", "2025-06-16",
  "2025-06-21", "2025-06-22",
  "2025-06-28", "2025-06-29",
  "2025-07-05", "2025-07-06", "2025-07-07",
  "2025-07-12", "2025-07-13",
  "2025-07-19", "2025-07-20",
  "2025-07-26", "2025-07-27",
];

export const MOCK_AVAILABILITY = {
  cabin: "sirdal-mountain-cabin",
  currency: "NOK",
  pricePerNight: 1200,
  availableDates: MOCK_AVAILABLE_DATES,
  addons: {
    bedding:   { price: 200, description: "Linen and duvet for all beds" },
    parking:   { price: 100, description: "Reserved parking spot" },
    breakfast: { price: 350, description: "Continental breakfast basket daily" },
  },
};

const ADDON_PRICES: Record<string, number> = { bedding: 200, parking: 100, breakfast: 350 };

export function mockBook(body: {
  checkIn: string;
  checkOut: string;
  guests?: number;
  name: string;
  email: string;
  addons?: string[];
}) {
  const { checkIn, checkOut, guests = 1, name, email, addons = [] } = body;
  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000)
  );
  const cabinBase = nights * 1200;
  const addonTotal = addons.reduce((sum, a) => sum + (ADDON_PRICES[a.toLowerCase()] ?? 0), 0);
  const total = cabinBase + addonTotal;
  const confirmationId = "HYT-" + Math.floor(10000 + Math.random() * 90000);

  return {
    confirmationId,
    status: "confirmed",
    cabin: "Sirdal Mountain Cabin",
    checkIn,
    checkOut,
    nights,
    guests,
    name,
    email,
    addons,
    pricing: { cabinBase, addonTotal, total, currency: "NOK" },
    summary: `${name} · ${nights} nights (${checkIn} → ${checkOut}) · NOK ${total}`,
    message: "Your booking is confirmed. A receipt has been sent to " + email,
    _demo: true,
  };
}

/** Wraps fetch("/api/book") with automatic mock fallback */
export async function fetchBook(payload: object) {
  try {
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("API unavailable");
    return await res.json();
  } catch {
    return mockBook(payload as Parameters<typeof mockBook>[0]);
  }
}

/** Wraps fetch("/api/availability") with automatic mock fallback */
export async function fetchAvailability() {
  try {
    const res = await fetch("/api/availability");
    if (!res.ok) throw new Error("API unavailable");
    return await res.json();
  } catch {
    return MOCK_AVAILABILITY;
  }
}
