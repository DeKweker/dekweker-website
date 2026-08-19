import { verifiedArtist, verifiedEvents, verifiedPress, verifiedReleases, verifiedVideos } from "@/content/verified";
import type { ArtistProfile, LiveEvent, PressItem, Release, VideoItem } from "./types";

/**
 * Production content is intentionally local and version-controlled.
 * That keeps the live site deterministic: a deploy contains exactly the
 * artist, release, event and press data that was reviewed with the build.
 */
export async function getArtist(): Promise<ArtistProfile> {
  return verifiedArtist;
}

export async function getReleases(): Promise<Release[]> {
  return verifiedReleases;
}

export async function getEvents(): Promise<LiveEvent[]> {
  return verifiedEvents;
}

export async function getPress(): Promise<PressItem[]> {
  return verifiedPress;
}

export async function getVideos(): Promise<VideoItem[]> {
  return verifiedVideos;
}
