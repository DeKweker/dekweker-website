import { describe, expect, it } from "vitest";
import { getRouteTransition } from "@/lib/ui/route-transition";

describe("route transition choreography", () => {
  it("keeps the approved 8000 identity on home and profile", () => {
    expect(getRouteTransition("/").word).toBe("8000");
    expect(getRouteTransition("/de-kweker").word).toBe("8000");
  });

  it("gives core destinations deterministic thematic transitions", () => {
    expect(getRouteTransition("/muziek")).toMatchObject({ word: "PLAY", direction: "left" });
    expect(getRouteTransition("/live")).toMatchObject({ word: "LIVE", direction: "bottom" });
    expect(getRouteTransition("/media")).toMatchObject({ word: "BEELD", direction: "right" });
  });

  it("keeps detail routes in the visual language of their parent section", () => {
    expect(getRouteTransition("/muziek/lekt-em").direction).toBe("left");
    expect(getRouteTransition("/live/wijklanken-2026").direction).toBe("bottom");
    expect(getRouteTransition("/booking")).toMatchObject({ word: "BOOK", direction: "left" });
  });
});
