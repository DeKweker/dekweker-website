import Stripe from "stripe";
import { kv } from "@vercel/kv";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Expected body:
 * {
 *   items: [{ id, qty, meta: { name, price, tag, image, category, slug, type, variant_size } }],
 * }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const siteUrl = process.env.SITE_URL;
    if (!siteUrl) return res.status(500).json({ error: "Missing SITE_URL env var" });

    const { items } = await readJson(req);
    const safeItems = Array.isArray(items) ? items : [];

    if (!safeItems.length) return res.status(400).json({ error: "Cart is empty" });

    // Load products.json (server side) so we trust prices + limited flags
    const products = await fetchJson(`${siteUrl.replace(/\/$/, "")}/data/products.json`);
    const byId = new Map(products.map((p) => [String(p.id), p]));

    // Build line_items from server-trusted data
    const line_items = [];
    const limitedCounts = {}; // { productId: qty }
    let hasPhysical = false;

    for (const it of safeItems) {
      const id = String(it?.id || "");
      const qty = clampInt(it?.qty, 1, 999);
      const p = byId.get(id);
      if (!p) continue;

      const unitAmount = Math.round(Number(p.price || 0) * 100);
      if (!Number.isFinite(unitAmount) || unitAmount <= 0) continue;

      const name = String(p.name || id);
      const desc = String(p.desc || "");
      const img = p?.images?.front ? absoluteUrl(siteUrl, String(p.images.front)) : undefined;

      const isPhysical = String(p.type || (p.category === "digitaal" ? "digital" : "physical")) !== "digital";
      if (isPhysical) hasPhysical = true;

      // Limited gate: block checkout if paid already at max (best-effort gate)
      if (p?.limited?.enabled) {
        const total = clampInt(p.limited.total ?? 150, 1, 99999);
        const paidKey = `paid:${id}:count`;
        const paid = Number(await kv.get(paidKey)) || 0;

        // If someone tries to buy more than remaining, block
        if (paid + qty > total) {
          return res.status(409).json({
            error: "sold_out",
            message: "Deze drop is uitverkocht."
          });
        }

        limitedCounts[id] = (limitedCounts[id] || 0) + qty;
      }

      line_items.push({
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount: unitAmount,
          product_data: {
            name,
            description: desc.slice(0, 500),
            images: img ? [img] : undefined,
            metadata: {
              product_id: id,
              category: String(p.category || ""),
              slug: String(p.slug || "")
            }
          }
        }
      });
    }

    if (!line_items.length) return res.status(400).json({ error: "No valid items" });

    // Shipping options (only if physical in cart)
    const shipping_options = hasPhysical
      ? [
          {
            shipping_rate_data: {
              display_name: "Ophaling (gratis)",
              type: "fixed_amount",
              fixed_amount: { amount: 0, currency: "eur" }
            }
          },
          {
            shipping_rate_data: {
              display_name: "Verzending (BE)",
              type: "fixed_amount",
              fixed_amount: { amount: 700, currency: "eur" }
            }
          }
        ]
      : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: hasPhysical ? { allowed_countries: ["BE"] } : undefined,
      shipping_options,
      allow_promotion_codes: false,
      success_url: `${siteUrl}/#shop?success=1&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#shop?canceled=1`,
      metadata: {
        source: "kwkr.be",
        limited_counts_json: JSON.stringify(limitedCounts),
        has_physical: hasPhysical ? "1" : "0"
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
}

/* ---------------------------
   Helpers
--------------------------- */

async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

async function fetchJson(url) {
  const r = await fetch(url, { headers: { "cache-control": "no-store" } });
  if (!r.ok) throw new Error(`Failed to fetch: ${url}`);
  const j = await r.json();
  return Array.isArray(j) ? j : (j.products || []);
}

function clampInt(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.round(v)));
}

function absoluteUrl(siteUrl, path) {
  const base = siteUrl.replace(/\/$/, "");
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
