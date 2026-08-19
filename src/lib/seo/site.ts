import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kwkr.be";

export function socialCardPath(type: "site" | "profile" | "release" | "event", slug?: string) {
  const params = new URLSearchParams({ type });
  if (slug) params.set("slug", slug);
  return `/api/og?${params.toString()}`;
}

export const defaultDescription =
  "Officiële website van De Kweker, West-Vlaamse rapper uit Brugge (8000). Muziek, live shows, video's, media en booking.";

export function pageMetadata({
  title,
  description = defaultDescription,
  path = "/",
  image = "/assets/social/og-de-kweker-1200x630.jpg",
  imageAlt = "De Kweker · Brugge 8000"
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
}): Metadata {
  const canonical = new URL(path, siteUrl).toString();
  const imageUrl = new URL(image, siteUrl).toString();
  const brandedTitle = title.includes("De Kweker") ? title : `${title} | De Kweker`;

  return {
    title: { absolute: brandedTitle },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "nl_BE",
      url: canonical,
      siteName: "De Kweker",
      title: brandedTitle,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }]
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [imageUrl]
    }
  };
}
