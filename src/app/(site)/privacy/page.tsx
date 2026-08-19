import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({ title: "Privacy", path: "/privacy", description: "Privacy-informatie voor kwkr.be." });

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <header className="page-hero"><div><p className="eyebrow eyebrow-accent">Privacy</p><h1 className="page-title">PRIVACY.</h1><p className="page-intro">Welke gegevens kwkr.be gebruikt en waarom.</p></div></header>
      <article className="page-content legal-copy">
        <h2>Verantwoordelijke</h2>
        <p>De Kweker is verantwoordelijk voor persoonsgegevens die via kwkr.be worden verwerkt. Vragen over privacy kunnen naar <a href="mailto:info@kwkr.be">info@kwkr.be</a>.</p>
        <h2>Contact en booking</h2>
        <p>Booking en contact verlopen rechtstreeks via e-mail. De website bewaart zelf geen ingevuld bookingformulier. Gegevens die je per mail meestuurt, worden alleen gebruikt om je vraag te behandelen en eventuele verdere afspraken te maken.</p>
        <h2>Analytics</h2>
        <p>kwkr.be gebruikt technische analytics en prestatiemetingen om fouten, snelheid en algemeen gebruik van de site te begrijpen. Er wordt geen advertentieprofiel opgebouwd.</p>
        <h2>Je rechten</h2>
        <p>Voor inzage, correctie, verwijdering of andere privacyvragen kan je mailen naar <a href="mailto:info@kwkr.be">info@kwkr.be</a>. Je kan ook een klacht indienen bij de Belgische Gegevensbeschermingsautoriteit.</p>
        <p className="legal-updated">Laatst bijgewerkt: 19 augustus 2026.</p>
      </article>
    </div>
  );
}
