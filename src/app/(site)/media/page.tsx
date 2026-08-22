import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { MediaFrameMark } from "@/components/PageMotionMarks";
import { getArtist, getPress, getVideos } from "@/lib/content/repository";
import { videoSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Media & pers",
  path: "/media",
  description: "Pers, interviews, videoclips, livebeelden en officiële profielen van De Kweker uit Brugge."
});

export default async function MediaPage() {
  const [artist, press, videos] = await Promise.all([getArtist(), getPress(), getVideos()]);
  return (
    <div className="page-shell">
      {videos.map((video) => <JsonLd key={video.slug} data={videoSchema(video)} />)}
      <header className="page-hero media-page-hero" data-scroll-scene>
        <div data-reveal><p className="eyebrow eyebrow-accent">Media</p><h1 className="page-title">BEELD.<br />PERS.</h1><p className="page-intro">Videoclips, livebeelden, interviews en officiële kanalen.</p></div>
        <MediaFrameMark />
      </header>

      <section className="media-lead-grid" data-scroll-scene>
        <div className="media-lead-photo" data-depth="24"><Image src="/assets/live/plukketuffer-wijklanken-2026-08-18.jpg" alt="De Kweker live tijdens Wijklanken / PlukkeTuffer" fill priority sizes="(max-width: 900px) 100vw, 58vw" /></div>
        <div className="media-lead-copy" data-reveal><p className="eyebrow eyebrow-accent">19 augustus 2026</p><h2>WIJKLANKEN.</h2><p>Surprise act tijdens de liveshow van PlukkeTuffer in Brugge.</p></div>
      </section>

      <section className="page-content">
        <div className="catalog-heading" data-reveal><div><p className="eyebrow">Video</p><h2>KIJK.</h2></div><p>Officiële clips en video’s waarin De Kweker te horen of te zien is.</p></div>
        <div className="video-grid" data-reveal>
          {videos.map((video) => (
            <article key={video.slug} className="video-card">
              <iframe src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              <div className="video-card-copy"><p className="eyebrow">Video</p><h3>{video.title}</h3></div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-content media-press-section">
        <div className="catalog-heading" data-reveal><div><p className="eyebrow">Pers</p><h2>GESCHREVEN.</h2></div><p>Interviews en artikels rond de muziek.</p></div>
        <div className="press-grid" data-reveal>
          {press[0] ? (
            <a className="press-lead" href={press[0].url} target="_blank" rel="noopener noreferrer">
              {press[0].image ? <Image src={press[0].image} alt="De Kweker in Krant van West-Vlaanderen" fill sizes="(max-width: 900px) 100vw, 62vw" /> : null}
              <div className="press-lead-copy"><p className="eyebrow">{press[0].publisher}</p><h3>{press[0].title}</h3><span className="rule-link">Lees artikel</span></div>
            </a>
          ) : null}
          <div className="press-list">
            {press.slice(1).map((item) => <a className="press-item" key={item.slug} href={item.url} target="_blank" rel="noopener noreferrer"><span>{item.publisher}</span><strong>{item.title}</strong></a>)}
          </div>
        </div>
      </section>

      <section className="page-content media-channels">
        <div className="catalog-heading" data-reveal><div><p className="eyebrow">Officieel</p><h2>KANALEN.</h2></div><p>De profielen die rechtstreeks bij De Kweker horen.</p></div>
        <div className="profile-links" data-reveal>{artist.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>)}</div>
      </section>
    </div>
  );
}
