import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { EventRow } from "@/components/EventRow";
import { LiveStageMark } from "@/components/PageMotionMarks";
import { getEvents } from "@/lib/content/repository";
import { todayInBrussels } from "@/lib/content/events";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Live shows",
  path: "/live",
  description: "Live shows, concertdata en podiumarchief van De Kweker uit Brugge."
});

export default async function LivePage() {
  const events = await getEvents();
  const today = todayInBrussels();
  const upcoming = events.filter((event) => event.status === "scheduled" && event.startDate >= today);
  const past = events.filter((event) => !upcoming.includes(event));
  const lead = past.find((event) => event.image);

  return (
    <div className="page-shell">
      <header className="page-hero live-page-hero" data-scroll-scene>
        <div data-reveal><p className="eyebrow eyebrow-accent">Live</p><h1 className="page-title">OP HET<br />PODIUM.</h1><p className="page-intro">Nieuwe data zodra ze publiek zijn. Voorbije shows blijven hier staan met beeld en context.</p></div>
        <LiveStageMark />
      </header>

      {lead?.image ? (
        <Link className="live-feature" href={`/live/${lead.slug}`} data-scroll-scene>
          <div className="live-feature-image" data-depth="22"><Image src={lead.image} alt={`De Kweker live tijdens ${lead.title}`} fill priority sizes="100vw" /></div>
          <div className="live-feature-copy" data-reveal><p className="eyebrow eyebrow-accent">Laatste livebeeld</p><h2>{lead.title}</h2><p>{lead.appearanceType === "surprise" ? "Surprise act" : "Live"} · {lead.city}</p><span className="rule-link">Bekijk moment</span></div>
        </Link>
      ) : null}

      <section className="page-content live-index">
        <div className="live-index-block">
          <p className="eyebrow eyebrow-accent">Aankomend</p>
          <div className="event-list">{upcoming.length ? upcoming.map((event) => <EventRow key={event.slug} event={event} />) : <p className="empty-line">Op dit moment staat er nog geen nieuwe datum publiek.</p>}</div>
        </div>
        <div className="live-index-block">
          <p className="eyebrow">Archief</p>
          <div className="event-list">{past.map((event) => <EventRow key={event.slug} event={event} />)}</div>
        </div>
      </section>
    </div>
  );
}
