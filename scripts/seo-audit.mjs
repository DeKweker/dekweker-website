import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicPages = [
  'index.html',
  'live/index.html',
  'muziek/index.html',
  'media/index.html',
  'de-kweker/index.html',
  'privacy/index.html',
];

const siteOrigin = 'https://www.kwkr.be';
const issues = [];

const read = (file) => readFileSync(path.join(root, file), 'utf8');
const textOf = (html, pattern) => html.match(pattern)?.[1]?.trim() || '';
const allMatches = (html, pattern) => [...html.matchAll(pattern)];
const flattenJsonLd = (value) => {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== 'object') return [];
  return [value, ...Object.values(value).flatMap(flattenJsonLd)];
};

const forbiddenRichResultTypes = new Set([
  'DiscussionForumPosting',
  'SocialMediaPosting',
]);

const requiredEventFields = [
  'name',
  'description',
  'startDate',
  'endDate',
  'eventStatus',
  'eventAttendanceMode',
  'image',
  'location',
  'organizer',
  'performer',
  'offers',
];

const fail = (file, message) => {
  issues.push(`${file}: ${message}`);
};

const stripTags = (value) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

for (const file of publicPages) {
  const html = read(file);
  const title = textOf(html, /<title>([\s\S]*?)<\/title>/i);
  const description = textOf(html, /<meta\s+name=['"]description['"]\s+content=['"]([^'"]+)['"]/i);
  const canonical = textOf(html, /<link\s+rel=['"]canonical['"]\s+href=['"]([^'"]+)['"]/i);
  const h1s = allMatches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((match) => stripTags(match[1]));
  const jsonLdBlocks = allMatches(html, /<script\s+type=['"]application\/ld\+json['"]>([\s\S]*?)<\/script>/gi);
  const expectedRoute = file === 'index.html' ? '/' : `/${file.replace(/index\.html$/, '')}`;
  const expectedCanonical = `${siteOrigin}${expectedRoute}`;
  const jsonLdNodes = [];

  if (!/<html\b[^>]*\blang=['"]nl-BE['"]/i.test(html)) fail(file, 'html lang should be nl-BE');
  if (!/<meta\s+charset=['"]?utf-8['"]?/i.test(html)) fail(file, 'missing utf-8 charset');
  if (!/<meta\s+name=['"]viewport['"]/i.test(html)) fail(file, 'missing viewport meta');
  if (!title) fail(file, 'missing title');
  if (title.length < 25 || title.length > 65) fail(file, `title length is ${title.length}`);
  if (!description) fail(file, 'missing meta description');
  if (description.length < 70 || description.length > 165) fail(file, `description length is ${description.length}`);
  if (!canonical.startsWith(siteOrigin)) fail(file, 'canonical must be absolute and on kwkr.be');
  if (canonical !== expectedCanonical) fail(file, `canonical should be ${expectedCanonical}`);
  if (h1s.length !== 1) fail(file, `expected exactly one H1, found ${h1s.length}`);
  if (!/<meta\s+property=['"]og:title['"]/i.test(html)) fail(file, 'missing og:title');
  if (!/<meta\s+property=['"]og:description['"]/i.test(html)) fail(file, 'missing og:description');
  if (!/<meta\s+property=['"]og:image['"]/i.test(html)) fail(file, 'missing og:image');
  if (!/<meta\s+property=['"]og:image:width['"]/i.test(html)) fail(file, 'missing og:image:width');
  if (!/<meta\s+property=['"]og:image:height['"]/i.test(html)) fail(file, 'missing og:image:height');
  if (!/<meta\s+property=['"]og:image:alt['"]/i.test(html)) fail(file, 'missing og:image:alt');
  if (!/<meta\s+name=['"]twitter:card['"]/i.test(html)) fail(file, 'missing twitter:card');
  if (!/<meta\s+name=['"]twitter:image['"]/i.test(html)) fail(file, 'missing twitter:image');
  if (!/<meta\s+name=['"]twitter:image:alt['"]/i.test(html)) fail(file, 'missing twitter:image:alt');
  if (!/<link\s+rel=['"]alternate['"]\s+hreflang=['"]nl-BE['"]/i.test(html)) fail(file, 'missing nl-BE hreflang');
  if (!/<meta\s+name=['"]robots['"][^>]+index,\s*follow/i.test(html)) fail(file, 'robots should include index, follow');
  if (!jsonLdBlocks.length) fail(file, 'missing structured data');

  for (const [index, block] of jsonLdBlocks.entries()) {
    try {
      jsonLdNodes.push(...flattenJsonLd(JSON.parse(block[1].trim())));
    } catch (error) {
      fail(file, `invalid JSON-LD block ${index + 1}: ${error.message}`);
    }
  }

  if (!jsonLdNodes.some((node) => node['@type'] === 'BreadcrumbList')) {
    fail(file, 'missing BreadcrumbList structured data');
  }
  if (!jsonLdNodes.some((node) => ['WebPage', 'CollectionPage'].includes(node['@type']))) {
    fail(file, 'missing WebPage or CollectionPage structured data');
  }

  for (const node of jsonLdNodes) {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    for (const type of types) {
      if (forbiddenRichResultTypes.has(type)) {
        fail(file, `unsupported rich-result type ${type}`);
      }
    }

    if (!types.some((type) => ['Event', 'MusicEvent'].includes(type))) continue;

    for (const field of requiredEventFields) {
      if (node[field] === undefined || node[field] === null || node[field] === '') {
        fail(file, `${node['@type']} is missing ${field}`);
      }
    }

    const offer = node.offers;
    for (const field of ['url', 'price', 'priceCurrency', 'availability', 'validFrom']) {
      if (!offer || offer[field] === undefined || offer[field] === null || offer[field] === '') {
        fail(file, `${node['@type']} offer is missing ${field}`);
      }
    }

    const organizer = node.organizer;
    for (const field of ['name', 'url']) {
      if (!organizer || !organizer[field]) fail(file, `${node['@type']} organizer is missing ${field}`);
    }

    const address = node.location?.address;
    for (const field of ['streetAddress', 'postalCode', 'addressLocality', 'addressCountry']) {
      if (!address || !address[field]) fail(file, `${node['@type']} location address is missing ${field}`);
    }
  }
  if (/\/assets\/deeq-studio\.svg|\/assets\/de-kweker-belfort\.svg/.test(html)) {
    fail(file, 'public page references oversized legacy SVG asset');
  }

  for (const match of allMatches(html, /<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (!/\salt=/.test(attrs)) fail(file, 'image missing alt attribute');
    if (!/\swidth=/.test(attrs) || !/\sheight=/.test(attrs)) fail(file, 'image missing width or height');
  }

  for (const match of allMatches(html, /<a\b([^>]*)>/gi)) {
    const attrs = match[1];
    const href = textOf(attrs, /\shref=['"]([^'"]+)['"]/i);
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('http') && !/rel=['"][^'"]*noopener/i.test(attrs)) {
      fail(file, `external link missing noopener: ${href}`);
    }
  }
}

const sitemap = read('sitemap.xml');
for (const file of publicPages) {
  const route = file === 'index.html' ? '/' : `/${file.replace(/index\.html$/, '')}`;
  const loc = `${siteOrigin}${route}`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    fail('sitemap.xml', `missing ${loc}`);
  }
}

const robots = read('robots.txt');
if (!robots.includes('Sitemap: https://www.kwkr.be/sitemap.xml')) {
  fail('robots.txt', 'missing sitemap reference');
}

const scanTextFiles = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      scanTextFiles(full);
      continue;
    }
    if (!/\.(html|xml|json|webmanifest|css|js)$/i.test(entry)) continue;
    const relative = path.relative(root, full).replaceAll(path.sep, '/');
    const content = readFileSync(full, 'utf8');
    if (/[\u00c3\u00e2]/.test(content)) fail(relative, 'contains mojibake characters');

    const assetRefs = allMatches(content, /\/assets\/[^\s"',)<]+/g);
    for (const match of assetRefs) {
      if (/[()*]/.test(match[0])) continue;
      const assetPath = match[0].replace(/[?#].*$/, '').replace(/^\//, '');
      if (!existsSync(path.join(root, assetPath))) {
        fail(relative, `missing local asset ${match[0]}`);
      }
    }
  }
};

scanTextFiles(root);

if (issues.length) {
  console.error(`SEO audit found ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`SEO audit passed for ${publicPages.length} public pages.`);
