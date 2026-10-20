import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import Catalog from '@/sections/Catalog';
import { SEO } from '@/components/SEO';
import { SITE_SEO_DESCRIPTION, SITE_SEO_KEYWORDS, SITE_SEO_TITLE } from '@/lib/seo-keywords';

/**
 * Logged-in storefront on peplab.com.au — catalog with promo strip, no footer.
 */
export default function ShopHome() {
  return (
    <>
      <SEO
        title={SITE_SEO_TITLE}
        description={SITE_SEO_DESCRIPTION}
        keywords={SITE_SEO_KEYWORDS}
      />
      <div className="relative min-h-screen page-grid-bg">
        <Navigation />
        <CartDrawer />
        <main className="relative z-10">
          <Catalog />
        </main>
      </div>
    </>
  );
}
