import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getEvents } from "@/lib/content/repository";
import { formatEventDate } from "@/lib/content/events";
import { eventSchema } from "@/lib/seo/schema";
import { pageMetadata, socialCardPath } from "@/lib/seo/site";

export async function generateStaticParams() {
  return (await getEvents()).map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = (await getEvents()).find((item) => item.slug === slug);
  if (!event) return {};
  return pageMetadata({ title: event.title, path: `/live/${event.slug}`, description: event.description ?? `${event.title}. De Kweker live in ${event.city}.`, image: socialCardPath("event", event.slug), imageAlt: `${event.title} · ${event.venue} · ${event.city}` });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = (await getEvents()).find((item) => item.slug === slug);
  if (!event) notFound();
  const role = event.appearanceType === "surprise" ? "Surprise act" : event.appearanceType === "support" ? "Support act" : event.appearanceType === "guest" ? "Gast" : event.appearanceType === "headline" ? "Eigen show" : event.appearanceType === "festival" ? "Festival" : event.appearanceType === "session" ? "Sessie" : null;

  return (
    <div className="page-shell">
      <JsonLd data={eventSchema(event)} />
      <section className="detail-stage event-detail-stage" data-scroll-scene>
        <div className="detail-art-wrap" data-reveal>
          <div className="detail-media detail-media-event" data-depth="18">
            {event.image ? <Image src={event.image} alt={`De Kweker live tijdens ${event.title}`} fill priority sizes="(max-width: 900px) 92vw, 620px" /> : <div className="release-art-fallback">LIVE</div>}
          </div>
        </div>
        <div className="detail-copy" data-reveal>
          <p className="eyebrow eyebrow-accent">Live / {event.status === "past" ? "archief" : event.status}</p>
          <h1>{event.title}</h1>
          <p className="lead">{event.description ?? `De Kweker live in ${event.city}.`}</p>
          <div className="meta-stack">
            <div className="meta-line"><span>Datum</span><strong>{formatEventDate(event, true)}</strong></div>
            <div className="meta-line"><span>Venue</span><strong>{event.venue}</strong></div>
            {role ? <div className="meta-line"><span>Rol</span><strong>{role}</strong></div> : null}
            <div className="meta-line"><span>Stad</span><strong>{event.city}</strong></div>
            <div className="meta-line"><span>Toegang</span><strong>{event.free ? "Gratis" : event.ticketUrl ? "Tickets" : "Zie organisator"}</strong></div>
          </div>
          {event.ticketUrl ? <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="button">Tickets</a> : null}
        </div>
      </section>
    </div>
  );
}
