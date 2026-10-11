import { HOME_PATH } from '@/lib/routes';
import { DEFAULT_LANDING_PAGE_SETTINGS, getSiteSetting } from '@/lib/settings';
import { buildCrossDomainLoginUrl, MAIN_APP_ORIGIN, mainAppUrl } from '@/lib/domain';
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

/** Where to send a customer after login. Default is the shop homepage. */
export async function resolvePostLoginPath(redirectParam: string | null | undefined): Promise<string> {
  const safeRedirect = sanitizeRedirectPath(redirectParam ?? null);
  if (safeRedirect) return safeRedirect;
  return HOME_PATH;
}

/**
 * Navigate to the storefront after auth.
 * Same-origin (peplab.com.au): plain navigation.
 * Cross-origin (optional login-only staging host): hash token handoff.
 */
export async function handoffToMainApp(nextPath?: string | null): Promise<void> {
  const next = sanitizeRedirectPath(nextPath) ?? '/';
  if (typeof window === 'undefined') return;

  const currentOrigin = window.location.origin.replace(/\/+$/, '');
  if (currentOrigin === MAIN_APP_ORIGIN) {
    window.location.assign(`${MAIN_APP_ORIGIN}${next}`);
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
