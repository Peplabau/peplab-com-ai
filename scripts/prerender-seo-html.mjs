/**
 * Writes one HTML file per public URL so crawlers see a unique title,
 * description, and canonical before JavaScript runs.
 *
 * Vercel serves `dist/<path>/index.html` ahead of the SPA rewrite.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SITE_URL, STATIC_SEO_ROUTES } from './seo-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readQuoted(source, start) {
  const quote = source[start];
  if (quote !== '"' && quote !== "'") return null;
  let value = '';
  for (let i = start + 1; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      value += source[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (char === quote) return { value, end: i + 1 };
    value += char;
  }
  return null;
}

function fieldAfter(chunk, label) {
  const match = chunk.match(new RegExp(`${label}:\\s*(['"])`));
  if (!match || match.index == null) return '';
  const parsed = readQuoted(chunk, match.index + match[0].length - 1);
  return parsed ? parsed.value.replace(/\s+/g, ' ').trim() : '';
}

function loadResearchSeo(file) {
  const map = new Map();
  if (!existsSync(file)) return map;
  const text = readFileSync(file, 'utf8');
  const slugs = [];
  const re = /(?:^|[^A-Za-z0-9_])slug:\s*(['"])/g;
  let match;
  while ((match = re.exec(text))) {
    const parsed = readQuoted(text, match.index + match[0].length - 1);
    if (!parsed) continue;
    slugs.push({ slug: parsed.value, index: match.index });
  }
  for (let i = 0; i < slugs.length; i++) {
    const start = slugs[i].index;
    const end = i + 1 < slugs.length ? slugs[i + 1].index : text.length;
    const chunk = text.slice(start, end);
    const title = fieldAfter(chunk, 'seo_title');
    if (!title || map.has(slugs[i].slug)) continue;
    map.set(slugs[i].slug, {
      title,
      description: fieldAfter(chunk, 'seo_description'),
    });
  }
  return map;
}

function titleFromSlug(slug) {
  const name = slug
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
  return `${name} Research | PEPLAB Australia`;
}

function researchRoutes() {
  const seo = new Map([
    ...loadResearchSeo(join(root, 'src/lib/research-seed-data.ts')),
    ...loadResearchSeo(join(root, 'src/lib/research-handoff-seed-data.ts')),
  ]);
  return [...seo.entries()].map(([slug, entry]) => ({
    path: `/research/compounds/${slug}`,
    title: entry.title || titleFromSlug(slug),
    description:
      entry.description ||
      `${titleFromSlug(slug).replace(/ \| PEPLAB Australia$/, '')} from PEPLAB Australia, with published studies, evidence limits, and COA guidance. Research use only.`,
    priority: '0.82',
    changefreq: 'monthly',
  }));
}

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escapeJson(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function applyRoute(template, route) {
  const url = route.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${description}$2`,
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = html.replace(
    /(<link rel="alternate" hreflang="en-AU" href=")[^"]*(")/,
    `$1${url}$2`,
  );
  html = html.replace(
    /(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/,
    `$1${url}$2`,
  );
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(
    /(<meta property="og:description" content=")[^"]*(")/,
    `$1${description}$2`,
  );
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(
    /(<meta name="twitter:description" content=")[^"]*(")/,
    `$1${description}$2`,
  );
  html = html.replace(
    /("@type": "WebPage",\s*"@id": ")[^"]+(",\s*"url": ")[^"]+(",\s*"name": ")[^"]+(",\s*"description": ")[^"]+(")/,
    `$1${url}#webpage$2${url}$3${escapeJson(route.title)}$4${escapeJson(route.description)}$5`,
  );
  return html;
}

export function prerenderPublicSeo(distDir = join(root, 'dist')) {
  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) {
    console.warn(`SEO prerender skipped — ${indexPath} not found`);
    return 0;
  }
  const template = readFileSync(indexPath, 'utf8');
  const routes = [...STATIC_SEO_ROUTES, ...researchRoutes()];
  for (const route of routes) {
    const html = applyRoute(template, route);
    const file =
      route.path === '/'
        ? indexPath
        : join(distDir, route.path.replace(/^\//, ''), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html, 'utf8');
  }
  console.log(`Prerendered ${routes.length} indexable HTML pages for ${SITE_URL}`);
  return routes.length;
}

const isDirect = Boolean(
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href,
);
if (isDirect) prerenderPublicSeo();
