import { getEvents, getReleases } from "@/lib/content/repository";
import { siteUrl } from "@/lib/seo/site";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] ?? char));
}

export async function GET() {
  const [releases, events] = await Promise.all([getReleases(), getEvents()]);
  const items = [
    ...releases.map((r) => ({ title: r.title, link: `${siteUrl}/muziek/${r.slug}`, date: r.releaseDate ?? `${r.releaseYear}-01-01`, description: r.description ?? `Release van De Kweker: ${r.title}` })),
    ...events.map((e) => ({ title: e.title, link: `${siteUrl}/live/${e.slug}`, date: e.startDate, description: e.description ?? `De Kweker live in ${e.city}` }))
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 30);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>De Kweker · officiële updates</title><link>${siteUrl}</link><description>Muziek en live updates van De Kweker.</description><language>nl-BE</language>${items.map((item) => `<item><title>${escapeXml(item.title)}</title><link>${item.link}</link><guid>${item.link}</guid><pubDate>${new Date(item.date).toUTCString()}</pubDate><description>${escapeXml(item.description)}</description></item>`).join("")}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
