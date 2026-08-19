export type RouteTransitionDirection = "left" | "right" | "top" | "bottom";

export type RouteTransitionDescriptor = {
  word: string;
  index: string;
  label: string;
  direction: RouteTransitionDirection;
};

const transitionRoutes: Array<{
  match: (pathname: string) => boolean;
  descriptor: RouteTransitionDescriptor;
}> = [
  {
    match: (pathname) => pathname === "/",
    descriptor: { word: "8000", index: "00", label: "Brugge / De Kweker", direction: "top" }
  },
  {
    match: (pathname) => pathname === "/muziek",
    descriptor: { word: "PLAY", index: "01", label: "Muziek / releases", direction: "left" }
  },
  {
    match: (pathname) => pathname.startsWith("/muziek/"),
    descriptor: { word: "TRACK", index: "01A", label: "Muziek / detail", direction: "left" }
  },
  {
    match: (pathname) => pathname === "/live",
    descriptor: { word: "LIVE", index: "02", label: "Shows / podium", direction: "bottom" }
  },
  {
    match: (pathname) => pathname.startsWith("/live/"),
    descriptor: { word: "STAGE", index: "02A", label: "Live / moment", direction: "bottom" }
  },
  {
    match: (pathname) => pathname === "/media",
    descriptor: { word: "BEELD", index: "03", label: "Media / pers", direction: "right" }
  },
  {
    match: (pathname) => pathname === "/de-kweker",
    descriptor: { word: "8000", index: "04", label: "Profiel / Brugge", direction: "top" }
  },
  {
    match: (pathname) => pathname === "/booking",
    descriptor: { word: "BOOK", index: "06", label: "Booking / contact", direction: "left" }
  },
  {
    match: (pathname) => pathname === "/contact",
    descriptor: { word: "CONTACT", index: "07", label: "De Kweker / contact", direction: "right" }
  },
  {
    match: (pathname) => pathname === "/archief",
    descriptor: { word: "ARCHIEF", index: "08", label: "Live / historiek", direction: "bottom" }
  },
  {
    match: (pathname) => pathname === "/privacy",
    descriptor: { word: "PRIVACY", index: "09", label: "Info / privacy", direction: "right" }
  },
  {
    match: (pathname) => pathname === "/voorwaarden",
    descriptor: { word: "AFSPRAKEN", index: "10", label: "Info / voorwaarden", direction: "left" }
  }
];

const fallbackTransition: RouteTransitionDescriptor = {
  word: "KWKR",
  index: "00",
  label: "De Kweker / 8000",
  direction: "right"
};

export function getRouteTransition(pathname: string): RouteTransitionDescriptor {
  return transitionRoutes.find(({ match }) => match(pathname))?.descriptor ?? fallbackTransition;
}
