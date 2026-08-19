import Image from "next/image";
import Link from "next/link";
import { LiveStage } from "@/components/LiveStage";
import { ReleaseCard } from "@/components/ReleaseCard";
import { getArtist, getEvents, getPress, getReleases } from "@/lib/content/repository";
import { formatEventDateCompact } from "@/lib/content/events";
import { fullReleaseCredit, isFeatureAppearanceForSiteArtist, isPrimaryReleaseForSiteArtist } from "@/lib/content/release-credit";

const bookingMail = "mailto:info@kwkr.be?subject=Booking%20De%20Kweker&body=Naam%20organisatie%3A%0ADatum%3A%0ALocatie%3A%0AType%20event%3A%0ATiming%3A%0ABudget%3A%0AExtra%20info%3A";

export default async function HomePage() {
  const [artist, releases, events, press] = await Promise.all([
    getArtist(),
    getReleases(),
    getEvents(),
    getPress()
  ]);

  const own = releases.filter(isPrimaryReleaseForSiteArtist).slice(0, 3);
  const feature = releases.find(isFeatureAppearanceForSiteArtist);
  const liveItems = events.slice(0, 5).map((event) => ({
    slug: event.slug,
    title: event.title,
    meta: `${event.venue} · ${event.city}`,
    date: formatEventDateCompact(event),
    status: event.appearanceType === "surprise" ? "Surprise" : event.status === "past" ? "Archief" : "Live",
    image: event.image
  }));

  return (
    <>
      <section className="home-hero" data-scroll-scene>
        <div className="home-hero-media" data-depth="20">
          <Image src={artist.heroImage} alt="De Kweker in Brugge" fill priority sizes="100vw" />
        </div>
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="home-hero-inner">
          <div className="home-hero-main" data-reveal>
            <p className="eyebrow eyebrow-accent">De Kweker / Brugge</p>
            <h1 className="home-hero-title"><span>DE</span><span className="outline">KWEKER</span></h1>
            <p className="home-hero-lede">{artist.tagline}</p>
            <div className="hero-actions">
              <Link className="button" href="/muziek">Luister naar muziek</Link>
              <Link className="button button-secondary" href="/booking">Booking</Link>
            </div>
          </div>
          <div className="home-hero-index">
            <b>8000</b>
            <span>Brugge / West-Vlaanderen</span>
            <span>Muziek / live / beeld</span>
          </div>
          <div className="home-hero-foot">
            <span><strong>01 / Artiest</strong>De Kweker</span>
            <span><strong>02 / Thuis</strong>Brugge · 8000</span>
            <span><strong>03 / Contact</strong>Shows · features · pers</span>
          </div>
        </div>
        <div className="home-hero-ghost" aria-hidden="true">8000</div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>DE KWEKER <i>•</i> BRUGGE 8000 <i>•</i> WEST-VLAAMSE RAP <i>•</i> LIVE <i>•</i> RELEASES <i>•</i></span>
          <span>DE KWEKER <i>•</i> BRUGGE 8000 <i>•</i> WEST-VLAAMSE RAP <i>•</i> LIVE <i>•</i> RELEASES <i>•</i></span>
        </div>
      </div>

      {feature ? (
        <section className="feature-scene" data-scroll-scene>
          <div className="feature-scene-stage">
            <div className="feature-scene-visual" data-reveal>
              <Link href={`/muziek/${feature.slug}`} className="feature-cover-frame" data-tilt>
                {feature.coverImage ? <Image src={feature.coverImage} alt={`Cover van ${feature.title}`} fill sizes="(max-width: 900px) 88vw, 38vw" /> : <div className="release-art-fallback">8000</div>}
              </Link>
              <div className="feature-shadow-card" aria-hidden="true" />
            </div>
            <div className="feature-scene-copy" data-reveal>
              <p className="eyebrow eyebrow-accent">Nieuwste feature</p>
              <h2>{feature.title}</h2>
              <p className="feature-credit">{fullReleaseCredit(feature)}</p>
              <p>{feature.description}</p>
              <Link className="rule-link" href={`/muziek/${feature.slug}`}>Bekijk de track</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section-releases">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow eyebrow-accent">Eigen releases</p><h2>EIGEN<br />RELEASES.</h2></div>
          <div className="section-heading-aside"><p>Singles van De Kweker, met cover, credits en luisterlinks.</p><Link className="rule-link" href="/muziek">Alle muziek</Link></div>
        </div>
        <div className="editorial-release-grid" data-reveal>
          {own.map((release, index) => <ReleaseCard key={release.slug} release={release} priority={index === 0} />)}
        </div>
      </section>

      <section className="section section-live">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow eyebrow-accent">Live</p><h2>OP HET PODIUM.</h2></div>
          <div className="section-heading-aside"><p>Nieuwe data zodra ze vastliggen. Voorbije shows blijven deel van het archief.</p><Link className="rule-link" href="/live">Live-overzicht</Link></div>
        </div>
        <LiveStage events={liveItems} />
      </section>

      <section className="bio-scene" data-scroll-scene>
        <div className="bio-scene-media" data-depth="34">
          <Image src={artist.portraitImage} alt="Portret van De Kweker" fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <div className="bio-scene-copy" data-reveal>
          <p className="eyebrow eyebrow-accent">De Kweker / Brugge</p>
          <blockquote>8000<br /><span>ZIT ERIN.</span></blockquote>
          <p>{artist.shortBio}</p>
          <Link className="rule-link" href="/de-kweker">Lees de bio</Link>
        </div>
        <div className="bio-scene-number" aria-hidden="true">51°</div>
      </section>

      <section className="section media-section">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow eyebrow-accent">Uit het traject</p><h2>UIT HET<br />ARCHIEF.</h2></div>
          <div className="section-heading-aside"><p>Livebeelden, affiches en pers uit het archief.</p><Link className="rule-link" href="/media">Media</Link></div>
        </div>
        <div className="media-collage" data-scroll-scene>
          <Link className="media-shot media-shot-live" href="/live/dominus-mma-iv-2025" data-depth="20">
            <Image src="/assets/events/dominus-mma-de-kweker.jpg" alt="De Kweker live tijdens Dominus MMA IV" fill sizes="(max-width: 900px) 100vw, 47vw" />
            <span>Live · 31.05.2025</span>
          </Link>
          <Link className="media-shot media-shot-poster" href="/live/villa-west-de-kweker-friends-2026" data-depth="12">
            <Image src="/assets/events/villa-west-open-air-de-kweker.jpg" alt="Affiche De Kweker & Friends bij Villa West" fill sizes="(max-width: 900px) 48vw, 24vw" />
            <span>Villa West</span>
          </Link>
          {press[0]?.image ? (
            <a className="media-shot media-shot-press" href={press[0].url} target="_blank" rel="noopener noreferrer" data-depth="17">
              <Image src={press[0].image} alt="Persfoto De Kweker" fill sizes="(max-width: 900px) 48vw, 25vw" />
              <span>Pers</span>
            </a>
          ) : null}
        </div>
      </section>

      <section className="booking-scene" data-scroll-scene>
        <div className="booking-scene-bg" data-depth="26">
          <Image src="/assets/events/dominus-mma-de-kweker.jpg" alt="" fill sizes="100vw" />
        </div>
        <div className="booking-scene-overlay" aria-hidden="true" />
        <div className="booking-scene-inner" data-reveal>
          <p className="eyebrow eyebrow-accent">Booking / features / pers</p>
          <h2>DE KWEKER<br /><span>OP JOUW EVENT?</span></h2>
          <p>Clubshow, festival, support, feature of pers. Stuur datum, locatie en context naar info@kwkr.be.</p>
          <a className="button" href={bookingMail}>Mail voor booking</a>
        </div>
      </section>
    </>
  );
}
