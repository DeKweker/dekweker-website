export const SITE_INTRO_STORAGE_KEY = "kwkr-intro-v1";

export const siteIntroBootstrap = `
(() => {
  const root = document.documentElement;
  root.dataset.js = "true";
  try {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("${SITE_INTRO_STORAGE_KEY}") === "1";
    root.dataset.kwkrIntro = reduce || seen ? "skip" : "show";
  } catch {
    root.dataset.kwkrIntro = "show";
  }
})();`;
