import { LANDING_SITE_URL, MAIN_SITE_URL } from '@/lib/site';

/** Shop hostname shown in the footer, e.g. peplab.com.au */
export function siteHostname(): string {
  try {
    return new URL(MAIN_SITE_URL || LANDING_SITE_URL).hostname;
  } catch {
    return 'peplab.com.au';
  }
}
