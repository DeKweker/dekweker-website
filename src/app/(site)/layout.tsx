import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { RouteTransition } from "@/components/RouteTransition";
import { SiteIntro } from "@/components/SiteIntro";
import { SiteMotion } from "@/components/SiteMotion";
import { getArtist } from "@/lib/content/repository";
import { artistEntityGraph } from "@/lib/seo/schema";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const artist = await getArtist();

  return (
    <>
      <JsonLd data={artistEntityGraph(artist)} />
      <SiteIntro />
      <RouteTransition />
      <SiteMotion />
      <a className="skip-link" href="#main-content">Ga naar inhoud</a>
      <Header />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
    </>
  );
}
