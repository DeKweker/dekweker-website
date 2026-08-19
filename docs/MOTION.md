# Motion system

Motion is part of the KWKR visual identity and is centralized instead of being implemented ad hoc per section.

- The orange `8000` opening runs once per browser session.
- Internal route changes reuse the orange plane with deterministic destination words/directions.
- `SiteMotion` uses one requestAnimationFrame loop and one route-aware registration lifecycle.
- Music, Live, Media, Profile and Booking have theme-specific decorative motion marks.
- Fine-pointer tilt is optional enhancement only.
- `prefers-reduced-motion` removes spatial choreography and delayed transitions.
- Without JavaScript, reveal content remains visible; JavaScript marks the document before reveal styles are enabled.

Route descriptors live in `src/lib/ui/route-transition.ts`; the navigation engine lives in `src/components/RouteTransition.tsx`.
