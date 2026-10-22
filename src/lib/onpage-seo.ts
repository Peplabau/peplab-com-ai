import onpageSeo from '@/lib/onpage-seo.json' with { type: 'json' };

export type OnpageSeoEntry = {
  title: string;
  description: string;
  skipPrerender?: boolean;
};

const ONPAGE_SEO = onpageSeo as Record<string, OnpageSeoEntry>;
const ONPAGE_SEO_LOWER: Record<string, OnpageSeoEntry> = Object.fromEntries(
  Object.entries(ONPAGE_SEO).map(([path, entry]) => [path.toLowerCase(), entry]),
);

export function normalizeOnpagePath(path: string): string {
  const raw = path.trim().split('?')[0]?.split('#')[0] || '/';
  if (!raw || raw === '/') return '/';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export function getOnpageSeo(path: string): { title: string; description: string } | undefined {
  const key = normalizeOnpagePath(path);
  const entry = ONPAGE_SEO[key] || ONPAGE_SEO_LOWER[key.toLowerCase()];
  if (!entry?.title) return undefined;
  return { title: entry.title, description: entry.description };
}

export function withOnpageSeo(
  path: string,
  fallback: { title: string; description: string },
): { title: string; description: string } {
  return getOnpageSeo(path) ?? fallback;
}
