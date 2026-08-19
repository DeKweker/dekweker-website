import { describe, expect, it } from "vitest";
import { verifiedVideos } from "@/content/verified";
import { videoSchema } from "@/lib/seo/schema";

describe("Google video structured data", () => {
  it("requires an official upload date for every verified video", () => {
    expect(verifiedVideos.length).toBeGreaterThan(0);

    for (const video of verifiedVideos) {
      expect(video.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("emits Google's required VideoObject properties", () => {
    for (const video of verifiedVideos) {
      const schema = videoSchema(video);

      expect(schema.name).toBeTruthy();
      expect(schema.thumbnailUrl.length).toBeGreaterThan(0);
      expect(schema.uploadDate).toBe(video.uploadDate);
      expect(schema.embedUrl).toContain(video.youtubeId);
    }
  });

  it("does not pretend a YouTube watch page is the video content file", () => {
    for (const video of verifiedVideos) {
      const schema = videoSchema(video);
      expect("contentUrl" in schema).toBe(false);
    }
  });
});
