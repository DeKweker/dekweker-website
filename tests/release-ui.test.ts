import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("live navigation and visual safeguards", () => {
  it("routes booking navigation through the booking page", () => {
    const header = source("src/components/Header.tsx");
    const footer = source("src/components/Footer.tsx");
    const home = source("src/app/(site)/page.tsx");
    expect(header).toContain('href="/booking"');
    expect(header).not.toContain("mailto:info@kwkr.be?subject=Booking");
    expect(footer).toContain('href="/booking"');
    expect(home).toContain('href="/booking"');
  });

  it("keeps documentary portrait photography uncropped in wide editorial panels", () => {
    const css = source("src/app/globals.css");
    expect(css).toMatch(/\.live-feature-image img \{[^}]*object-fit: contain/s);
    expect(css).toMatch(/\.media-lead-photo img \{[^}]*object-fit: contain/s);
  });

  it("keeps a no-JS content fallback and reduced-motion support", () => {
    const css = source("src/app/globals.css");
    const bootstrap = source("src/lib/ui/site-intro.ts");
    expect(bootstrap).toContain('root.dataset.js = "true"');
    expect(css).toContain('html[data-js="true"] [data-reveal]');
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
