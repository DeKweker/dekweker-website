import type { LiveEvent } from "./types";

function dateAtNoonUtc(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

export function eventDateTimeValue(event: LiveEvent): string {
  return event.startDateTime ?? event.startDate;
}

export function formatEventDate(event: LiveEvent, includeTime = false): string {
  if (includeTime && event.startDateTime) {
    return new Intl.DateTimeFormat("nl-BE", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Brussels"
    }).format(new Date(event.startDateTime));
  }
  return new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "full",
    timeZone: "Europe/Brussels"
  }).format(dateAtNoonUtc(event.startDate));
}

export function formatEventDateCompact(event: LiveEvent): string {
  return new Intl.DateTimeFormat("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Brussels"
  }).format(dateAtNoonUtc(event.startDate));
}

export function todayInBrussels(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
