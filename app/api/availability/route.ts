// Required for Next.js static export (output: 'export')
export const dynamic = "force-static";

export async function GET() {
  const available = [
    "2025-06-07", "2025-06-08", "2025-06-09",
    "2025-06-14", "2025-06-15", "2025-06-16",
    "2025-06-21", "2025-06-22",
    "2025-06-28", "2025-06-29",
    "2025-07-05", "2025-07-06", "2025-07-07",
    "2025-07-12", "2025-07-13",
    "2025-07-19", "2025-07-20",
    "2025-07-26", "2025-07-27",
  ];

  return Response.json({
    cabin: "sirdal-mountain-cabin",
    currency: "NOK",
    pricePerNight: 1200,
    availableDates: available,
    addons: {
      bedding: { price: 200, description: "Linen and duvet for all beds" },
      parking: { price: 100, description: "Reserved parking spot" },
      breakfast: { price: 350, description: "Continental breakfast basket daily" },
    },
  });
}
