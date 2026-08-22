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
  videoLabel?: string;
  updatedAt?: string;
};

export type EventOrganizer = {
  name: string;
  url: string;
};

type LiveEventBase = {
  slug: string;
  title: string;
  startDate: string;
  startDateTime?: string;
  endDateTime?: string;
  venue: string;
  streetAddress?: string;
  postalCode?: string;
  addressLocality?: string;
  city: string;
  country: string;
  status: "scheduled" | "cancelled" | "postponed" | "past";
  appearanceType?:
    | "headline"
    | "guest"
    | "support"
    | "surprise"
    | "festival"
    | "session";
  image?: string;
  description?: string;
  ticketUrl?: string;
  free?: boolean;
  organizer?: EventOrganizer;
  sourceUrl?: string;
  price?: number;
  priceCurrency?: "EUR";
  updatedAt?: string;
};

/**
 * Alleen actuele events die volledig genoeg zijn voor Google's
 * Event rich results mogen richResult:true krijgen.
 *
 * Archiefshows blijven gewoon publieke/indexeerbare pagina's,
 * maar publiceren geen verouderde of incomplete Event JSON-LD.
 */
export type LiveEvent =
  | (LiveEventBase & {
      richResult: true;
      status: "scheduled" | "cancelled" | "postponed";
      startDateTime: string;
      endDateTime: string;
      streetAddress: string;
      postalCode: string;
      organizer: EventOrganizer;
      price: number;
      priceCurrency: "EUR";
    })
  | (LiveEventBase & {
      richResult?: false;
    });

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
