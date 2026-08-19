import Link from "next/link";
import type { LiveEvent } from "@/lib/content/types";
import { eventDateTimeValue, formatEventDateCompact } from "@/lib/content/events";

const appearanceLabel: Record<NonNullable<LiveEvent["appearanceType"]>, string> = {
  headline: "Live",
  guest: "Gast",
  support: "Support",
  surprise: "Surprise",
  festival: "Festival",
  session: "Sessie"
};

export function EventRow({ event }: { event: LiveEvent }) {
  const label = event.appearanceType ? appearanceLabel[event.appearanceType] : event.status === "past" ? "Archief" : "Live";
  return (
    <Link className="event-row" href={`/live/${event.slug}`}>
      <time dateTime={eventDateTimeValue(event)}>{formatEventDateCompact(event)}</time>
      <div><h3>{event.title}</h3><p>{event.venue} · {event.city}</p></div>
      <span className={`status status-${event.status}`}>{label}</span>
    </Link>
  );
}
