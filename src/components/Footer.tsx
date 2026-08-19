import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-wordmark" aria-hidden="true">DE <span>KWEKER</span></div>
      <div className="footer-grid">
        <div>
          <p className="eyebrow">De Kweker / Brugge 8000</p>
          <p className="footer-copy">Muziek, live en beeld van De Kweker.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigatie">
          <Link href="/muziek">Muziek</Link>
          <Link href="/live">Live</Link>
          <Link href="/media">Media</Link>
          <Link href="/de-kweker">Profiel</Link>
          <Link href="/booking">Booking</Link>
        </nav>
        <div className="footer-meta">
          <a href="mailto:info@kwkr.be">info@kwkr.be</a>
          <span>Brugge, België</span>
          <span>© {new Date().getFullYear()} De Kweker</span>
          <div className="footer-legal"><Link href="/privacy">Privacy</Link><Link href="/voorwaarden">Voorwaarden</Link></div>
          <a className="footer-studio" href="https://deeqstudio.com" target="_blank" rel="noopener noreferrer">
            <span>Site by</span><strong>DeeQ Studio</strong>
          </a>
        </div>
      </div>
    </footer>
  );
}
