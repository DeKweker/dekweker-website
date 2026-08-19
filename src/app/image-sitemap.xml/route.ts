import { getArtist, getEvents, getReleases } from "@/lib/content/repository";
import { siteUrl } from "@/lib/seo/site";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character] ?? character));
}

export async function GET() {
  const [artist, releases, events] = await Promise.all([getArtist(), getReleases(), getEvents()]);
  const rows = [
    { page: `${siteUrl}/de-kweker`, image: new URL(artist.heroImage, siteUrl).toString(), title: "De Kweker · Brugge 8000" },
    ...releases.filter((release) => release.coverImage).map((release) => ({ page: `${siteUrl}/muziek/${release.slug}`, image: new URL(release.coverImage!, siteUrl).toString(), title: `${release.title} · De Kweker` })),
    ...events.filter((event) => event.image).map((event) => ({ page: `${siteUrl}/live/${event.slug}`, image: new URL(event.image!, siteUrl).toString(), title: `${event.title} · De Kweker live` }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${rows.map((row) => `<url><loc>${escapeXml(row.page)}</loc><image:image><image:loc>${escapeXml(row.image)}</image:loc><image:title>${escapeXml(row.title)}</image:title></image:image></url>`).join("")}</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
