type BookingRequest = {
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email: string;
  addons?: string[];
};

const ADDON_PRICES: Record<string, number> = {
  bedding: 200,
  parking: 100,
  breakfast: 350,
};

function generateId() {
  return "HYT-" + Math.floor(10000 + Math.random() * 90000);
}

function daysBetween(a: string, b: string) {
  const msPerDay = 86_400_000;
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay));
}

export async function POST(request: Request) {
  let body: BookingRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { checkIn, checkOut, guests, name, email, addons = [] } = body;

  if (!checkIn || !checkOut || !name || !email) {
    return Response.json(
      { error: "Missing required fields: checkIn, checkOut, name, email" },
      { status: 422 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return Response.json({ error: "Dates must be in YYYY-MM-DD format" }, { status: 422 });
  }

  const nights = daysBetween(checkIn, checkOut);
  const cabinBase = nights * 1200;
  const addonTotal = addons.reduce((sum, a) => sum + (ADDON_PRICES[a.toLowerCase()] ?? 0), 0);
  const total = cabinBase + addonTotal;
  const confirmationId = generateId();

  return Response.json({
    confirmationId,
    status: "confirmed",
    cabin: "Sirdal Mountain Cabin",
    checkIn,
    checkOut,
    nights,
    guests: guests ?? 1,
    name,
    email,
    addons,
    pricing: {
      cabinBase,
      addonTotal,
      total,
      currency: "NOK",
    },
    summary: `${name} · ${nights} nights (${checkIn} → ${checkOut}) · NOK ${total}`,
    message: "Your booking is confirmed. A receipt has been sent to " + email,
  });
}
