import type { ArtistCredit, Release } from "./types";

export const SITE_ARTIST_ID = "artist.de-kweker";

export function hasArtist(artists: ArtistCredit[], artistId = SITE_ARTIST_ID): boolean {
  return artists.some((artist) => artist.id === artistId);
}

export function isPrimaryReleaseForSiteArtist(release: Release): boolean {
  return hasArtist(release.primaryArtists);
}

export function isFeatureAppearanceForSiteArtist(release: Release): boolean {
  return !isPrimaryReleaseForSiteArtist(release) && hasArtist(release.featuredArtists);
}

export function releaseRelationshipLabel(release: Release): "release" | "feature" | "appearance" {
  if (isPrimaryReleaseForSiteArtist(release)) return "release";
  if (isFeatureAppearanceForSiteArtist(release)) return "feature";
  return "appearance";
}

export function artistNames(artists: ArtistCredit[]): string {
  return artists.map((artist) => artist.name).join(" · ");
}

export function fullReleaseCredit(release: Release): string {
  const primary = artistNames(release.primaryArtists);
  const featured = artistNames(release.featuredArtists);
  return featured ? `${primary} ft. ${featured}` : primary;
}
