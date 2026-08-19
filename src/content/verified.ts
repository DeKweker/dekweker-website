import type { ArtistCredit, ArtistProfile, LiveEvent, PressItem, Release, VideoItem } from "@/lib/content/types";

export const verifiedArtist: ArtistProfile = {
  name: "De Kweker",
  legalName: "Joey De Queecker",
  tagline: "West-Vlaamse rap uit Brugge. 8000 zonder vertaling.",
  shortBio:
    "De Kweker is een rapper uit Brugge die schrijft en performt in het West-Vlaams. Persoonlijke tracks, harde observaties en live-energie vertrekken vanuit dezelfde plaats: de stad en de taal waarin hij leeft.",
  city: "Brugge",
  region: "West-Vlaanderen",
  country: "BE",
  heroImage: "/assets/portrait/bio/kwekerbio-wall-wide-1600.webp",
  portraitImage: "/assets/portrait/bio/kwekerbio-5-960.webp",
  pressImage: "/assets/press/kw-davy-coghe.jpg",
  links: [
    { label: "Spotify", url: "https://open.spotify.com/artist/2v5Tuugqs8s4vaONc286EG" },
    { label: "YouTube", url: "https://www.youtube.com/@De.Kweker" },
    { label: "Instagram", url: "https://www.instagram.com/dekweker_/" },
    { label: "TikTok", url: "https://www.tiktok.com/@de.kweker" },
    { label: "SoundCloud", url: "https://soundcloud.com/dekweker" },
    { label: "Apple Music", url: "https://music.apple.com/be/artist/de-kweker/1747400203?l=nl" },
    { label: "VI.BE", url: "https://vi.be/platform/DeKweker" },
    { label: "Bandcamp", url: "https://dekweker.bandcamp.com/" },
    { label: "MusicBrainz", url: "https://musicbrainz.org/artist/f9fc6031-beef-42b2-97f4-f66845a6d557" }
  ]
};

export const deKwekerCredit: ArtistCredit = {
  id: "artist.de-kweker",
  name: "De Kweker",
  sameAs: verifiedArtist.links.map((link) => link.url)
};

const paff1Credit: ArtistCredit = { id: "musicArtist.paff1", name: "P@FF1" };
const kingSkamCredit: ArtistCredit = { id: "musicArtist.king-skam", name: "King Skam" };
const denOnbekendenSoldaatCredit: ArtistCredit = { id: "musicArtist.den-onbekenden-soldaat", name: "Den Onbekenden Soldaat" };

export const verifiedReleases: Release[] = [
  {
    slug: "geen-slim-shady",
    title: "Geen Slim Shady",
    kind: "single",
    releaseYear: 2026,
    coverImage: "/assets/releases/geen-slim-shady-cover.jpg",
    description: "Geen Slim Shady van P@FF1, met De Kweker als feature.",
    primaryArtists: [paff1Credit],
    featuredArtists: [deKwekerCredit],
    links: [
      { label: "Spotify", url: "https://open.spotify.com/track/6YmPKfzFqqfiqAT4XHLB0I" },
      { label: "Apple Music", url: "https://music.apple.com/us/album/geen-slim-shady-feat-de-kweker-single/6781121572" },
    ],
    videoUrl: "https://www.youtube.com/watch?v=J7XVdP0mvNk",
    videoLabel: "Lyric video",
  },
  {
    slug: "wurggreep",
    title: "Wurggreep",
    kind: "single",
    releaseYear: 2025,
    releaseDate: "2025-04-16",
    coverImage: "/assets/releases/wurggreep-cover.jpg",
    description: "Wurggreep van King Skam, met De Kweker als feature.",
    primaryArtists: [kingSkamCredit],
    featuredArtists: [deKwekerCredit],
    links: [
      { label: "Spotify", url: "https://open.spotify.com/track/142P3u75eFBI4x9FvNmUS7" },
      { label: "Apple Music", url: "https://music.apple.com/be/song/1835851808" },
      { label: "Alle platformen", url: "https://distrokid.com/hyperfollow/kingskam/wurggreep-feat-de-kweker-2" },
    ],
  },
  {
    slug: "verre-alverwege",
    title: "Verre Alverwege",
    kind: "track",
    releaseYear: 2023,
    coverImage: "/assets/releases/verre-alverwege-cover.jpg",
    albumTitle: "Balanse",
    description: "Verre Alverwege van Den Onbekenden Soldaat, met De Kweker als feature op het album Balanse.",
    primaryArtists: [denOnbekendenSoldaatCredit],
    featuredArtists: [deKwekerCredit],
    links: [
      { label: "Spotify", url: "https://open.spotify.com/track/1wlP7iJDeiEmhTUxHA1kKv" },
      { label: "Apple Music", url: "https://music.apple.com/us/album/balanse/1836352427" },
    ],
  },
  {
    slug: "lekt-em",
    title: "Lekt Em",
    kind: "single",
    releaseYear: 2025,
    releaseDate: "2025-06-20",
    durationSeconds: 144,
    musicBrainzReleaseId: "93554bcd-a2a2-4c08-9244-83c297ff25ff",
    coverImage: "/assets/releases/lekt-em-cover.jpg",
    description: "De Kweker, geproduceerd door NUMB.",
    primaryArtists: [deKwekerCredit],
    featuredArtists: [],
    producer: "NUMB",
    links: [
      { label: "Spotify", url: "https://open.spotify.com/track/2KA0CEMiPrOeGTHoj5rMhO" },
      { label: "Apple Music", url: "https://music.apple.com/be/album/lekt-em-single/1838887948?l=nl" },
      { label: "SoundCloud", url: "https://soundcloud.com/dekweker/lektem" },
      { label: "YouTube", url: "https://www.youtube.com/watch?v=a6rZxdtALg4" },
      { label: "Alle platformen", url: "https://distrokid.com/hyperfollow/dekweker/lekt-em-2" },
    ],
    videoUrl: "https://www.youtube.com/watch?v=8Q0LB68kxRw",
    videoLabel: "Videoclip",
  },
  {
    slug: "alles-of-niets",
    title: "Alles of Niets",
    kind: "single",
    releaseYear: 2024,
    durationSeconds: 205,
    musicBrainzReleaseId: "4e6c99e7-9aa4-4c9c-b5b7-ddb3540eef62",
    coverImage: "/assets/releases/alles-of-niets-cover.jpg",
    primaryArtists: [deKwekerCredit],
    featuredArtists: [kingSkamCredit],
    links: [
      { label: "Apple Music", url: "https://music.apple.com/us/album/alles-of-niets-feat-king-skam-single/1835813867" },
      { label: "Alle platformen", url: "https://distrokid.com/hyperfollow/dekweker/alles-of-niets-feat-king-skam" },
      { label: "Pers", url: "https://pokoemagazine.nl/de-kweker-ft-king-skam-alles-of-niets/" },
    ],
  },
  {
    slug: "verroader",
    title: "V(err)oader",
    kind: "single",
    releaseYear: 2024,
    releaseDate: "2024-06-09",
    durationSeconds: 170,
    musicBrainzReleaseId: "909efd74-67b2-4e48-897d-52bf11ee453e",
    coverImage: "/assets/releases/verroader-cover.jpg",
    primaryArtists: [deKwekerCredit],
    featuredArtists: [],
    links: [
      { label: "Spotify", url: "https://open.spotify.com/album/3JMTQ6t3r97LvvrHPAmQTv" },
      { label: "Apple Music", url: "https://music.apple.com/be/album/v-err-oader-single/1835805687?l=nl" },
      { label: "SoundCloud", url: "https://soundcloud.com/dekweker/verroader-mix3mastered-wav" },
      { label: "Alle platformen", url: "https://distrokid.com/hyperfollow/dekweker/verroader" },
      { label: "Pers", url: "https://pokoemagazine.nl/de-kweker-verroader/" },
    ],
  },
  {
    slug: "moediger",
    title: "Moed(ig)er",
    kind: "single",
    releaseYear: 2024,
    durationSeconds: 188,
    musicBrainzReleaseId: "fb9492fa-d1c2-4956-b890-6711b3d12015",
    coverImage: "/assets/releases/moediger-cover.jpg",
    primaryArtists: [deKwekerCredit],
    featuredArtists: [],
    links: [
      { label: "Apple Music", url: "https://music.apple.com/be/album/moed-ig-er-single/1835722782" },
      { label: "Alle platformen", url: "https://distrokid.com/hyperfollow/dekweker/moediger" },
      { label: "Pers", url: "https://pokoemagazine.nl/de-kweker-moediger/" },
    ],
  }
];

export const verifiedEvents: LiveEvent[] = [
  {
    slug: "wijklanken-plukketuffer-2026",
    title: "Wijklanken / PlukkeTuffer",
    startDate: "2026-08-19",
    venue: "Wijklanken",
    city: "Brugge",
    country: "BE",
    status: "past",
    appearanceType: "surprise",
    image: "/assets/live/plukketuffer-wijklanken-2026-08-19.jpg",
    description: "Surprise set van De Kweker tijdens de liveshow van PlukkeTuffer."
  },
  {
    slug: "villa-west-de-kweker-friends-2026",
    title: "De Kweker & Friends · Villa West",
    startDate: "2026-08-07",
    startDateTime: "2026-08-07T20:30:00+02:00",
    endDateTime: "2026-08-07T22:00:00+02:00",
    venue: "Villa Bota",
    city: "Brugge",
    country: "BE",
    status: "past",
    image: "/assets/events/villa-west-open-air-de-kweker.jpg",
    description: "Open-air liveshow in Brugge met De Kweker & Friends.",
    free: true
  },
  {
    slug: "friday-after-hours-2026",
    title: "Friday After Hours",
    startDate: "2026-05-15",
    startDateTime: "2026-05-15T20:00:00+02:00",
    venue: "De Kelk",
    city: "Brugge",
    country: "BE",
    status: "past",
    image: "/assets/events/friday-afterhours-affiche-900.webp"
  },
  {
    slug: "cafe-bambino-roeselare-2025",
    title: "Café Bambino",
    startDate: "2025-07-05",
    venue: "Café Bambino",
    city: "Roeselare",
    country: "BE",
    status: "past"
  },
  {
    slug: "dominus-mma-iv-2025",
    title: "Dominus MMA IV: Solis",
    startDate: "2025-05-31",
    startDateTime: "2025-05-31T20:00:00+02:00",
    venue: "Koninklijke Stallingen",
    city: "Oostende",
    country: "BE",
    status: "past",
    image: "/assets/events/dominus-mma-de-kweker.jpg",
    description: "Gastoptreden bij King Skam."
  }
];

export const verifiedPress: PressItem[] = [
  {
    slug: "kw-interview",
    title: "Joey ‘De Kweker’ De Queecker rapt in het Brugs",
    publisher: "Krant van West-Vlaanderen",
    url: "https://kw.be/nieuws/cultuur/muziek/joey-de-kweker-de-queecker-31-rapt-in-het-brugs-mijn-moeilijke-jeugd-vormt-een-belangrijke-inspiratie/",
    image: "/assets/press/kw-davy-coghe.jpg"
  },
  {
    slug: "pokoe-verroader",
    title: "De Kweker · V(err)oader",
    publisher: "Pokoe Magazine",
    publishedAt: "2024-06-09",
    url: "https://pokoemagazine.nl/de-kweker-verroader/"
  },
  {
    slug: "pokoe-alles-of-niets",
    title: "De Kweker ft. King Skam · Alles of Niets",
    publisher: "Pokoe Magazine",
    publishedAt: "2024-07-10",
    url: "https://pokoemagazine.nl/de-kweker-ft-king-skam-alles-of-niets/"
  },
  {
    slug: "pokoe-moediger",
    title: "De Kweker · Moed(ig)er",
    publisher: "Pokoe Magazine",
    publishedAt: "2024-11-13",
    url: "https://pokoemagazine.nl/de-kweker-moediger/"
  },
  {
    slug: "pokoe-wurggreep",
    title: "King Skam ft. De Kweker · Wurggreep",
    publisher: "Pokoe Magazine",
    publishedAt: "2025-04-16",
    url: "https://pokoemagazine.nl/king-skam-ft-de-kweker-wurggreep/"
  }
];

export const verifiedVideos: VideoItem[] = [
  {
    slug: "lekt-em-video",
    title: "De Kweker · Lekt Em",
    youtubeId: "8Q0LB68kxRw",
    uploadDate: "2025-09-28",
    description: "Officiële videoclip."
  },
  {
    slug: "geen-slim-shady-lyric-video",
    title: "P@FF1 ft. De Kweker · Geen Slim Shady",
    youtubeId: "J7XVdP0mvNk",
    uploadDate: "2026-06-20",
    description: "Lyric video."
  }
];
