import type { Metadata } from "next";
import { EventRow } from "@/components/EventRow";
import { getEvents } from "@/lib/content/repository";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Archief",
  path: "/archief",
  description: "Podiumarchief van De Kweker: eerdere shows, showcases en gastoptredens."
});

export default async function ArchivePage() {
  const events = (await getEvents()).filter((event) => event.status === "past");

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div data-reveal>
          <p className="eyebrow kicker-line">Historiek</p>
          <h1 className="page-title">LIVE<br />ARCHIEF.</h1>
          <p className="page-intro">Affiches, locaties en shows uit het liveverleden van De Kweker, op datum bij elkaar.</p>
        </div>
      </header>
      <section className="page-content">
        <div className="event-list">{events.map((event) => <EventRow key={event.slug} event={event} />)}</div>
      </section>
    </div>
  );
}
