import type { ArtistCredit, ArtistProfile, LiveEvent, Release, VideoItem } from "@/lib/content/types";
import { siteUrl } from "./site";

export const ids = {
  website: `${siteUrl}/#website`,
  artist: `${siteUrl}/de-kweker#artist`,
  person: `${siteUrl}/de-kweker#person`
};

export function artistEntityGraph(artist: ArtistProfile) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ids.website,
        url: siteUrl,
        name: "De Kweker",
        inLanguage: "nl-BE",
        publisher: { "@id": ids.artist }
      },
      {
        "@type": "Person",
        "@id": ids.person,
        name: artist.legalName ?? artist.name,
        alternateName: artist.name,
        url: `${siteUrl}/de-kweker`,
        image: new URL(artist.portraitImage, siteUrl).toString(),
        homeLocation: {
          "@type": "City",
          name: artist.city
        },
        sameAs: artist.links.map((link) => link.url)
      },
      {
        "@type": "MusicGroup",
        "@id": ids.artist,
        name: artist.name,
        url: `${siteUrl}/de-kweker`,
        image: new URL(artist.heroImage, siteUrl).toString(),
        genre: ["Hip hop", "West-Vlaamse rap", "Belgian hip hop"],
        foundingLocation: {
          "@type": "City",
          name: artist.city,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: artist.region
          }
        },
        member: { "@id": ids.person },
        sameAs: artist.links.map((link) => link.url)
      }
    ]
  };
}


function isoDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return undefined;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `PT${minutes ? `${minutes}M` : ""}${remainder ? `${remainder}S` : ""}`;
}

function musicArtist(artist: ArtistCredit) {
  if (artist.id === "artist.de-kweker") return { "@id": ids.artist };
  return {
    "@type": "MusicGroup",
    name: artist.name,
    sameAs: artist.sameAs?.length ? artist.sameAs : undefined
  };
}

export function releaseSchema(release: Release) {
  const url = `${siteUrl}/muziek/${release.slug}`;
  const common = {
    "@context": "https://schema.org",
    name: release.title,
    url,
    datePublished: release.releaseDate,
    image: release.coverImage ? new URL(release.coverImage, siteUrl).toString() : undefined,
    byArtist: release.primaryArtists.map(musicArtist),
    contributor: release.featuredArtists.map(musicArtist),
    producer: release.producer ? { "@type": "Person", name: release.producer } : undefined,
    sameAs: release.links.map((link) => link.url),
    duration: isoDuration(release.durationSeconds),
    inAlbum: release.kind === "track" && release.albumTitle ? { "@type": "MusicAlbum", name: release.albumTitle } : undefined,
    identifier: release.musicBrainzReleaseId
      ? {
          "@type": "PropertyValue",
          propertyID: "MusicBrainz Release MBID",
          value: release.musicBrainzReleaseId
        }
      : undefined
  };

  if (release.kind === "album" || release.kind === "ep") {
    return {
      ...common,
      "@type": "MusicAlbum",
      "@id": `${url}#album`,
      albumReleaseType: release.kind === "ep" ? "https://schema.org/EPRelease" : "https://schema.org/AlbumRelease"
    };
  }

  return {
    ...common,
    "@type": "MusicRecording",
    "@id": `${url}#recording`
  };
}


export function profilePageSchema(artist: ArtistProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/de-kweker#profile`,
    url: `${siteUrl}/de-kweker`,
    mainEntity: {
      "@id": ids.person,
      "@type": "Person",
      name: artist.legalName ?? artist.name,
      alternateName: artist.name,
      image: new URL(artist.portraitImage, siteUrl).toString(),
      sameAs: artist.links.map((link) => link.url)
    }
  };
}

export function eventSchema(event: LiveEvent) {
  if (event.richResult !== true) return null;

  const url = `${siteUrl}/live/${event.slug}`;
  const admissionUrl =
    event.ticketUrl ?? (event.free ? url : undefined);

  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "@id": `${url}#event`,
    name: event.title,
    url,

    startDate: event.startDateTime,
    endDate: event.endDateTime,

    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : event.status === "postponed"
          ? "https://schema.org/EventPostponed"
          : "https://schema.org/EventScheduled",

    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",

    image: event.image
      ? [new URL(event.image, siteUrl).toString()]
      : undefined,

    description: event.description,

    isAccessibleForFree:
      event.free ?? event.price === 0,

    performer: {
      "@type": "MusicGroup",
      "@id": ids.artist,
      name: "De Kweker",
      url: `${siteUrl}/de-kweker`
    },

    organizer: {
      "@type": "Organization",
      name: event.organizer.name,
      url: event.organizer.url
    },

    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.streetAddress,
        postalCode: event.postalCode,
        addressLocality:
          event.addressLocality ?? event.city,
        addressRegion: "West-Vlaanderen",
        addressCountry: event.country
      }
    },

    offers: {
      "@type": "Offer",
      price: event.price,
      priceCurrency: event.priceCurrency,
      ...(admissionUrl ? { url: admissionUrl } : {})
    },

    ...(event.sourceUrl
      ? { sameAs: [event.sourceUrl] }
      : {})
  };
}

export function videoSchema(video: VideoItem) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description ?? video.title,
    thumbnailUrl: [video.thumbnail ?? `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`],
    uploadDate: video.uploadDate,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    publisher: { "@id": ids.artist }
  };
}
