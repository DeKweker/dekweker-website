import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "De Kweker",
    short_name: "KWKR",
    description: "Officiële website van De Kweker · Brugge 8000.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a09",
    theme_color: "#0a0a09",
    icons: [
      { src: "/assets/favicon/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/favicon/favicon-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
