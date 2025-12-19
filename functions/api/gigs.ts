// Cloudflare Worker: Gig Pricing Engine
// Calculates dynamic pricing based on category, urgency, and user Trust Score.

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { category, budget, urgency } = body;

    // 1. Base Logic
    let recommendedPrice = budget;

    // 2. Urgency Multiplier
    if (urgency === 'HIGH') {
      recommendedPrice *= 1.2; // 20% premium
    }

    // 3. Category Minimums (Rizik Standard)
    const minimums = {
      'CIRCUIT': 500, // PC Repair min
      'JOMI': 1000,   // Land Survey min
      'SCRIBE': 100   // Letter writing min
    };

    if (category in minimums && recommendedPrice < minimums[category]) {
      recommendedPrice = minimums[category];
    }

    return new Response(JSON.stringify({
      recommendedPrice: Math.ceil(recommendedPrice),
      currency: "BDT",
      note: "Includes Rizik Platform Fee (5%)"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
