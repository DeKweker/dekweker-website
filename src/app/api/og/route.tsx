import { ImageResponse } from "next/og";
import { getArtist, getEvents, getReleases } from "@/lib/content/repository";
import { fullReleaseCredit, isFeatureAppearanceForSiteArtist } from "@/lib/content/release-credit";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 } as const;
const bebasFont = fetch(new URL("./bebas.woff2", import.meta.url)).then((response) => response.arrayBuffer());
const spaceFont = fetch(new URL("./space.woff2", import.meta.url)).then((response) => response.arrayBuffer());

function absoluteAsset(value: string | undefined, origin: string) {
  if (!value) return undefined;
  return new URL(value, origin).toString();
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("nl-BE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Brussels" }).format(new Date(`${value}T12:00:00Z`));
}

async function card({ image, kicker, title, subtitle, marker = "8000", squareImage = false }: { image?: string; kicker: string; title: string; subtitle: string; marker?: string; squareImage?: boolean; }) {
  const [bebas, space] = await Promise.all([bebasFont, spaceFont]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "#080806", color: "#eee9de", fontFamily: "Space" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(circle at 82% 12%, rgba(255,90,31,.18), transparent 280px)" }} />
        {image ? squareImage ? (
          <div style={{ position: "absolute", right: 62, top: 58, width: 514, height: 514, display: "flex", transform: "rotate(2deg)", boxShadow: "0 30px 90px rgba(0,0,0,.45)" }}>
            <img src={image} alt="" width="514" height="514" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ position: "absolute", right: 0, top: 0, width: 580, height: 630, display: "flex" }}>
            <img src={image} alt="" width="580" height="630" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)" }} />
          </div>
        ) : null}
        {image && !squareImage ? <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg,#080806 0%,#080806 38%,rgba(8,8,6,.78) 54%,rgba(8,8,6,.08) 82%)" }} /> : null}
        <div style={{ position: "absolute", left: 58, top: 50, bottom: 48, width: squareImage ? 510 : 600, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#ff5a1f", fontSize: 17, fontWeight: 700, letterSpacing: 2.6, textTransform: "uppercase" }}>{kicker}</div>
          <div style={{ marginTop: 28, display: "flex", maxWidth: squareImage ? 510 : 590, fontFamily: "Bebas", fontSize: title.length > 22 ? 78 : 96, lineHeight: .82, letterSpacing: -1.5, textTransform: "uppercase" }}>{title}</div>
          <div style={{ marginTop: 22, display: "flex", maxWidth: 540, color: "#c5c0b6", fontSize: 22, lineHeight: 1.25 }}>{subtitle}</div>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: squareImage ? 510 : 580 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ display: "flex", fontSize: 17, fontWeight: 700 }}>KWKR.BE</span>
              <span style={{ display: "flex", color: "#8d8981", fontSize: 12, letterSpacing: 1.5 }}>DE KWEKER · BRUGGE</span>
            </div>
            <div style={{ display: "flex", color: "#ff5a1f", fontFamily: "Bebas", fontSize: 70, lineHeight: .75 }}>{marker}</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: -18, bottom: -92, display: "flex", color: "transparent", fontFamily: "Bebas", fontSize: 310, lineHeight: .8, WebkitTextStroke: "1px rgba(238,233,222,.14)" }}>8000</div>
      </div>
    ),
    { ...SIZE, fonts: [{ name: "Bebas", data: bebas, style: "normal", weight: 400 }, { name: "Space", data: space, style: "normal", weight: 400 }] }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const type = url.searchParams.get("type") ?? "site";
  const slug = url.searchParams.get("slug") ?? "";

  if (type === "release" && slug) {
    const release = (await getReleases()).find((item) => item.slug === slug);
    if (release) return card({ image: absoluteAsset(release.coverImage, origin), kicker: isFeatureAppearanceForSiteArtist(release) ? "Feature" : release.kind, title: release.title, subtitle: fullReleaseCredit(release), marker: release.releaseYear.toString(), squareImage: true });
  }

  if (type === "event" && slug) {
    const event = (await getEvents()).find((item) => item.slug === slug);
    if (event) return card({ image: absoluteAsset(event.image, origin), kicker: "Live", title: event.title, subtitle: `${dateLabel(event.startDate)} · ${event.venue} · ${event.city}` });
  }


  const artist = await getArtist();
  if (type === "profile") return card({ image: absoluteAsset(artist.heroImage, origin), kicker: "Artiest", title: artist.name, subtitle: "West-Vlaamse rap uit Brugge · 8000" });
  return card({ image: absoluteAsset(artist.heroImage, origin), kicker: "KWKR.BE", title: artist.name, subtitle: "Muziek · live · media · booking" });
}
