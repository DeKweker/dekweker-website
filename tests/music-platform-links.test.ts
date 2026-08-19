import { describe, expect, it } from "vitest";
import { verifiedReleases, verifiedVideos } from "@/content/verified";

describe("music platform links", () => {
  const listeningLabels = new Set([
    "Spotify",
    "Apple Music",
    "SoundCloud",
    "YouTube",
    "Alle platformen"
  ]);

  it("gives every release multiple useful listening destinations", () => {
    for (const release of verifiedReleases) {
      const destinations = release.links.filter((link) =>
        listeningLabels.has(link.label)
      );

      expect(
        destinations.length,
        `${release.slug} should have multiple listening destinations`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps Lekt Em artwork and separates audio from the official video", () => {
    const release = verifiedReleases.find(
      (item) => item.slug === "lekt-em"
    );

    const video = verifiedVideos.find(
      (item) => item.slug === "lekt-em-video"
    );

    expect(release?.coverImage).toBe(
      "/assets/releases/lekt-em-cover.jpg"
    );

    expect(release?.videoUrl).toBe(
      "https://www.youtube.com/watch?v=8Q0LB68kxRw"
    );

    expect(
      release?.links.map((link) => link.url)
    ).not.toContain(release?.videoUrl);

    expect(video?.youtubeId).toBe("8Q0LB68kxRw");
    expect(video?.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
