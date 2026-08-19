# Security

The public release deliberately has a small runtime surface: no database, admin portal, public form endpoint, commerce API or secret-bearing backend service.

`next.config.ts` sets a Content Security Policy plus content-type, referrer, framing and permissions headers. CSP currently allows only first-party resources, the Vercel telemetry endpoints and privacy-enhanced YouTube frames required by the live site.

Only variables prefixed with `NEXT_PUBLIC_` may be added to browser code. Do not commit `.env.local`, credentials or service tokens.
