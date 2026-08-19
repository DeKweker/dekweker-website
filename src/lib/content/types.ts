export type ExternalLink = { label: string; url: string };

export type ArtistProfile = {
  name: string;
  legalName?: string;
  tagline: string;
  shortBio: string;
  city: string;
  region: string;
  country: string;
  heroImage: string;
  portraitImage: string;
  pressImage: string;
  links: ExternalLink[];
};

/**
 * Canonical music-artist reference used by release data.
 * `id` is stable and must not be derived from display copy.
 */
export type ArtistCredit = {
  id: string;
  name: string;
  sameAs?: string[];
};

export type Release = {
  slug: string;
  title: string;
  /** Release format only. Whether De Kweker is primary or featured is derived from artist relations. */
  kind: "single" | "ep" | "album" | "track";
  releaseYear: number;
  releaseDate?: string;
  durationSeconds?: number;
  musicBrainzReleaseId?: string;
  coverImage?: string;
  description?: string;
  albumTitle?: string;
  primaryArtists: ArtistCredit[];
  featuredArtists: ArtistCredit[];
  producer?: string;
  links: ExternalLink[];
  videoUrl?: string;
  updatedAt?: string;
};

export type LiveEvent = {
  slug: string;
  title: string;
  /** Local calendar date in YYYY-MM-DD. Never invent a clock time when none is known. */
  startDate: string;
  /** Exact ISO timestamp only when the published start time is known. */
  startDateTime?: string;
  /** Exact ISO timestamp only when the published end time is known. */
  endDateTime?: string;
  venue: string;
  city: string;
  country: string;
  status: "scheduled" | "cancelled" | "postponed" | "past";
  appearanceType?: "headline" | "guest" | "support" | "surprise" | "festival" | "session";
  image?: string;
  description?: string;
  ticketUrl?: string;
  free?: boolean;
  updatedAt?: string;
};

export type PressItem = {
  slug: string;
  title: string;
  publisher: string;
  publishedAt?: string;
  url: string;
  image?: string;
  excerpt?: string;
};

export type VideoItem = {
  slug: string;
  title: string;
  youtubeId: string;
  uploadDate: string;
  thumbnail?: string;
  description?: string;
};
