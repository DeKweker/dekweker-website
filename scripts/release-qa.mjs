import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = process.cwd();
const errors = [];
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".md", ".txt", ".bat"]);
const generatedDirs = new Set(["node_modules", ".next", ".vercel", "coverage", ".git"]);
const dormantDirs = new Set(["drizzle", "sanity"]);
const forbiddenFilePatterns = [/\.tsbuildinfo$/i, /\.log$/i, /\.zip$/i, /\.psd$/i, /\.ai$/i, /^\.env\.local$/i, /^\.env\.production$/i];
const forbiddenSourceTerms = ["@neondatabase", "drizzle-orm", "next-sanity", "@sanity/", "stripe", "resend", "cloudflare.com/turnstile", "KWKR_COMMERCE_ENABLED", "KWKR_CONTENT_SOURCE"];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && generatedDirs.has(entry.name)) return [];
    if (entry.isFile() && /\.tsbuildinfo$/i.test(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return [path];
  });
}

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (entry.isDirectory() && dormantDirs.has(entry.name)) errors.push(`Forbidden dormant directory in release: ${entry.name}`);
}

const gitignore = readFileSync(resolve(root, ".gitignore"), "utf8");
for (const generated of ["node_modules", ".next", ".vercel", "coverage"]) {
  const ignored = gitignore.split(/\r?\n/).some((line) => {
    const value = line.trim().replace(/\/$/, "");
    return value === generated || value === `/${generated}`;
  });
  if (!ignored) errors.push(`.gitignore must exclude generated directory: ${generated}`);
}

const files = walk(root);
let totalBytes = 0;
for (const file of files) {
  const rel = relative(root, file).replaceAll("\\", "/");
  const size = statSync(file).size;
  totalBytes += size;
  if (size > 10 * 1024 * 1024) errors.push(`File exceeds 10 MiB release budget: ${rel}`);
  if (forbiddenFilePatterns.some((pattern) => pattern.test(rel.split("/").at(-1)))) errors.push(`Forbidden release artifact: ${rel}`);

  if (rel.startsWith("src/") && textExtensions.has(extname(file))) {
    const text = readFileSync(file, "utf8");
    for (const term of forbiddenSourceTerms) if (text.toLowerCase().includes(term.toLowerCase())) errors.push(`Dormant service reference '${term}' remains in ${rel}`);
    if (/\b(?:TODO|FIXME|HACK)\b/.test(text)) errors.push(`Unresolved development marker in ${rel}`);
    if (/console\.(?:log|debug)\s*\(/.test(text)) errors.push(`Debug console call remains in ${rel}`);
    if (text.includes("@ts-ignore") || text.includes("eslint-disable")) errors.push(`Type/lint suppression remains in ${rel}`);
    if (text.includes("http://localhost") || text.includes("127.0.0.1")) errors.push(`Localhost reference remains in ${rel}`);
  }
}
if (totalBytes > 35 * 1024 * 1024) errors.push(`Repository payload exceeds 35 MiB release budget (${Math.round(totalBytes / 1024 / 1024)} MiB).`);

const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const allowedDependencies = new Set(["@vercel/analytics", "@vercel/speed-insights", "next", "react", "react-dom"]);
for (const name of Object.keys(packageJson.dependencies ?? {})) if (!allowedDependencies.has(name)) errors.push(`Unexpected production dependency: ${name}`);
if (packageJson.engines?.node !== "22.x") errors.push("Node engine must be pinned to the Vercel-supported 22.x line.");
if (packageJson.devDependencies?.typescript !== "6.0.3") errors.push("TypeScript must remain pinned to 6.0.3 for the reviewed toolchain.");
if (!String(packageJson.scripts?.build).includes("npm run qa") || !String(packageJson.scripts?.build).includes("next build")) errors.push("Production build must execute the release gate before next build.");

const sourceFiles = files.filter((file) => relative(root, file).replaceAll("\\", "/").startsWith("src/") && textExtensions.has(extname(file)));
const assetRefs = new Set();
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/["'`](\/assets\/[A-Za-z0-9_./()@-]+\.[A-Za-z0-9]+)["'`]/g)) assetRefs.add(match[1]);
}
for (const asset of assetRefs) {
  if (!existsSync(resolve(root, `public${asset}`))) errors.push(`Referenced public asset is missing: ${asset}`);
}
const publicAssets = walk(resolve(root, "public/assets")).map((file) => `/${relative(resolve(root, "public"), file).replaceAll("\\", "/")}`);
for (const asset of publicAssets) if (!assetRefs.has(asset)) errors.push(`Unreferenced asset remains in production payload: ${asset}`);

const appRoot = resolve(root, "src/app");
const pageFiles = files.filter((file) => file.startsWith(appRoot) && file.endsWith("page.tsx"));
const routePatterns = pageFiles.map((file) => {
  const rel = relative(appRoot, file).replaceAll("\\", "/").replace(/\/page\.tsx$/, "");
  const route = rel.split("/").filter((part) => !/^\(.+\)$/.test(part)).join("/");
  const pattern = `/${route}`.replace(/\/$/, "") || "/";
  return new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\[[^/]+\\\]/g, "[^/]+")}$`);
});
const literalInternalLinks = new Set();
for (const file of sourceFiles) {
  const rel = relative(root, file).replaceAll("\\", "/");
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/(?:href|destination)\s*=?:?\s*["'](\/[A-Za-z0-9_./-]*)["']/g)) literalInternalLinks.add(`${match[1]}\0${rel}`);
  if (rel !== "src/content/verified.ts" && /["'`](\/assets\/(?:events|live|releases|portrait|press)\/)/.test(text)) {
    errors.push(`Content asset is hardcoded outside the verified source: ${rel}`);
  }
}
for (const entry of literalInternalLinks) {
  const [href, rel] = entry.split("\0");
  if (href.startsWith("/assets/") || href === "/favicon.ico") continue;
  if (!routePatterns.some((pattern) => pattern.test(href))) errors.push(`Internal link has no matching app route: ${href} (${rel})`);
}

for (const file of pageFiles) {
  const rel = relative(root, file).replaceAll("\\", "/");
  if (rel.endsWith("src/app/(site)/page.tsx")) continue;
  const text = readFileSync(file, "utf8");
  if (!/export (?:const metadata|async function generateMetadata)/.test(text)) errors.push(`Public page has no explicit metadata: ${rel}`);
}

const seoSource = readFileSync(resolve(root, "src/lib/seo/site.ts"), "utf8");
if (!seoSource.includes('export const siteUrl = "https://kwkr.be"')) errors.push("Canonical origin must be fixed to https://kwkr.be.");
if (sourceFiles.some((file) => readFileSync(file, "utf8").includes("/api/og"))) errors.push("Source references the unavailable /api/og route.");
const nextConfig = readFileSync(resolve(root, "next.config.ts"), "utf8");
if (!nextConfig.includes('type: "host", value: "www.kwkr.be"') || !nextConfig.includes('destination: "https://kwkr.be/:path*"')) {
  errors.push("www.kwkr.be must permanently redirect to the canonical non-www host.");
}

const header = readFileSync(resolve(root, "src/components/Header.tsx"), "utf8");
const css = readFileSync(resolve(root, "src/app/globals.css"), "utf8");
const transition = readFileSync(resolve(root, "src/lib/ui/route-transition.ts"), "utf8");
const siteMotion = readFileSync(resolve(root, "src/components/SiteMotion.tsx"), "utf8");
if (!/<Link\s+className="header-booking"\s+href="\/booking"/.test(header)) errors.push("Header booking CTA must route through /booking.");
if (transition.includes('pathname === "/shop"') || transition.includes('pathname.startsWith("/shop/"')) errors.push("Removed shop choreography remains in route transitions.");
if (!siteMotion.includes("usePathname")) errors.push("SiteMotion must re-register scenes on App Router pathname changes.");
for (const required of ["safe-area-inset-top", "--viewport-h", "prefers-reduced-motion", 'html[data-js="true"] [data-reveal]', ".skip-link", ".route-transition", ".site-intro"]) {
  if (!css.includes(required)) errors.push(`Responsive/accessibility safeguard missing from CSS: ${required}`);
}
if (!/\.live-feature-image img \{[^}]*object-fit: contain/s.test(css)) errors.push("Live editorial portrait image may be cropped in wide panels.");
if (!/\.media-lead-photo img \{[^}]*object-fit: contain/s.test(css)) errors.push("Media lead portrait image may be cropped in wide panels.");
if (!/\.booking-page-image img \{[^}]*object-position: 43% 8%/s.test(css)) errors.push("Booking focal point safeguard is missing.");

if (errors.length) {
  console.error("\nKWKR release QA failed:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`KWKR release QA passed: ${files.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB payload, ${assetRefs.size} referenced assets.`);
