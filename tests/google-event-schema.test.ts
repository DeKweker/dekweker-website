import { describe, expect, it } from "vitest";
import { verifiedEvents } from "@/content/verified";
import { eventSchema } from "@/lib/seo/schema";

describe("Google Event structured data", () => {
  it("publishes no past archive show as an active Google Event rich result", () => {
    for (
      const event of verifiedEvents.filter(
        (item) => item.status === "past"
      )
    ) {
      expect(event.richResult).not.toBe(true);
      expect(eventSchema(event)).toBeNull();
    }
  });

  it("locks the official Wijklanken facts", () => {
    const event = verifiedEvents.find(
      (item) =>
        item.slug ===
        "wijklanken-plukketuffer-2026"
    );

    expect(event?.title).toBe(
      "Wijklanken · Plukketuffer"
    );
    expect(event?.startDate).toBe("2026-08-18");
    expect(event?.startDateTime).toBe(
      "2026-08-18T19:00:00+02:00"
    );
    expect(event?.endDateTime).toBe(
      "2026-08-18T23:30:00+02:00"
    );
    expect(event?.venue).toBe(
      "Sportcafetaria Extra Time"
    );
    expect(event?.streetAddress).toBe(
      "Nijverheidsstraat 112"
    );
    expect(event?.organizer?.name).toBe(
      "Stad Brugge, Evenementenbeleid en -vergunningen"
    );
    expect(event?.free).toBe(true);
  });

  it("locks the official Friday After Hours facts", () => {
    const event = verifiedEvents.find(
      (item) =>
        item.slug ===
        "friday-after-hours-2026"
    );

    expect(event?.title).toBe(
      "Phatmarks' Friday After Hours"
    );
    expect(event?.startDateTime).toBe(
      "2026-05-15T20:45:00+02:00"
    );
    expect(event?.endDateTime).toBe(
      "2026-05-15T23:59:00+02:00"
    );
    expect(event?.venue).toBe("De Kelk");
    expect(event?.streetAddress).toBe(
      "Langestraat 69"
    );
    expect(event?.organizer?.name).toBe(
      "Phatmark Collective vzw"
    );
    expect(event?.price).toBe(12);
  });

  it("locks Villa West to Kwartier West at Villa Bota", () => {
    const event = verifiedEvents.find(
      (item) =>
        item.slug ===
        "villa-west-de-kweker-friends-2026"
    );

    expect(event?.organizer?.name).toBe(
      "Kwartier West"
    );
    expect(event?.venue).toBe("Villa Bota");
    expect(event?.streetAddress).toBe("Park 8");
    expect(event?.free).toBe(true);
    expect(event?.price).toBe(0);
  });
});
