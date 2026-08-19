import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getReleases } from "@/lib/content/repository";
import { artistNames, fullReleaseCredit, isFeatureAppearanceForSiteArtist } from "@/lib/content/release-credit";
import { releaseSchema } from "@/lib/seo/schema";
import { pageMetadata, socialCardPath } from "@/lib/seo/site";

export async function generateStaticParams() {
  return (await getReleases()).map((release) => ({ slug: release.slug }));
}

function releaseDateLabel(date?: string, year?: number) {
  if (!date) return year ? String(year) : "";
  return new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Brussels" })
    .format(new Date(`${date}T12:00:00Z`));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const release = (await getReleases()).find((item) => item.slug === slug);
  if (!release) return {};
  const credit = fullReleaseCredit(release);
  return pageMetadata({ title: `${release.title} | ${credit}`, path: `/muziek/${release.slug}`, description: release.description ?? `${release.title} van ${credit}.`, image: socialCardPath("release", release.slug), imageAlt: `${release.title} · ${credit}` });
}

export default async function ReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const release = (await getReleases()).find((item) => item.slug === slug);
  if (!release) notFound();
  const isFeature = isFeatureAppearanceForSiteArtist(release);
  const duration = release.durationSeconds ? `${Math.floor(release.durationSeconds / 60)}:${String(release.durationSeconds % 60).padStart(2, "0")}` : null;

  return (
    <div className="page-shell">
      <JsonLd data={releaseSchema(release)} />
      <section className="detail-stage" data-scroll-scene>
        <div className="detail-art-wrap" data-reveal>
          <div className="detail-media" data-tilt>
            {release.coverImage ? <Image src={release.coverImage} alt={`Cover van ${release.title}`} fill priority sizes="(max-width: 900px) 88vw, 520px" /> : <div className="release-art-fallback">8000</div>}
          </div>
        </div>
        <div className="detail-copy" data-reveal>
          <p className="eyebrow eyebrow-accent">{isFeature ? "Feature" : release.kind} / {release.releaseYear}</p>
          <h1>{release.title}</h1>
          <p className="lead">{release.description ?? `${release.title} van ${fullReleaseCredit(release)}.`}</p>
          <div className="meta-stack">
            <div className="meta-line"><span>Hoofdartiest</span><strong>{artistNames(release.primaryArtists)}</strong></div>
            {release.featuredArtists.length ? <div className="meta-line"><span>Feature</span><strong>{artistNames(release.featuredArtists)}</strong></div> : null}
            {release.albumTitle ? <div className="meta-line"><span>Project</span><strong>{release.albumTitle}</strong></div> : null}
            {release.producer ? <div className="meta-line"><span>Productie</span><strong>{release.producer}</strong></div> : null}
            {duration ? <div className="meta-line"><span>Duur</span><strong>{duration}</strong></div> : null}
            <div className="meta-line"><span>Release</span><strong>{releaseDateLabel(release.releaseDate, release.releaseYear)}</strong></div>
          </div>
          <div className="external-links">
            {release.links.map((link) => <a key={link.url} className="button button-secondary" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>)}
            {release.videoUrl ? <a className="button button-secondary" href={release.videoUrl} target="_blank" rel="noopener noreferrer">Video</a> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
