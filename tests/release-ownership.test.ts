import { describe, expect, it } from "vitest";
import { verifiedReleases } from "@/content/verified";
import {
  fullReleaseCredit,
  isFeatureAppearanceForSiteArtist,
  isPrimaryReleaseForSiteArtist,
  releaseRelationshipLabel
} from "@/lib/content/release-credit";

function release(slug: string) {
  const item = verifiedReleases.find((candidate) => candidate.slug === slug);
  if (!item) throw new Error(`Missing verified release: ${slug}`);
  return item;
}

describe("release ownership", () => {
  it("never treats Geen Slim Shady as a De Kweker primary release", () => {
    const item = release("geen-slim-shady");
    expect(isPrimaryReleaseForSiteArtist(item)).toBe(false);
    expect(isFeatureAppearanceForSiteArtist(item)).toBe(true);
    expect(releaseRelationshipLabel(item)).toBe("feature");
    expect(fullReleaseCredit(item)).toBe("P@FF1 ft. De Kweker");
  });

  it("keeps De Kweker releases in the primary catalog", () => {
    for (const slug of ["lekt-em", "alles-of-niets", "verroader", "moediger"]) {
      expect(isPrimaryReleaseForSiteArtist(release(slug))).toBe(true);
    }
  });

  it("does not use feature as a release format", () => {
    expect(verifiedReleases.every((item) => ["single", "ep", "album", "track"].includes(item.kind))).toBe(true);
  });
});

describe("release catalogue completeness", () => {
  it("has artwork for every public verified release", () => {
    expect(verifiedReleases.every((item) => Boolean(item.coverImage))).toBe(true);
  });

  it("keeps MusicBrainz release identifiers unique where present", () => {
    const ids = verifiedReleases.flatMap((item) => item.musicBrainzReleaseId ? [item.musicBrainzReleaseId] : []);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
