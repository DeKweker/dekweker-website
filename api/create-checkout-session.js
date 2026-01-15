// /api/create-checkout-session.js
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

    // Stripe client
    const stripe = Stripe(secret);

    // Vercel: req.body kan object zijn OF string
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

    const items = Array.isArray(body.items) ? body.items : [];

    // ✅ log pas nadat items bestaat
    console.log("CHECKOUT ITEMS:", items);

    if (!items.length) {
      return res.status(400).json({ error: "No items" });
    }

    // Bouw line_items vanuit payload: { id, name, price, qty }
    const line_items = items.map((it) => {
      const qty = Math.max(1, Number(it.qty || 1));
      const name = String(it.name || "Item");
      const price = Number(it.price || 0);

      const unit_amount = Math.round(price * 100);

      if (!Number.isFinite(unit_amount) || unit_amount <= 0) {
        throw new Error(`Invalid price for item "${name}" (${price})`);
      }

      return {
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount,
          product_data: { name }
        }
      };
    });

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const origin = `${proto}://${host}`;

    // Shipping keuze in checkout (2 opties)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,

      // Als je pickup aanbiedt, vraagt Stripe hier toch een adres.
      // Dat is oké voor nu (simpelste flow).
      shipping_address_collection: { allowed_countries: ["BE"] },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "eur" },
            display_name: "Ophaling (gratis)"
          }
        },
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
      ],

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
