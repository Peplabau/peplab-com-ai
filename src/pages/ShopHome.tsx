import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import { SEO } from '@/components/SEO';
import { SITE_SEO_DESCRIPTION, SITE_SEO_KEYWORDS, SITE_SEO_TITLE } from '@/lib/seo-keywords';
import Catalog from '@/sections/Catalog';
import HomeLanding from '@/pages/HomeLanding';
import TrustpilotReviews from '@/sections/TrustpilotReviews';
import LeaderboardTop3 from '@/sections/LeaderboardTop3';
// Wholesale / bulk supply section — commented out on home and shop.
// import BulkSales from '@/sections/BulkSales';
import Quality from '@/sections/Quality';
import HomeSeoContent from '@/sections/HomeSeoContent';
import Footer from '@/sections/Footer';

gsap.registerPlugin(ScrollTrigger);

/**
 * Full public storefront used on `/` and `/shop`.
 *
 * Rendered in two cases:
 *   - peplab.ai (always — the open shop host).
 *   - peplab.com.au, with the catalog swapped for the lock card when the
 *     admin "Public catalog" toggle is off. Sections below the catalog stay.
 *
 * Mirrors the peplab.ai HomePage: catalog, Trustpilot reviews, promoter
 * leaderboard, quality/standards, long-form Elite Peptides SEO copy, and the
 * site footer — plus GSAP ScrollTrigger snap for pinned sections. The wholesale
 * bulk-sales section is commented out.
 */
export default function ShopHome({ catalogLocked = false }: { catalogLocked?: boolean }) {
  // Pinned-section snap behaviour, copied from peplab.ai HomePage. Only
  // activates when at least one ScrollTrigger has `pin: true`; otherwise
  // normal free scrolling is preserved.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);

      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value) => {
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.02 && value <= r.end + 0.02,
            );

            // Outside any pinned section → let the user scroll freely.
            if (!inPinned) return value;

            // Inside a pinned section → snap to the nearest pin's centre.
            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0,
            );

            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
      <SEO
        title={SITE_SEO_TITLE}
        description={SITE_SEO_DESCRIPTION}
        keywords={SITE_SEO_KEYWORDS}
      />
      <div className="relative min-h-screen page-grid-bg">
        {/* Navigation */}
        <Navigation />

        {/* Cart drawer */}
        <CartDrawer />

        {/* Main content */}
        <main className="relative z-10">
          {/* Product catalog, or the lock card when the admin toggle is off. */}
          {catalogLocked ? <HomeLanding embedded /> : <Catalog />}

          {/* Trustpilot reviews */}
          <TrustpilotReviews />

          {/* Promoter leaderboard — top 3 podium with CTA to /leaderboard */}
          <LeaderboardTop3 />

          {/* Wholesale / bulk supply — commented out on home and shop.
          <BulkSales />
          */}

          {/* Quality — merged purity / standards / quality / trust */}
          <Quality />

          {/* Elite Peptides Australia — long-form SEO content */}
          <HomeSeoContent />

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </>
  );
}
