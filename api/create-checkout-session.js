const Stripe = require("stripe");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY env var" });
    }

    const stripe = Stripe(secret);

    // Verwacht JSON body
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const shippingChoice = body.shippingChoice || "pickup"; // "pickup" | "ship"

    if (!items.length) {
      return res.status(400).json({ error: "No items" });
    }

    // Bouw line_items vanuit je cart payload
    // item shape: { name, price, qty }
  const line_items = items.map((it) => ({
  quantity: Number(it.qty || 1),
  price_data: {
    currency: "eur",
    unit_amount: Math.round(Number(it.meta?.price || 0) * 100),
    product_data: {
      name: String(it.meta?.name || "Item")
    }
  }
}));


    const origin =
      req.headers["origin"] ||
      `https://${req.headers["x-forwarded-host"] || req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Shipping keuze: verzenden (+€7) of gratis pickup
      shipping_address_collection: shippingChoice === "ship"
        ? { allowed_countries: ["BE"] }
        : undefined,

      shipping_options: shippingChoice === "ship"
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 700, currency: "eur" },
                display_name: "Verzending (BE)",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 2 },
                  maximum: { unit: "business_day", value: 5 }
                }
              }
            }
          ]
        : undefined,

      // Success/cancel terug naar je site
      success_url: `${origin}/?success=1&sid={CHECKOUT_SESSION_ID}#shop`,
      cancel_url: `${origin}/?canceled=1#shop`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err?.message || String(err)
    });
  }
};
