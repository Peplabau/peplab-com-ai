import { EXTERNAL_SHOP_ORIGIN, externalShopUrl, PUBLIC_SITE_ORIGIN } from '@/lib/domain';
import { resolveShopHref } from '@/lib/settings';

const trim = (url: string) => url.replace(/\/$/, '');

function runtimeOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  const fromEnv = import.meta.env.VITE_MAIN_SITE_URL || import.meta.env.VITE_SITE_URL;
  return trim(fromEnv || PUBLIC_SITE_ORIGIN);
}

/** SEO / content origin (peplab.com.au). */
export const MAIN_SITE_URL = trim(import.meta.env.VITE_MAIN_SITE_URL || runtimeOrigin());

/** Open shop origin (peplab.ai) for catalogue / product CTAs. */
export const SHOP_URL = EXTERNAL_SHOP_ORIGIN;

/**
 * Marketing landing — /landing on the main site when embedded.
 * Override with VITE_LANDING_SITE_URL for standalone subdomain deploys.
 */
export const LANDING_SITE_URL = trim(
  import.meta.env.VITE_LANDING_SITE_URL || runtimeOrigin(),
);

/** Published COA archive on the main shop site. */
export const COA_ARCHIVE_PATH = '/coa';

/** Canonical shop / catalogue path on the main site. */
export const SHOP_PAGE_PATH = '/shop';

/**
 * Build an absolute URL for a shop-related path.
 *
 * Shop / product / checkout paths flow through `resolveShopHref`, which:
 *   - stays local on peplab.ai (always),
 *   - stays local on peplab.com.au when the admin "Public catalog" toggle is ON,
 *   - sends the user to peplab.ai when the toggle is OFF (current locked mode).
 *
 * All other paths (privacy, standards, calculator, …) always stay on the SEO
 * site (peplab.com.au).
 */
export function shopUrl(path = ''): string {
  if (!path) return resolveShopHref('/');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (
    normalized === '/' ||
    normalized === SHOP_PAGE_PATH ||
    normalized.startsWith('/product/') ||
    normalized.startsWith('/checkout')
  ) {
    return resolveShopHref(normalized === SHOP_PAGE_PATH ? '/' : normalized);
  }
  return `${MAIN_SITE_URL}${normalized}`;
}

/** Shop catalogue CTA — respects the admin "Public catalog" toggle. */
export function shopPageUrl(): string {
  return resolveShopHref('/');
}

/** COA archive page — stays on peplab.com.au for SEO. */
export function coaArchiveUrl(): string {
  return `${MAIN_SITE_URL}${COA_ARCHIVE_PATH}`;
}

/** Prefix relative asset paths from the SEO site (.com.au). */
export function normalizeImageUrl(url: string | null | undefined): string {
  const raw = (url ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${MAIN_SITE_URL}${path}`;
}
