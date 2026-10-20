import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import Catalog from '@/sections/Catalog';
import TrustpilotReviews from '@/sections/TrustpilotReviews';
import LeaderboardTop3 from '@/sections/LeaderboardTop3';
import BulkSales from '@/sections/BulkSales';
import Quality from '@/sections/Quality';
import Footer from '@/sections/Footer';
import { SEO } from '@/components/SEO';
import { SITE_SEO_DESCRIPTION, SITE_SEO_KEYWORDS, SITE_SEO_TITLE } from '@/lib/seo-keywords';

/**
 * Public storefront used for the `/` and `/shop` routes.
 *
 * Rendered in two cases:
 *   - peplab.ai (always — the open shop host).
 *   - peplab.com.au when the admin toggles "Public catalog on peplab.com.au" ON.
 *
 * Mirrors the old full peplab.com.au homepage layout: catalog followed by
 * Trustpilot reviews, promoter leaderboard, bulk-sales CTA, quality/standards
 * section, and the site footer.
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
          {/* Shop — product catalog */}
          <Catalog />

          {/* Trustpilot reviews carousel */}
          <TrustpilotReviews />

          {/* Promoter leaderboard — top 3 podium with CTA to /leaderboard */}
          <LeaderboardTop3 />

          {/* Bulk sales / wholesale */}
          <BulkSales />

          {/* Quality / standards / purity / trust */}
          <Quality />

          {/* Site footer */}
          <Footer />
        </main>
      </div>
    </>
  );
}
