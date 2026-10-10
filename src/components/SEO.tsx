import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CONFIG } from '@/lib/config';
import { publicCanonicalOrigin } from '@/lib/domain';
import { SITE_SEO_DESCRIPTION, SITE_SEO_KEYWORDS, SITE_SEO_TITLE } from '@/lib/seo-keywords';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string | readonly string[];
  ogImage?: string;
  noIndex?: boolean;
}

const INDEXABLE_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

/** Canonical URL for this deployment. Query strings are not part of the canonical. */
function canonicalUrl(pathname: string): string {
  const origin = publicCanonicalOrigin();
  const path = pathname.replace(/\/+$/, '') || '/';
  return `${origin}${path === '/' ? '/' : path}`;
}

export function SEO({
  title = SITE_SEO_TITLE,
  description = SITE_SEO_DESCRIPTION,
  keywords = SITE_SEO_KEYWORDS,
  ogImage,
  noIndex = false,
}: SEOProps) {
  const location = useLocation();
  const origin = publicCanonicalOrigin();
  const pageUrl = canonicalUrl(location.pathname);
  const keywordsText = Array.isArray(keywords) ? keywords.join(', ') : keywords;
  const resolvedOgImage =
    ogImage ?? `${origin}${CONFIG.SHARE_PREVIEW_IMAGE_PATH}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    const faviconHref = `${origin}${CONFIG.FAVICON_PATH}`;
    const ensureLink = (rel: string, attrs: Record<string, string>) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.href = faviconHref;
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };
    ensureLink('icon', { type: 'image/png', sizes: '192x192' });
    ensureLink('apple-touch-icon', { sizes: '180x180' });

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywordsText },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: resolvedOgImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'PEPLAB — Peptides Australia' },
      { property: 'og:site_name', content: SITE_SEO_TITLE },
      { property: 'og:url', content: pageUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_AU' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@peplab_au' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: resolvedOgImage },
    ];

    if (noIndex) {
      metaTags.push({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      metaTags.push({ name: 'robots', content: INDEXABLE_ROBOTS });
    }

    metaTags.forEach(({ name, property, content }) => {
      let tag: HTMLMetaElement | null = null;
      if (property) {
        tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
      } else if (name) {
        tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
      }
      if (tag) {
        tag.setAttribute('content', content);
      }
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    const setAlternate = (hreflang: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hreflang;
        document.head.appendChild(link);
      }
      link.href = pageUrl;
    };
    setAlternate('en-AU');
    setAlternate('x-default');
  }, [title, description, keywordsText, resolvedOgImage, noIndex, pageUrl, origin]);

  return null;
}

// Google Analytics — disabled pending new GTM/GMC setup
export function GoogleAnalytics() {
  /*
  useEffect(() => {
    if (!CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', CONFIG.GA_MEASUREMENT_ID);
  }, []);
  */

  return null;
}

/** Fires GA page_view on client-side route changes (BrowserRouter). Disabled pending new GTM/GMC setup. */
export function RouteChangeTracker() {
  /*
  const location = useLocation();

  useEffect(() => {
    if (!CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      return;
    }
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
  */

  return null;
}

// Add gtag to window — disabled pending new GTM/GMC setup
/*
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
*/
export default SEO;