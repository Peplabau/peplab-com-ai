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
  { feature: 'Compound name', details: 'Tesamorelin' },
  { feature: 'Compound type', details: 'Synthetic GHRH analogue' },
  { feature: 'Peptide length', details: '44 amino acids' },
  {
    feature: 'Primary pathway',
    details: 'GHRH receptor → growth hormone → IGF-1',
  },
  {
    feature: 'Research areas',
    details: 'HIV-associated visceral adiposity and liver fat',
  },
  {
    feature: 'Evidence base',
    details: 'Randomised human studies; authorised US medicinal formulations',
  },
] as const;

const GLANCE_ROWS = [
  {
    area: 'Visceral fat',
    investigated: 'Changes in internal abdominal fat',
    distinction: 'Different from total weight loss or subcutaneous fat',
  },
  {
    area: 'Liver fat',
    investigated: 'Imaging-based changes in adults with HIV',
    distinction: 'Not proof of benefit for every liver condition',
  },
  {
    area: 'Hormonal response',
    investigated: 'GH and IGF-1 activity',
    distinction: 'Biomarker changes require clinical interpretation',
  },
] as const;

const FAQS = [
  {
    q: 'Is tesamorelin the same as HGH?',
    a: 'No. Tesamorelin stimulates growth hormone release through GHRH receptors. HGH preparations contain growth hormone itself.',
  },
  {
    q: 'Is tesamorelin a general weight-loss compound?',
    a: 'Its strongest clinical evidence concerns excess visceral fat in adults with HIV-associated lipodystrophy. That is different from demonstrating general weight-loss effectiveness.',
  },
  {
    q: 'What is visceral fat?',
    a: 'Visceral fat is fat stored around internal abdominal organs. It is distinct from subcutaneous fat located beneath the skin.',
  },
  {
    q: 'Has tesamorelin been studied for liver fat?',
    a: 'Yes. Human studies have examined liver fat in adults with HIV. The population and measured outcomes limit how widely those findings apply.',
  },
  {
    q: 'Does tesamorelin research prove better sleep?',
    a: 'The visceral-fat and liver-fat trials discussed here do not establish tesamorelin as a treatment for insomnia or a general sleep enhancer.',
  },
  {
    q: 'Are tesamorelin and ipamorelin the same?',
    a: 'No. Tesamorelin acts through GHRH receptors; ipamorelin acts through the growth hormone secretagogue receptor system. Shared hormonal effects do not make them interchangeable.',
  },
] as const;

const LINKS = {
  visceralFat: 'https://doi.org/10.1097/QAI.0b013e3181d9a330',
  liverFat: 'https://jamanetwork.com/journals/jama/fullarticle/1889139',
  prescribing:
    'https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/022505s020lbl.pdf',
} as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function ResearchTesamorelin() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadProductsFromSupabase()
      .then((products) => {
        if (cancelled) return;
        const slug = resolveProductSlug('tesamorelin').toLowerCase();
        const product = products.find(
          (p) =>
            p.id.toLowerCase() === slug ||
            p.id.toLowerCase() === 'tesamorelin' ||
            p.name.toLowerCase().includes('tesamorelin'),
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
        title={PAGE_SEO.researchTesamorelin.title}
        description={PAGE_SEO.researchTesamorelin.description}
      />
      <JsonLd
        id="research-tesamorelin-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: 'Tesamorelin', path: RESEARCH_TESAMORELIN_PATH },
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
                    alt="Tesamorelin research vial"
                    className="h-full w-full object-contain p-2"
                    variant="card"
                  />
                ) : (
                  <FlaskConical className="w-10 h-10 text-[#8B5CF6] opacity-60" />
                )}
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#2ED1B4] mb-3">
                Growth Hormone / GHRH
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
                Tesamorelin Research <span className="gradient-text">Overview</span>
              </h1>
              <p className={`${bodyClass} text-base sm:text-lg max-w-2xl mx-auto`}>
                Growth Hormone Signalling and Visceral Fat Research
              </p>
            </div>

            <div className="space-y-6">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  Tesamorelin is a synthetic growth hormone-releasing hormone analogue studied mainly
                  in adults with HIV-associated abdominal fat accumulation. It stimulates the body’s
                  growth hormone pathway rather than supplying growth hormone directly. This page
                  reviews visceral-fat findings, liver-fat research and the limits of applying those
                  results to other populations.
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
                <h2 className={`${h2Class} mb-4`}>What Is Tesamorelin?</h2>
                <div className="space-y-4 mb-6">
                  <p className={bodyClass}>
                    Tesamorelin is an analogue of growth hormone-releasing hormone, also called growth
                    hormone-releasing factor. It acts at the pituitary to stimulate growth hormone
                    secretion, with downstream effects on insulin-like growth factor-1, or IGF-1.
                    Visceral fat surrounds internal organs and is different from subcutaneous fat
                    beneath the skin.
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
                  <h2 className={`${h2Class} pt-2`}>How Does Tesamorelin Work?</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>Pituitary Signalling</h3>
                    <p className={bodyClass}>
                      Tesamorelin activates GHRH receptors, stimulating endogenous growth hormone
                      release. It is a releasing-hormone analogue, not recombinant human growth
                      hormone.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>IGF-1 Response</h3>
                    <p className={bodyClass}>
                      Growth hormone influences IGF-1 production. IGF-1 changes are biological markers
                      of activity, but a higher marker does not automatically mean a better clinical
                      outcome.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Body-Fat Distribution</h3>
                    <p className={bodyClass}>
                      Research focuses on visceral adipose tissue. A decrease in this compartment
                      should not be represented as an equivalent percentage loss of total body weight.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-6`}>Tesamorelin Research Findings</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className={h3Class}>Visceral Adipose Tissue</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A randomised study published in 2010 enrolled 404 adults with HIV and excess
                        abdominal fat. During the initial six months, visceral adipose tissue
                        decreased more with tesamorelin than placebo. Participants continuing treatment
                        maintained a different trajectory from those switched to placebo; benefits
                        diminished after withdrawal.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.visceralFat}>Read the visceral-fat trial</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Liver-Fat Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2014 <em>JAMA</em> trial studied 50 adults with HIV and abdominal fat
                        accumulation. Over six months, tesamorelin was associated with reductions in
                        visceral fat and liver fat compared with placebo. This was a defined HIV
                        population, and the authors called for further work on the long-term clinical
                        importance of the findings.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.liverFat}>Read the liver-fat study</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Clinical Scope and Interpretation</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        The US EGRIFTA WR prescribing information specifies reduction of excess
                        abdominal fat in adults with HIV-associated lipodystrophy. It explicitly
                        distinguishes this indication from weight-loss management. Approval of that
                        medicinal formulation does not establish a general anti-ageing, bodybuilding or
                        sleep indication.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.prescribing}>Read the prescribing information</ExtLink>.
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
                    Reported risks in the medicinal label include elevated IGF-1, fluid retention,
                    joint symptoms, glucose intolerance or diabetes, and hypersensitivity. Cancer
                    history and pituitary conditions also matter in clinical assessment. Long-term
                    cardiovascular safety is not established in the label. These considerations
                    reinforce why trial findings and approved prescribing information cannot be
                    transferred directly to uncharacterised research materials. Source:{' '}
                    <ExtLink href={LINKS.prescribing}>
                      EGRIFTA WR prescribing information
                    </ExtLink>
                    .
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
                  <h2 className={`${h2Class} pt-2`}>Understanding Tesamorelin Testing and COAs</h2>
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
                  Check the sample or batch identifier, laboratory, testing date, methods and assay
                  basis. Only describe a property as verified when the report includes a suitable
                  measurement.
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
                    <h3 className={h3Class}>Where can I find Tesamorelin research papers?</h3>
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
                  Related research (coming soon): Ipamorelin · CJC-1295 No DAC + Ipamorelin Blend.
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
