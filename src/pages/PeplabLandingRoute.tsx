/**
 * SEO marketing landing at peplab.com.au/landing — Research Gateway.
 */
import { useEffect, useState } from 'react';
import '@/landing/index.css';
import '@/landing/research-atelier.css';
import BrandSplash from '@/landing/components/BrandSplash';
import ResearchGateway from '@/landing/pages/ResearchGateway';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import {
  DEFAULT_LANDING_PAGE_SETTINGS,
  getSiteSetting,
  isPublicStorefrontEnabledSync,
} from '@/lib/settings';

export default function PeplabLandingRoute() {
  // Prime the admin "Public catalog on peplab.com.au" toggle so the Shop CTAs
  // inside ResearchGateway (which read the cached value synchronously via
  // `resolveShopHref`) re-render with the correct destination on cold loads.
  // The `publicStorefrontOn` state is only used as a render-key here —
  // changing it forces the subtree to pick up the newly-cached setting.
  const [publicStorefrontOn, setPublicStorefrontOn] = useState(() =>
    isPublicStorefrontEnabledSync(),
  );

  useEffect(() => {
    let cancelled = false;
    void getSiteSetting('landing_page_settings', DEFAULT_LANDING_PAGE_SETTINGS)
      .then((settings) => {
        if (cancelled) return;
        setPublicStorefrontOn(settings.enabled === true);
      })
      .catch(() => {
        /* keep whatever the sync cache gave us */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <BrandSplash />
      <Navigation logoHref="/landing" />
      <CartDrawer />
      {/* `key` forces the gateway (and all its Shop CTAs) to re-render once
          the admin toggle resolves. Stable string so React only remounts when
          the boolean actually changes. */}
      <ResearchGateway key={publicStorefrontOn ? 'public' : 'locked'} />
    </>
  );
}
