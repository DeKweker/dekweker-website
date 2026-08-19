import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { defaultDescription, siteUrl } from "@/lib/seo/site";
import { siteIntroBootstrap } from "@/lib/ui/site-intro";
import "./globals.css";

const shouldIndex = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080806",
  colorScheme: "dark"
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "De Kweker | West-Vlaamse rapper uit Brugge (8000)",
    template: "%s | De Kweker"
  },
  description: defaultDescription,
  applicationName: "De Kweker",
  category: "music",
  keywords: ["De Kweker", "rapper Brugge", "West-Vlaamse rap", "Brugge 8000", "Belgische hiphop"],
  creator: "De Kweker",
  publisher: "De Kweker",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: siteUrl,
    siteName: "De Kweker",
    title: "De Kweker | West-Vlaamse rapper uit Brugge (8000)",
    description: defaultDescription,
    images: [{ url: "/assets/social/og-de-kweker-1200x630.jpg", width: 1200, height: 630, alt: "De Kweker · Brugge 8000" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "De Kweker | West-Vlaamse rapper uit Brugge (8000)",
    description: defaultDescription,
    images: ["/assets/social/og-de-kweker-1200x630.jpg"]
  },
  robots: shouldIndex ? undefined : { index: false, follow: false },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/favicon/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/assets/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" }
    ],
    apple: [{ url: "/assets/favicon/favicon-180x180.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl-BE" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteIntroBootstrap }} />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
