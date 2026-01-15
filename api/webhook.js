import Stripe from "stripe";
import { kv } from "@vercel/kv";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const sig = req.headers["stripe-signature"];
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whsec) return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (err) {
    console.error("Webhook signature verify failed:", err?.message);
    return res.status(400).send(`Webhook Error`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // idempotency: prevent double-processing
      const doneKey = `session:${session.id}:done`;
      const already = await kv.get(doneKey);
      if (already) return res.status(200).json({ received: true });

      const limitedCounts = safeParseJson(session?.metadata?.limited_counts_json) || {};
      const buyerEmail = session?.customer_details?.email || session?.customer_email || "";

      // For each limited product, allocate numbers & increment paid counter
      const allocations = {}; // { productId: [numbers...] }

      for (const [productId, qtyRaw] of Object.entries(limitedCounts)) {
        const qty = clampInt(qtyRaw, 1, 999);

        // Increment paid counter
        const paidKey = `paid:${productId}:count`;
        const newPaid = await kv.incrby(paidKey, qty);

        // Allocate numbering per unit
        // We store a global counter that gives next number (1..total).
        // This is the actual reservation number.
        const seqKey = `seq:${productId}:next`;
        const nums = [];
        for (let i = 0; i < qty; i++) {
          const n = await kv.incr(seqKey); // 1,2,3...
          nums.push(n);
        }
        allocations[productId] = nums;

        // Also keep a “press threshold” helper key (optional but handy)
        // You wanted: press when >=100 paid (press_min)
        // We'll store press_min separately if you want later UI.
        // (You can set these keys manually too; not required.)
        await kv.set(`paid:${productId}:last_email`, String(buyerEmail || ""));
        await kv.set(`paid:${productId}:last_session`, String(session.id));
        await kv.set(`paid:${productId}:last_paid_count`, Number(newPaid));
      }

      // Store order record (so your site can show "jouw nummer" later if you want)
      const order = {
        session_id: session.id,
        email: buyerEmail,
        amount_total: session.amount_total,
        currency: session.currency,
        shipping: session.shipping_details || null,
        allocations,
        created: Date.now()
      };

      await kv.set(`order:${session.id}`, order);
      await kv.set(doneKey, "1");

      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).send("Webhook handler failed");
  }
}

/* ---------------------------
   Helpers
--------------------------- */

function safeParseJson(s) {
  try {
    return JSON.parse(String(s || ""));
  } catch {
    return null;
  }
}

function clampInt(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.round(v)));
}

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}
