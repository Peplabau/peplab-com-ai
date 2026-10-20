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

export async function isLandingPageEnabled(): Promise<boolean> {
  const settings = await getSiteSetting('landing_page_settings', DEFAULT_LANDING_PAGE_SETTINGS);
  return settings.enabled !== false;
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
  if (currentOrigin === MAIN_APP_ORIGIN) {
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
 * After login on peplab.com.au home/shop/login, hand the session to peplab.ai.
 */
export async function handoffToExternalShop(nextPath?: string | null): Promise<void> {
  const next = sanitizeRedirectPath(nextPath) ?? '/';
  if (typeof window === 'undefined') return;

  const currentOrigin = window.location.origin.replace(/\/+$/, '');
  if (currentOrigin === EXTERNAL_SHOP_ORIGIN) {
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
        origin: EXTERNAL_SHOP_ORIGIN,
      }),
    );
    return;
  }

  window.location.assign(externalShopUrl(next));
}
