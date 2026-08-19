"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    header?.classList.remove("is-hidden");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let lastY = window.scrollY;
    let frame = 0;

    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-scene]"));
    const depthNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, y / max))));

      if (header) {
        header.classList.toggle("is-scrolled", y > 24);
        if (y > 180 && y > lastY + 8) header.classList.add("is-hidden");
        if (y < lastY - 8 || y < 120) header.classList.remove("is-hidden");
      }
      lastY = y;

      if (!reduce) {
        for (const scene of scenes) {
          const rect = scene.getBoundingClientRect();
          const travel = rect.height + window.innerHeight;
          const p = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));
          scene.style.setProperty("--scene-p", p.toFixed(4));
          const centered = p * 2 - 1;
          scene.style.setProperty("--scene-c", centered.toFixed(4));
          scene.style.setProperty("--scene-lift", `${(centered * -22).toFixed(2)}px`);
          scene.style.setProperty("--scene-ghost", `${(centered * 18).toFixed(2)}px`);
          scene.style.setProperty("--scene-rot", `${(centered * 3.2).toFixed(2)}deg`);
          scene.style.setProperty("--scene-z", `${(-70 + p * 150).toFixed(2)}px`);
          scene.style.setProperty("--scene-scale", (0.94 + p * 0.07).toFixed(4));
          scene.style.setProperty("--scene-copy-x", `${((0.5 - p) * 30).toFixed(2)}px`);
        }

        for (const node of depthNodes) {
          const rect = node.getBoundingClientRect();
          if (rect.bottom < -120 || rect.top > window.innerHeight + 120) continue;
          const center = rect.top + rect.height / 2;
          const rel = (center - window.innerHeight / 2) / Math.max(1, window.innerHeight);
          const amount = Number(node.dataset.depth || 18);
          node.style.setProperty("--depth-y", `${(-rel * amount).toFixed(2)}px`);
          node.style.setProperty("--depth-r", `${(rel * amount * 0.08).toFixed(2)}deg`);
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -7%" }
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => observer.observe(node));

    const cleanupTilt: Array<() => void> = [];
    if (!reduce && finePointer) {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((node) => {
        const move = (event: PointerEvent) => {
          const rect = node.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y2 = (event.clientY - rect.top) / rect.height - 0.5;
          node.style.setProperty("--tilt-x", `${(-y2 * 4).toFixed(2)}deg`);
          node.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
        };
        const leave = () => {
          node.style.setProperty("--tilt-x", "0deg");
          node.style.setProperty("--tilt-y", "0deg");
        };
        node.addEventListener("pointermove", move);
        node.addEventListener("pointerleave", leave);
        cleanupTilt.push(() => {
          node.removeEventListener("pointermove", move);
          node.removeEventListener("pointerleave", leave);
        });
      });
    }

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      cleanupTilt.forEach((fn) => fn());
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true" />;
}
