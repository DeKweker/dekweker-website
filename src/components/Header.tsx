"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const nav = [
  ["Muziek", "/muziek"],
  ["Live", "/live"],
  ["Media", "/media"],
  ["Profiel", "/de-kweker"]
] as const;

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    mobileMenuRef.current?.removeAttribute("open");
  }, [pathname]);

  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="De Kweker home">
        DE KWEKER<sup>8000</sup>
      </Link>
      <nav className="desktop-nav" aria-label="Hoofdnavigatie">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} aria-current={isCurrentRoute(pathname, href) ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="header-booking" href="/booking" aria-current={isCurrentRoute(pathname, "/booking") ? "page" : undefined}>
          Booking
        </Link>
      </div>
      <details className="mobile-menu" ref={mobileMenuRef}>
        <summary aria-label="Navigatiemenu">Menu</summary>
        <nav className="mobile-menu-panel" aria-label="Mobiele navigatie">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} aria-current={isCurrentRoute(pathname, href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
          <Link href="/booking" aria-current={isCurrentRoute(pathname, "/booking") ? "page" : undefined}>
            Booking
          </Link>
        </nav>
      </details>
    </header>
  );
}
