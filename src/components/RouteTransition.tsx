"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type TransitionEvent } from "react";
import { getRouteTransition, type RouteTransitionDescriptor } from "@/lib/ui/route-transition";

type TransitionPhase = "idle" | "entering" | "covered" | "leaving";

const ENTER_MS = 560;
const ROUTE_SETTLE_MS = 70;
const FALLBACK_RELEASE_MS = 1600;

function isPlainInternalNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download") || anchor.dataset.noTransition === "true") return false;
  if (!anchor.href) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    url.hash
  ) return false;

  return true;
}

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [descriptor, setDescriptor] = useState<RouteTransitionDescriptor>(() => getRouteTransition(pathname));
  const phaseRef = useRef<TransitionPhase>("idle");
  const pendingPathRef = useRef<string | null>(null);
  const previousPathRef = useRef(pathname);
  const navigationTimerRef = useRef<number | null>(null);
  const releaseTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const setTransitionPhase = useCallback((next: TransitionPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimers = useCallback(() => {
    if (navigationTimerRef.current !== null) window.clearTimeout(navigationTimerRef.current);
    if (releaseTimerRef.current !== null) window.clearTimeout(releaseTimerRef.current);
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    navigationTimerRef.current = null;
    releaseTimerRef.current = null;
    settleTimerRef.current = null;
  }, []);

  const leave = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "leaving") return;
    setTransitionPhase("leaving");
  }, [setTransitionPhase]);

  const navigate = useCallback((url: URL) => {
    if (phaseRef.current !== "idle") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(`${url.pathname}${url.search}${url.hash}`);
      return;
    }

    const targetHref = `${url.pathname}${url.search}${url.hash}`;
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (targetHref === currentHref) return;

    // Query/hash-only changes stay on the same page. They do not need a full
    // page transition and `usePathname()` would not observe them.
    if (url.pathname === window.location.pathname) {
      router.push(targetHref);
      return;
    }

    clearTimers();
    pendingPathRef.current = url.pathname;
    setDescriptor(getRouteTransition(url.pathname));
    setTransitionPhase("entering");

    navigationTimerRef.current = window.setTimeout(() => {
      setTransitionPhase("covered");
      router.push(targetHref);

      releaseTimerRef.current = window.setTimeout(() => {
        pendingPathRef.current = null;
        leave();
      }, FALLBACK_RELEASE_MS);
    }, ENTER_MS);
  }, [clearTimers, leave, router, setTransitionPhase]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !isPlainInternalNavigation(event, anchor)) return;

      event.preventDefault();
      navigate(new URL(anchor.href, window.location.href));
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [navigate]);

  useEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;

    if (pendingPathRef.current === pathname) {
      pendingPathRef.current = null;
      if (releaseTimerRef.current !== null) {
        window.clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = null;
      }
      settleTimerRef.current = window.setTimeout(leave, ROUTE_SETTLE_MS);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || phaseRef.current !== "idle") return;

    // Browser back/forward cannot be delayed by the App Router. Give those
    // arrivals the same visual language without pretending to block history.
    setDescriptor(getRouteTransition(pathname));
    setTransitionPhase("entering");
    navigationTimerRef.current = window.setTimeout(() => {
      setTransitionPhase("covered");
      settleTimerRef.current = window.setTimeout(leave, ROUTE_SETTLE_MS);
    }, Math.round(ENTER_MS * 0.62));
  }, [leave, pathname, setTransitionPhase]);

  useEffect(() => clearTimers, [clearTimers]);

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (phaseRef.current === "entering") setTransitionPhase("covered");
    if (phaseRef.current === "leaving") setTransitionPhase("idle");
  };

  return (
    <div
      className="route-transition"
      data-direction={descriptor.direction}
      data-phase={phase}
      data-compact={descriptor.word.length > 6 ? "true" : undefined}
      aria-hidden="true"
      onTransitionEnd={onTransitionEnd}
    >
      <div className="route-transition-index">{descriptor.index}</div>
      <div className="route-transition-word">{descriptor.word}</div>
      <div className="route-transition-meta">
        <span>{descriptor.label}</span>
        <span>51°12′ N / 3°13′ E</span>
        <span>Brugge, BE</span>
      </div>
    </div>
  );
}
