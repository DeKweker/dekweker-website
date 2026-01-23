// js/limited.js
// Phase 1: local counter (works now)
// Phase 2: replace with API call (serverless) after payment success.

const KEY = "kwkr_vinyl_reserved_count_v1";
const LIMIT = 150;

// returns 1..LIMIT (the next number to assign)
export function getNextVinylNumber() {
  const raw = Number(localStorage.getItem(KEY) || "0");
  const next = Math.min(LIMIT, raw + 1);
  return next;
}

export function getReservedCount(){
  const raw = Number(localStorage.getItem(KEY) || "0");
  return Math.max(0, Math.min(LIMIT, raw));
}

export function reserveOneVinyl(){
  const raw = getReservedCount();
  if(raw >= LIMIT) return { ok:false, count: raw, limit: LIMIT };
  const next = raw + 1;
  localStorage.setItem(KEY, String(next));
  return { ok:true, count: next, limit: LIMIT };
}

export function syncVinylBadges(){
  // updates any elements used in hero + cards
  const now = getReservedCount();
  const next = Math.min(LIMIT, now + 1);

  document.querySelectorAll("#vinylCountNow,[data-vinyl-now]").forEach(el => {
    el.textContent = String(now || 1); // show 1 if empty to match your screenshot vibe
  });

  document.querySelectorAll("#vinylCountNext,[data-vinyl-next]").forEach(el => {
    el.textContent = String(next);
  });

  document.querySelectorAll("[data-vinyl-limit]").forEach(el => {
    el.textContent = String(LIMIT);
  });
}
