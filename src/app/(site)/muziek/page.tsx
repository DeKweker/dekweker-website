import type { Metadata } from "next";
import { ReleaseCard } from "@/components/ReleaseCard";
import { MusicWaveformMark } from "@/components/PageMotionMarks";
import { getReleases } from "@/lib/content/repository";
import { isFeatureAppearanceForSiteArtist, isPrimaryReleaseForSiteArtist } from "@/lib/content/release-credit";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Muziek",
  path: "/muziek",
  description: "Officiële muziek van De Kweker uit Brugge: eigen releases en tracks waarop hij als feature te horen is."
});

export default async function MusicPage() {
  const releases = await getReleases();
  const ownReleases = releases.filter(isPrimaryReleaseForSiteArtist);
  const features = releases.filter(isFeatureAppearanceForSiteArtist);

  return (
    <div className="page-shell">
      <header className="page-hero music-page-hero" data-scroll-scene>
        <div data-reveal>
          <p className="eyebrow eyebrow-accent">Discografie</p>
          <h1 className="page-title">MUZIEK.</h1>
          <p className="page-intro">Eigen releases staan apart van tracks van andere artiesten waarop De Kweker te horen is.</p>
        </div>
        <div className="page-hero-ghost" aria-hidden="true">8000</div>
        <MusicWaveformMark />
      </header>

      <section className="page-content catalog-block">
        <div className="catalog-heading" data-reveal>
          <div><p className="eyebrow">De Kweker</p><h2>RELEASES.</h2></div>
          <p>De Kweker staat hier als hoofdartiest.</p>
        </div>
        <div className="catalog-grid" data-reveal>
          {ownReleases.map((release, index) => <ReleaseCard key={release.slug} release={release} priority={index < 2} />)}
        </div>
      </section>

      {features.length ? (
        <section className="page-content catalog-block catalog-secondary">
          <div className="catalog-heading" data-reveal>
            <div><p className="eyebrow">Features</p><h2>OOK TE HOREN OP.</h2></div>
            <p>Releases van andere artiesten waarop De Kweker voorkomt.</p>
          </div>
          <div className="catalog-grid catalog-grid-features" data-reveal>
            {features.map((release) => <ReleaseCard key={release.slug} release={release} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
