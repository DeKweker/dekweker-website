import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ProfileCoordinateMark } from "@/components/PageMotionMarks";
import { getArtist } from "@/lib/content/repository";
import { profilePageSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "De Kweker | rapper uit Brugge",
  path: "/de-kweker",
  image: "/assets/social/og-de-kweker-1200x630.jpg",
  imageAlt: "De Kweker · Brugge 8000 · KWKR",
  description: "Officiële artiestenpagina van De Kweker, West-Vlaamse rapper uit Brugge (8000): bio, identiteit en geverifieerde kanalen."
});

export default async function ArtistPage() {
  const artist = await getArtist();
  return (
    <div className="page-shell">
      <JsonLd data={profilePageSchema(artist)} />
      <section className="profile-hero" data-scroll-scene>
        <div className="profile-hero-media" data-depth="23"><Image src={artist.heroImage} alt="De Kweker in Brugge" fill priority sizes="100vw" /></div>
        <div className="profile-hero-overlay" aria-hidden="true" />
        <div className="profile-hero-copy" data-reveal><p className="eyebrow eyebrow-accent">De Kweker / Brugge 8000</p><h1>DE<br />KWEKER.</h1><p>{artist.tagline}</p></div>
        <ProfileCoordinateMark />
      </section>

      <section className="page-content profile-story-grid">
        <div className="profile-portrait" data-scroll-scene><div data-depth="20"><Image src={artist.portraitImage} alt="Portret van De Kweker" fill sizes="(max-width: 900px) 100vw, 38vw" /></div></div>
        <div className="profile-copy" data-reveal>
          <p className="eyebrow eyebrow-accent">Brugge / 8000 / West-Vlaams</p>
          <h2>VAN BRUGGE.<br />IN HET WEST-VLAAMS.</h2>
          <p>{artist.shortBio}</p>
          <p>Brugge zit in de taal, de onderwerpen en de manier waarop de tracks gebracht worden.</p>
          <div className="profile-links">{artist.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>)}</div>
        </div>
      </section>
    </div>
  );
}
