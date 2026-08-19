"use client";

import { useEffect, useRef } from "react";
import { SITE_INTRO_STORAGE_KEY } from "@/lib/ui/site-intro";

const HOLD_MS = 720;
const FINISH_FALLBACK_MS = 1800;

export function SiteIntro() {
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const intro = introRef.current;
    if (!intro || root.dataset.kwkrIntro !== "show") return;

    const finish = () => {
      root.dataset.kwkrIntro = "skip";
      try {
        window.sessionStorage.setItem(SITE_INTRO_STORAGE_KEY, "1");
      } catch {
        // Session storage can be unavailable in strict privacy contexts.
      }
    };

    const leaveTimer = window.setTimeout(() => {
      intro.classList.add("is-leaving");
    }, HOLD_MS);
    const finishTimer = window.setTimeout(finish, FINISH_FALLBACK_MS);

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === intro && event.propertyName === "clip-path") finish();
    };

    intro.addEventListener("transitionend", onTransitionEnd);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
      intro.removeEventListener("transitionend", onTransitionEnd);
    };
  }, []);

  return (
    <div ref={introRef} className="site-intro" aria-hidden="true">
      <div className="site-intro-title" aria-hidden="true">
        {"8000".split("").map((digit, index) => (
          <span key={`${digit}-${index}`}>{digit}</span>
        ))}
      </div>
      <div className="site-intro-meta">
        <span>De Kweker</span>
        <span>51°12′ N / 3°13′ E</span>
        <span>Brugge, BE</span>
      </div>
    </div>
  );
}
