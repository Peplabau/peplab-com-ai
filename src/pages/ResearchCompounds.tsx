import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Search } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import { RESEARCH_PATH, RESEARCH_COMPOUNDS_PATH, COA_ARCHIVE_PATH } from '@/lib/routes';
import { RESEARCH_COMPOUNDS } from '@/lib/research-compounds';
import Footer from '@/sections/Footer';
import { ResearchSectionNav } from '@/components/ResearchSectionNav';

export default function ResearchCompounds() {
  const [query, setQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);

  const compounds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...RESEARCH_COMPOUNDS].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.cardDescription.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <SEO
        title={PAGE_SEO.researchCompounds.title}
        description={PAGE_SEO.researchCompounds.description}
      />
      <JsonLd
        id="research-compounds-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
        ])}
      />

      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />

        <nav className="relative z-50 px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex flex-col items-start">
              <span className="text-3xl lg:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
                PEPLAB
              </span>
              <span className="text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">
                PEPTIDES AUSTRALIA
              </span>
            </Link>
            <Link
              to={RESEARCH_PATH}
              className="flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Overview
            </Link>
          </div>
        </nav>

        <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <ResearchSectionNav active="compounds" />

            <div className="mt-10 mb-8">
              <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#2ED1B4] mb-3">
                The Research Library
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
                Find Your <span className="gradient-text">Compound</span>
              </h1>
              <Link
                to={COA_ARCHIVE_PATH}
                className="inline-flex items-center gap-1.5 text-sm text-[#A9B3C7] hover:text-[#2ED1B4] transition-colors"
              >
                Looking for a batch report? View the COA library
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mb-4 relative">
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-[rgba(244,246,250,0.1)] bg-[rgba(17,24,39,0.75)] px-4 py-3.5 text-left text-sm text-[#F4F6FA]"
              >
                <span>Browse compounds A–Z</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#A9B3C7] transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {sortOpen && (
                <div className="mt-2 rounded-xl border border-[rgba(244,246,250,0.1)] bg-[rgba(17,24,39,0.95)] p-3">
                  <label className="relative block">
                    <span className="sr-only">Search compounds</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name…"
                      autoFocus
                      className="w-full rounded-lg border border-[rgba(244,246,250,0.08)] bg-[#070A12] py-2.5 pl-10 pr-3 text-sm text-[#F4F6FA] placeholder:text-[#6B7280] outline-none focus:border-[rgba(46,209,180,0.4)]"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {compounds.length === 0 ? (
                <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-8 text-center text-[#A9B3C7]">
                  No compounds matched “{query.trim()}”.
                </div>
              ) : (
                compounds.map((compound) => {
                  const CardInner = (
                    <>
                      <div className="flex gap-4 p-4 sm:p-5">
                        <div className="h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-[rgba(7,10,18,0.8)] border border-[rgba(244,246,250,0.06)]">
                          <img
                            src={compound.image}
                            alt=""
                            className="h-full w-full object-contain p-1"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#2ED1B4] mb-1.5">
                            {compound.category}
                          </p>
                          <h2 className="text-lg sm:text-xl font-bold text-[#F4F6FA] mb-2 leading-snug">
                            {compound.cardTitle}
                          </h2>
                          <p className="text-sm text-[#A9B3C7] leading-relaxed">
                            {compound.cardDescription}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-[rgba(244,246,250,0.06)] px-4 sm:px-5 py-3">
                        {compound.overviewPath ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2ED1B4]">
                            Read overview
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-sm text-[#6B7280]">Overview coming soon</span>
                        )}
                      </div>
                    </>
                  );

                  if (compound.overviewPath) {
                    return (
                      <Link
                        key={compound.slug}
                        to={compound.overviewPath}
                        className="block rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.65)] transition-colors hover:border-[rgba(46,209,180,0.35)] hover:bg-[rgba(17,24,39,0.85)]"
                      >
                        {CardInner}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={compound.slug}
                      className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.45)] opacity-80"
                    >
                      {CardInner}
                    </div>
                  );
                })
              )}
            </div>

            <p className="mt-10 text-center text-sm text-[#6B7280]">
              More compound overviews will be added over time. Research use only.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
