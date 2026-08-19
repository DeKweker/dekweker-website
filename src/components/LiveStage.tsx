"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LiveStageEvent = {
  slug: string;
  title: string;
  meta: string;
  date: string;
  status: string;
  image?: string;
};

export function LiveStage({ events }: { events: LiveStageEvent[] }) {
  const initial = Math.max(0, events.findIndex((event) => Boolean(event.image)));
  const [active, setActive] = useState(initial);
  const current = events[active] ?? events[0];

  return (
    <div className="live-stage-grid" data-scroll-scene>
      <div className="live-stage-visual" data-depth="24">
        {current?.image ? (
          <Image
            key={current.image}
            src={current.image}
            alt={`De Kweker live tijdens ${current.title}`}
            fill
            sizes="(max-width: 980px) 100vw, 38vw"
          />
        ) : (
          <div className="live-stage-fallback">8000</div>
        )}
        <div className="live-stage-caption">
          <span>Live archief</span>
          <strong>{current?.title}</strong>
        </div>
      </div>
      <div className="live-stage-list">
        {events.map((event, index) => (
          <Link
            key={event.slug}
            className={`live-row ${index === active ? "is-active" : ""}`}
            href={`/live/${event.slug}`}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            <time>{event.date}</time>
            <div><strong>{event.title}</strong><span>{event.meta}</span></div>
            <small>{event.status}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
