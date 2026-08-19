import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({ title: "Contact", path: "/contact", description: "Contact met De Kweker voor booking, pers en samenwerkingen." });

export default function ContactPage() {
  return (
    <div className="page-shell">
      <header className="page-hero"><div data-reveal><p className="eyebrow eyebrow-accent">Contact</p><h1 className="page-title">CONTACT.</h1><p className="page-intro">Voor shows, pers, features en samenwerkingen.</p></div></header>
      <section className="page-content"><a className="booking-address" href="mailto:info@kwkr.be">info@kwkr.be</a></section>
    </div>
  );
}
