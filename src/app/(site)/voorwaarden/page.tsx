import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({ title: "Voorwaarden", path: "/voorwaarden", description: "Voorwaarden voor het gebruik van kwkr.be en contact met De Kweker." });

export default function TermsPage() {
  return (
    <div className="page-shell">
      <header className="page-hero"><div><p className="eyebrow eyebrow-accent">Voorwaarden</p><h1 className="page-title">AFSPRAKEN.</h1><p className="page-intro">De basisafspraken rond kwkr.be en aanvragen.</p></div></header>
      <article className="page-content legal-copy">
        <h2>Booking en contact</h2>
        <p>Een e-mail of eerste contact is een aanvraag en vormt op zichzelf geen bevestigde booking of overeenkomst. Een afspraak is pas bevestigd wanneer beide partijen dat uitdrukkelijk overeenkomen.</p>
      </article>
    </div>
  );
}
