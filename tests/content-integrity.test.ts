import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { verifiedArtist, verifiedEvents, verifiedPress, verifiedReleases, verifiedVideos } from "@/content/verified";

const allCollections = [verifiedReleases, verifiedEvents, verifiedPress, verifiedVideos];
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

describe("verified content integrity", () => {
  it("keeps slugs unique within and across public content types", () => {
    const slugs = allCollections.flatMap((items) => items.map((item) => item.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps stable artist IDs and external URLs unique", () => {
    const urls = verifiedArtist.links.map((link) => link.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(() => new URL(url)).not.toThrow();

    const artistIds = verifiedReleases.flatMap((release) => [...release.primaryArtists, ...release.featuredArtists].map((artist) => artist.id));
    expect(artistIds.every(Boolean)).toBe(true);
  });

  it("requires valid dates, ordering and status/rich-result consistency", () => {
    for (const release of verifiedReleases) {
      if (release.releaseDate) {
        expect(release.releaseDate).toMatch(isoDate);
        expect(Number(release.releaseDate.slice(0, 4))).toBe(release.releaseYear);
      }
    }
    for (const event of verifiedEvents) {
      expect(event.startDate).toMatch(isoDate);
      if (event.startDateTime) expect(event.startDateTime.startsWith(event.startDate)).toBe(true);
      if (event.endDateTime && event.startDateTime) expect(Date.parse(event.endDateTime)).toBeGreaterThan(Date.parse(event.startDateTime));
      if (event.status === "past") expect(event.richResult).not.toBe(true);
    }
  });

  it("resolves every local content asset", () => {
    const assets = [
      verifiedArtist.heroImage,
      verifiedArtist.portraitImage,
      verifiedArtist.pressImage,
      ...verifiedReleases.flatMap((release) => release.coverImage ? [release.coverImage] : []),
      ...verifiedEvents.flatMap((event) => event.image ? [event.image] : []),
      ...verifiedPress.flatMap((item) => item.image ? [item.image] : [])
    ];
    for (const asset of assets) expect(existsSync(resolve(process.cwd(), `public${asset}`)), asset).toBe(true);
  });

  it("keeps all public outbound content links syntactically valid and unique per item", () => {
    const releaseLinkSets = verifiedReleases.map((release) => [...release.links.map((link) => link.url), ...(release.videoUrl ? [release.videoUrl] : [])]);
    const linkSets = [
      ...releaseLinkSets,
      ...verifiedEvents.map((event) => [event.ticketUrl, event.sourceUrl, event.organizer?.url].filter((url): url is string => Boolean(url))),
      ...verifiedPress.map((item) => [item.url])
    ];
    for (const urls of releaseLinkSets) expect(new Set(urls).size).toBe(urls.length);
    for (const urls of linkSets) for (const url of urls) expect(() => new URL(url)).not.toThrow();
  });
});
