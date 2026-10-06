import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertTriangle,
  ExternalLink,
  FlaskConical,
  HelpCircle,
  Microscope,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import ProductImage from '@/components/ProductImage';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import {
  COA_ARCHIVE_PATH,
  RESEARCH_PATH,
  RESEARCH_COMPOUNDS_PATH,
  RESEARCH_CJC_IPA_PATH,
  RESEARCH_TESAMORELIN_PATH,
} from '@/lib/routes';
import { resolveProductSlug } from '@/lib/product-slug-aliases';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import Footer from '@/sections/Footer';

const sectionClass =
  'p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]';
const bodyClass = 'text-[#A9B3C7] leading-relaxed';
const linkClass = 'text-[#2ED1B4] hover:underline';
const h2Class = 'text-xl font-bold text-[#F4F6FA]';
const h3Class = 'text-lg font-semibold text-[#F4F6FA] mb-2';

const FEATURE_ROWS = [
  { feature: 'Material name', details: 'CJC-1295 No DAC + ipamorelin blend' },
  { feature: 'Compound type', details: 'Two-component peptide mixture' },
  {
    feature: 'GHRH-related component',
    details: 'Confirm exact No DAC sequence and modifications',
  },
  { feature: 'Second component', details: 'Ipamorelin' },
  {
    feature: 'Research pathways',
    details: 'GHRH and growth hormone secretagogue receptor systems',
  },
  {
    feature: 'Evidence base',
    details:
      'Component studies; exact-blend efficacy not established by the cited trials',
  },
] as const;

const GLANCE_ROWS = [
  {
    area: 'CJC-1295 pharmacology',
    investigated: 'Long-acting preparation in humans',
    distinction: 'Not equivalent to No DAC',
  },
  {
    area: 'Ipamorelin activity',
    investigated: 'Hormonal response after IV administration',
    distinction: 'Not a trial of the blend or another route',
  },
  {
    area: 'Combination claims',
    investigated: 'Mechanistic rationale',
    distinction: 'Synergy and clinical benefit remain unestablished here',
  },
] as const;

const FAQS = [
  {
    q: 'What does No DAC mean?',
    a: 'It indicates the absence of the drug-affinity complex associated with long-acting CJC-1295. Verify the actual peptide sequence rather than relying on shorthand naming.',
  },
  {
    q: 'Can I use CJC-1295 half-life figures for No DAC?',
    a: 'No. The multi-day figures in the cited human trial relate to its long-acting preparation. They do not describe this blend.',
  },
  {
    q: 'Why are these peptides combined?',
    a: 'They are associated with different growth hormone-release pathways. That offers a hypothesis to investigate, not proof of synergy or clinical benefit.',
  },
  {
    q: 'Has this exact blend been clinically proven?',
    a: 'The cited primary studies tested components or another CJC-1295 preparation. They do not validate the exact No DAC blend.',
  },
  {
    q: 'Does it contain HGH?',
    a: 'The named ingredients are growth hormone secretagogues or releasing-hormone analogues, not growth hormone itself.',
  },
  {
    q: 'Does research prove better sleep or muscle growth?',
    a: 'Hormonal responses alone do not prove either outcome. Those claims require direct studies measuring sleep or body composition with appropriate controls.',
  },
] as const;

const LINKS = {
  cjcLongActing: 'https://doi.org/10.1210/jc.2005-1536',
  ipamorelinVolunteer: 'https://doi.org/10.1023/A:1018955126402',
  pharmacology: 'https://doi.org/10.1530/eje.0.1390552',
} as const;

const PRODUCT_SLUG = 'cjc-1295-no-dac-ipa-5mg';

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function ResearchCjcIpaBlend() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadProductsFromSupabase()
      .then((products) => {
        if (cancelled) return;
        const slug = resolveProductSlug(PRODUCT_SLUG).toLowerCase();
        const product = products.find(
          (p) =>
            p.id.toLowerCase() === slug ||
            p.id.toLowerCase() === PRODUCT_SLUG ||
            (p.name.toLowerCase().includes('cjc') &&
              p.name.toLowerCase().includes('ipamorelin')),
        );
        if (!product) return;
        const dosageImage = product.dosages?.find((d) => d.imageUrl)?.imageUrl;
        setImageSrc(dosageImage || product.image || '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEO
        title={PAGE_SEO.researchCjcIpa.title}
        description={PAGE_SEO.researchCjcIpa.description}
      />
      <JsonLd
        id="research-cjc-ipa-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: 'CJC-1295 No DAC + Ipamorelin', path: RESEARCH_CJC_IPA_PATH },
        ])}
      />

      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <ContentPageHeader />

        <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="mx-auto mb-6 h-28 w-24 overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] flex items-center justify-center">
                {imageSrc ? (
                  <ProductImage
                    src={imageSrc}
                    alt="CJC-1295 No DAC + Ipamorelin blend research vial"
                    className="h-full w-full object-contain p-2"
                    variant="card"
                  />
                ) : (
                  <FlaskConical className="w-10 h-10 text-[#8B5CF6] opacity-60" />
                )}
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#2ED1B4] mb-3">
                Peptide Blends / Growth Hormone
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
                CJC-1295 No DAC + Ipamorelin Blend Research{' '}
                <span className="gradient-text">Overview</span>
              </h1>
              <p className={`${bodyClass} text-base sm:text-lg max-w-2xl mx-auto`}>
                GHRH and Ghrelin-Receptor Pathway Research
              </p>
            </div>

            <div className="space-y-6">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  CJC-1295 No DAC + ipamorelin is a blend associated with research into growth
                  hormone release. The components are intended to act through different receptor
                  systems. However, studies of long-acting CJC-1295, ipamorelin alone and the exact
                  No DAC blend represent separate evidence and should not be presented as
                  interchangeable.
                </p>
                <p className={bodyClass}>
                  For guidance on study design and analytical evidence, visit PEPLAB’s{' '}
                  <Link to={RESEARCH_PATH} className={linkClass}>
                    Research Overview
                  </Link>
                  .
                </p>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>
                  What Is CJC-1295 No DAC + Ipamorelin Blend?
                </h2>
                <div className="space-y-4 mb-6">
                  <p className={bodyClass}>
                    “CJC-1295 No DAC” is a commercial name commonly used for a modified GHRH
                    fragment without the drug-affinity complex associated with long-acting
                    CJC-1295. The label should be checked against the actual sequence. Ipamorelin is
                    a synthetic pentapeptide that acts through the growth hormone secretagogue
                    receptor, also known as the ghrelin receptor.
                  </p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[rgba(244,246,250,0.08)]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.5)]">
                        <th className="px-4 py-3 font-semibold text-[#F4F6FA]">Feature</th>
                        <th className="px-4 py-3 font-semibold text-[#F4F6FA]">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURE_ROWS.map((row) => (
                        <tr
                          key={row.feature}
                          className="border-b border-[rgba(244,246,250,0.06)] last:border-0"
                        >
                          <td className="px-4 py-3 text-[#F4F6FA] font-medium align-top whitespace-nowrap">
                            {row.feature}
                          </td>
                          <td className="px-4 py-3 text-[#A9B3C7]">{row.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center flex-shrink-0">
                    <Microscope className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>
                    How Does CJC-1295 No DAC + Ipamorelin Blend Work?
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>GHRH Pathway</h3>
                    <p className={bodyClass}>
                      A correctly identified GHRH analogue is investigated for pituitary growth
                      hormone release. Removing an albumin-binding modification changes the material
                      and prevents direct transfer of long-acting pharmacokinetic claims.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Ghrelin-Receptor Pathway</h3>
                    <p className={bodyClass}>
                      Ipamorelin has demonstrated growth hormone-releasing activity through the
                      secretagogue receptor system. Its biological target differs from the GHRH
                      receptor.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Combination Rationale</h3>
                    <p className={bodyClass}>
                      Two pathways provide a research rationale for studying a combination. They do
                      not prove that a particular mixture improves sleep, recovery, body composition
                      or long-term outcomes.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-6`}>
                  CJC-1295 No DAC + Ipamorelin Blend Research Findings
                </h2>
                <div className="space-y-8">
                  <div>
                    <h3 className={h3Class}>The CJC-1295 Study and DAC Distinction</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2006 human study examined a long-acting CJC-1295 preparation and reported
                        sustained GH and IGF-1 responses. Its reported multi-day half-life belongs to
                        that tested preparation. It should not be assigned to a product labelled No
                        DAC or used as a clinical trial of this blend.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.cjcLongActing}>
                          Read the long-acting CJC-1295 study
                        </ExtLink>
                        .
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Ipamorelin in Human Volunteers</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 1999 study measured ipamorelin pharmacokinetics and growth hormone
                        responses following intravenous administration in healthy male volunteers. It
                        supports a specific human hormonal response, not the safety or effectiveness
                        of a subcutaneous No DAC combination.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.ipamorelinVolunteer}>
                          Read the ipamorelin volunteer study
                        </ExtLink>
                        .
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>What the Blend Evidence Can Establish</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        The primary studies linked here did not administer the exact CJC-1295 No DAC
                        + ipamorelin mixture. To demonstrate a blend-specific benefit, a study would
                        need verified component identity, a stated ratio, suitable controls and
                        relevant clinical endpoints. Hormone changes alone would not establish better
                        sleep or faster injury recovery.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.pharmacology}>
                          Review the component pharmacology study
                        </ExtLink>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>Research Findings at a Glance</h2>
                <div className="overflow-x-auto rounded-xl border border-[rgba(244,246,250,0.08)]">
                  <table className="w-full text-left text-sm min-w-[36rem]">
                    <thead>
                      <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.5)]">
                        <th className="px-4 py-3 font-semibold text-[#F4F6FA]">Research area</th>
                        <th className="px-4 py-3 font-semibold text-[#F4F6FA]">
                          What studies have investigated
                        </th>
                        <th className="px-4 py-3 font-semibold text-[#F4F6FA]">
                          Important distinction
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {GLANCE_ROWS.map((row) => (
                        <tr
                          key={row.area}
                          className="border-b border-[rgba(244,246,250,0.06)] last:border-0"
                        >
                          <td className="px-4 py-3 text-[#F4F6FA] font-medium align-top">
                            {row.area}
                          </td>
                          <td className="px-4 py-3 text-[#A9B3C7] align-top">{row.investigated}</td>
                          <td className="px-4 py-3 text-[#A9B3C7] align-top">{row.distinction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>Safety and Research Limitations</h2>
                <div className="space-y-4">
                  <p className={bodyClass}>
                    The cited studies do not establish long-term safety of the exact blend. Endocrine
                    activity should not be treated as evidence of harmlessness, and a short
                    pharmacology study cannot identify every clinically important effect. Claims of
                    being side-effect-free, avoiding all cortisol effects or guaranteeing improved
                    sleep are not supported by the blend evidence presented here.
                  </p>
                  <p className={bodyClass}>
                    This page summarises scientific evidence and does not provide instructions for
                    personal use.
                  </p>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-6 h-6 text-[#2ED1B4]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>
                    Understanding CJC-1295 No DAC + Ipamorelin Blend Testing and COAs
                  </h2>
                </div>
                <p className={`${bodyClass} mb-3`}>
                  Analytical methods answer different questions. A Certificate of Analysis should
                  identify the submitted sample and report the actual measurements performed.
                </p>
                <ul className="space-y-2 text-[#A9B3C7] mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Purity:</strong> Chromatographic testing
                      measures detected components under specified conditions; a percentage alone does
                      not establish vial content.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Identity:</strong> Appropriate methods, such
                      as mass spectrometry with complementary analysis where needed, assess
                      consistency with the stated material.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Content:</strong> A validated quantitative
                      assay measures the amount of the specified analyte or each blend component.
                    </span>
                  </li>
                </ul>
                <p className={`${bodyClass} mb-4`}>
                  Confirm the exact No DAC sequence, absence of the DAC modification, ipamorelin
                  identity and the quantitative content of each peptide. A single total blend amount
                  or purity percentage cannot verify the component ratio.
                </p>
                <p className={bodyClass}>
                  Purity does not establish sterility, endotoxin status or clinical effectiveness.
                  Explore PEPLAB’s{' '}
                  <Link to="/standards" className={linkClass}>
                    Quality &amp; Testing
                  </Link>{' '}
                  information and available{' '}
                  <Link to={COA_ARCHIVE_PATH} className={linkClass}>
                    COA Results
                  </Link>
                  , checking whether a report covers the material and batch being assessed.
                </p>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(236,72,153,0.1)] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-[#EC4899]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>Frequently Asked Questions</h2>
                </div>
                <div className="space-y-5">
                  {FAQS.map((faq) => (
                    <div key={faq.q}>
                      <h3 className={h3Class}>{faq.q}</h3>
                      <p className={bodyClass}>{faq.a}</p>
                    </div>
                  ))}
                  <div>
                    <h3 className={h3Class}>
                      Where can I find CJC-1295 No DAC + Ipamorelin Blend research papers?
                    </h3>
                    <p className={bodyClass}>
                      Start with the original-study links above. Check the molecule, formulation,
                      study population and measured outcomes before applying a finding to another
                      preparation.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>Explore PEPLAB Research</h2>
                <p className={`${bodyClass} mb-6`}>
                  Visit our Research Overview for guidance on scientific evidence and laboratory
                  testing. Select Find Your Compound to explore other compound-specific research
                  pages.
                </p>
                <p className={`${bodyClass} mb-6 text-sm`}>
                  Related research:{' '}
                  <span className="text-[#6B7280]">Ipamorelin (coming soon)</span>
                  {' · '}
                  <Link to={RESEARCH_TESAMORELIN_PATH} className={linkClass}>
                    Tesamorelin
                  </Link>
                  .
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={RESEARCH_PATH}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2ED1B4] px-5 py-3 text-sm font-semibold text-[#070A12] hover:bg-[#26b89e] transition-colors"
                  >
                    Research Overview
                  </Link>
                  <Link
                    to={RESEARCH_COMPOUNDS_PATH}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(244,246,250,0.15)] px-5 py-3 text-sm font-semibold text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.05)] transition-colors"
                  >
                    Find Your Compound
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </section>

              <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)]">
                <div className="flex items-start gap-4 mb-3">
                  <AlertTriangle className="w-6 h-6 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <h2 className={h2Class}>Research use only</h2>
                </div>
                <p className={bodyClass}>
                  This page provides scientific information, not medical advice, dosing instructions
                  or recommendations for human or veterinary use. References to external studies do
                  not imply endorsement of PEPLAB or its products.
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
