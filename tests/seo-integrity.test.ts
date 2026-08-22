import { describe, expect, it } from "vitest";
import { verifiedEvents, verifiedReleases } from "@/content/verified";
import sitemap from "@/app/sitemap";
import { pageMetadata, siteUrl } from "@/lib/seo/site";

describe("canonical and sitemap integrity", () => {
  it("uses one normalized production origin", () => {
    expect(siteUrl).toBe("https://kwkr.be");
    const metadata = pageMetadata({ title: "Test", path: "/muziek" });
    expect(metadata.alternates?.canonical).toBe("https://kwkr.be/muziek");
    expect(metadata.openGraph?.url).toBe("https://kwkr.be/muziek");
  });

  it("publishes every release and event exactly once", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const release of verifiedReleases) expect(urls).toContain(`${siteUrl}/muziek/${release.slug}`);
    for (const event of verifiedEvents) expect(urls).toContain(`${siteUrl}/live/${event.slug}`);
  });
});
