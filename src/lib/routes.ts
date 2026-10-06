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

/** GHK-Cu compound research overview. */
export const RESEARCH_GHK_CU_PATH = '/research/compounds/ghk-cu';

/** MOTS-C compound research overview. */
export const RESEARCH_MOTS_C_PATH = '/research/compounds/mots-c';

/** BPC-157 + TB-500 blend research overview. */
export const RESEARCH_BPC_TB_PATH = '/research/compounds/bpc-157-tb-500';

/** Tirzepatide compound research overview. */
export const RESEARCH_TIRZEPATIDE_PATH = '/research/compounds/tirzepatide';

/** Tesamorelin compound research overview. */
export const RESEARCH_TESAMORELIN_PATH = '/research/compounds/tesamorelin';

import { CONFIG } from '@/lib/config';

/** Full URL for external links (subdomain override via env). */
export const LANDING_SITE_URL =
  import.meta.env.VITE_LANDING_SITE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}${LANDING_PATH}`
    : `${CONFIG.SITE_URL.replace(/\/$/, '')}${LANDING_PATH}`);
