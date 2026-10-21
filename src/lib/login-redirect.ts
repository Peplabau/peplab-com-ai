import { SHOP_PATH } from '@/lib/routes';
import { DEFAULT_LANDING_PAGE_SETTINGS, getSiteSetting } from '@/lib/settings';
import {
  buildCrossDomainLoginUrl,
  EXTERNAL_SHOP_ORIGIN,
  MAIN_APP_ORIGIN,
  externalShopUrl,
  mainAppUrl,
} from '@/lib/domain';
import { supabase } from '@/lib/supabase';

/**
 * Treat the canonical and www variants of the same production hostname as
 * equivalent. This prevents a customer visiting www.peplab.com.au from being
 * mistaken for an external host and handed off to peplab.ai after login.
 */
function isMainAppHost(origin: string): boolean {
  try {
    const normalize = (value: string) =>
      new URL(value).hostname.toLowerCase().replace(/^www\./, '');
    return normalize(origin) === normalize(MAIN_APP_ORIGIN);
  } catch {
    return false;
  }
}

/** Fetches the admin "Public catalog on peplab.com.au" toggle. */
async function isPublicStorefrontEnabled(): Promise<boolean> {
  const settings = await getSiteSetting(
    'landing_page_settings',
    DEFAULT_LANDING_PAGE_SETTINGS,
  );
  return settings.enabled === true;
}

/** Allow same-origin path redirects only (blocks protocol-relative URLs). */
export function sanitizeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;
    return decoded;
  } catch {
    return null;
  }
}

/** Where to send a customer after login. Default is peplab.ai home. */
export async function resolvePostLoginPath(redirectParam: string | null | undefined): Promise<string> {
  const safeRedirect = sanitizeRedirectPath(redirectParam ?? null);
  if (safeRedirect) return safeRedirect;
  return '/';
}

/**
 * After auth on an optional login-only host, hand the session to MAIN_APP_ORIGIN.
 * On peplab.com.au (same origin as MAIN_APP), this is a normal in-site navigation.
 */
export async function handoffToMainApp(nextPath?: string | null): Promise<void> {
  const next = sanitizeRedirectPath(nextPath) ?? SHOP_PATH;
  if (typeof window === 'undefined') return;

  const currentOrigin = window.location.origin.replace(/\/+$/, '');
  if (isMainAppHost(currentOrigin)) {
    window.location.assign(`${currentOrigin}${next}`);
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token && session.refresh_token) {
    window.location.assign(
      buildCrossDomainLoginUrl({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        next,
      }),
    );
    return;
  }

  window.location.assign(mainAppUrl(next));
}

/**
 * Post-login shop handoff.
 *
 * Routing:
 *   peplab.ai                        → navigate locally (open storefront).
 *   peplab.com.au, admin toggle ON   → navigate locally (open storefront is
 *                                      served from this host — no cross-domain
 *                                      handoff needed).
 *   peplab.com.au, admin toggle OFF  → hand the Supabase session to peplab.ai
 *                                      (current locked-mode behavior).
 *   any other host (login-only)      → hand the Supabase session to peplab.ai.
 */
export async function handoffToExternalShop(nextPath?: string | null): Promise<void> {
  const next = sanitizeRedirectPath(nextPath) ?? '/';
  if (typeof window === 'undefined') return;

  const currentOrigin = window.location.origin.replace(/\/+$/, '');

  // Already on peplab.ai — just navigate locally.
  if (currentOrigin === EXTERNAL_SHOP_ORIGIN) {
    window.location.assign(`${currentOrigin}${next}`);
    return;
  }

  // On peplab.com.au with the admin "Public catalog" toggle ON — the open
  // storefront lives on this host, so stay here instead of crossing domains.
  if (isMainAppHost(currentOrigin) && (await isPublicStorefrontEnabled())) {
    window.location.assign(`${currentOrigin}${next}`);
    return;
  }

  // Fallback — hand the Supabase session off to peplab.ai so the user lands
  // on the external shop already signed in.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token && session.refresh_token) {
    window.location.assign(
      buildCrossDomainLoginUrl({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        next,
        origin: EXTERNAL_SHOP_ORIGIN,
      }),
    );
    return;
  }

  window.location.assign(externalShopUrl(next));
}
