/** Main storefront homepage. */
export const HOME_PATH = '/';

/** Canonical shop / catalogue URL. */
export const SHOP_PATH = '/shop';

/** Marketing landing page (same app as shop). */
export const LANDING_PATH = '/landing';

/** Peptide reconstitution calculator. */
export const CALCULATOR_PATH = '/calculator';

/** Research peptide dosage / protocol chart. Temporarily unlinked from nav — path kept for restore. */
export const PROTOCOLS_PATH = '/protocols';

/** Published COA archive — all products with certificates on file. */
export const COA_ARCHIVE_PATH = '/coa';

/** Peptide research overview (educational / compliance content). */
export const RESEARCH_PATH = '/research';

/** Find Your Compound — research section compound index. */
export const RESEARCH_COMPOUNDS_PATH = '/research/compounds';

/** Retatrutide compound research overview (first of series). */
export const RESEARCH_RETATRUTIDE_PATH = '/research/compounds/retatrutide';

import { CONFIG } from '@/lib/config';

/** Full URL for external links (subdomain override via env). */
export const LANDING_SITE_URL =
  import.meta.env.VITE_LANDING_SITE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}${LANDING_PATH}`
    : `${CONFIG.SITE_URL.replace(/\/$/, '')}${LANDING_PATH}`);
