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
  RESEARCH_TIRZEPATIDE_PATH,
  RESEARCH_RETATRUTIDE_PATH,
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
  { feature: 'Compound name', details: 'Tirzepatide' },
  { feature: 'Development code', details: 'LY3298176' },
  { feature: 'Compound type', details: 'Synthetic peptide' },
  { feature: 'Mechanism', details: 'GIP and GLP-1 receptor agonism' },
  {
    feature: 'Research areas',
    details: 'Type 2 diabetes, obesity and metabolic outcomes',
  },
  {
    feature: 'Evidence base',
    details: 'Large randomised human trials; authorised medicinal formulations',
  },
] as const;

const GLANCE_ROWS = [
  {
    area: 'Body weight',
    investigated: 'Percentage weight change over 72 weeks',
    distinction: 'Trial averages do not guarantee individual weight loss',
  },
  {
    area: 'Glucose regulation',
    investigated: 'HbA1c in type 2 diabetes',
    distinction: 'Comparator dose and background treatment matter',
  },
  {
    area: 'Comparative research',
    investigated: 'Tirzepatide versus a defined semaglutide regimen',
    distinction: 'One comparison does not cover all products or uses',
  },
] as const;

const FAQS = [
  {
    q: 'Is tirzepatide a GLP-1 peptide?',
    a: 'Tirzepatide activates GLP-1 receptors and GIP receptors. It is therefore described more precisely as a dual GIP/GLP-1 receptor agonist.',
  },
  {
    q: 'What is LY3298176?',
    a: 'LY3298176 is the development code for tirzepatide. It appears in early scientific and clinical-development literature.',
  },
  {
    q: 'What does the 20.9% figure mean?',
    a: 'It is the mean weight reduction at 72 weeks in the highest-dose SURMOUNT-1 group under the treatment-regimen analysis. It is not a guaranteed outcome.',
  },
  {
    q: 'Is tirzepatide the same as semaglutide?',
    a: 'No. Tirzepatide activates GIP and GLP-1 receptors; semaglutide targets GLP-1 receptors. They are distinct compounds with different trial programmes.',
  },
  {
    q: 'Do vial quantities change the compound?',
    a: 'No. A stated quantity describes an amount. Molecular identity, actual content and formulation are separate questions that require suitable documentation and testing.',
  },
] as const;

const LINKS = {
  surmount1: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038',
  surpass2: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2107519',
  surmount2:
    'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01200-X/abstract',
  tgaIncretin:
    'https://www.tga.gov.au/news/safety-updates/glucagon-like-peptide-1-receptor-agonists-glp-1-ras-and-dual-gipglp-1-receptor-agonists-and-risk-aspiration-under-anaesthesia',
  tgaMounjaro: 'https://www.tga.gov.au/resources/product-information/mounjaro-tirzepatide',
} as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function ResearchTirzepatide() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadProductsFromSupabase()
      .then((products) => {
        if (cancelled) return;
        const slug = resolveProductSlug('tirzepatide').toLowerCase();
        const product = products.find(
          (p) =>
            p.id.toLowerCase() === slug ||
            p.id.toLowerCase() === 'tirzepatide' ||
            p.name.toLowerCase().includes('tirzepatide'),
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
        title={PAGE_SEO.researchTirzepatide.title}
        description={PAGE_SEO.researchTirzepatide.description}
      />
      <JsonLd
        id="research-tirzepatide-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: 'Tirzepatide', path: RESEARCH_TIRZEPATIDE_PATH },
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
                    alt="Tirzepatide research vial"
                    className="h-full w-full object-contain p-2"
                    variant="card"
                  />
                ) : (
                  <FlaskConical className="w-10 h-10 text-[#8B5CF6] opacity-60" />
                )}
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#2ED1B4] mb-3">
                GLP-1 / Incretin
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
                Tirzepatide Research <span className="gradient-text">Overview</span>
              </h1>
              <p className={`${bodyClass} text-base sm:text-lg max-w-2xl mx-auto`}>
                Dual Receptor Activity and Metabolic Research
              </p>
            </div>

            <div className="space-y-6">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  Tirzepatide is a synthetic peptide that activates GIP and GLP-1 receptors. Research
                  has examined its effects on blood glucose, body weight and related metabolic
                  outcomes in large human clinical trials. This overview explains its mechanism, key
                  findings and the distinction between evidence for studied medicines and separately
                  supplied research materials.
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
                <h2 className={`${h2Class} mb-4`}>What Is Tirzepatide?</h2>
                <div className="space-y-4 mb-6">
                  <p className={bodyClass}>
                    Tirzepatide is a dual incretin receptor agonist developed by Eli Lilly. Incretins
                    are hormones involved in the response to food intake. Tirzepatide combines
                    activity at two receptor types within one molecule. It is the active ingredient in
                    authorised medicines, but that status does not establish the quality or
                    equivalence of other preparations bearing the same compound name.
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
                  <h2 className={`${h2Class} pt-2`}>How Does Tirzepatide Work?</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>GIP Receptor Activity</h3>
                    <p className={bodyClass}>
                      The glucose-dependent insulinotropic polypeptide receptor participates in
                      glucose-dependent insulin secretion. Tirzepatide activates this pathway as one
                      part of its dual incretin activity.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>GLP-1 Receptor Activity</h3>
                    <p className={bodyClass}>
                      GLP-1 receptor activation influences insulin secretion, appetite and food
                      intake. Delayed gastric emptying is also relevant to this class of medicines.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Combined Metabolic Effects</h3>
                    <p className={bodyClass}>
                      Researchers measure the net effects of both pathways using clinical outcomes
                      such as HbA1c and body-weight change. The number of receptor targets alone does
                      not establish superiority.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-6`}>Tirzepatide Research Findings</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className={h3Class}>Body Weight and Obesity Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        SURMOUNT-1, published in 2022, enrolled 2,539 adults with obesity or
                        overweight and a weight-related complication, without diabetes. At 72 weeks,
                        mean weight change in the highest-dose group was −20.9%, compared with −3.1%
                        with placebo, using the treatment-regimen analysis. These are group averages
                        under a defined trial protocol, not predicted individual results.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.surmount1}>Read the SURMOUNT-1 trial</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Glucose Regulation and Type 2 Diabetes</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        SURPASS-2 compared tirzepatide with semaglutide in adults with type 2 diabetes
                        over 40 weeks. Tirzepatide groups had larger reductions in HbA1c and body
                        weight under the tested regimens. The semaglutide comparator was 1 mg weekly;
                        this study cannot answer every question about other formulations, doses or
                        populations.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.surpass2}>Read the SURPASS-2 trial</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Obesity With Type 2 Diabetes</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        SURMOUNT-2 investigated weight outcomes in people who had both obesity or
                        overweight and type 2 diabetes. Its population differs from SURMOUNT-1,
                        illustrating why results should be read alongside baseline health, study
                        duration and analysis methods rather than pooled into one headline claim.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.surmount2}>Read the SURMOUNT-2 trial</ExtLink>.
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
                    Gastrointestinal adverse events, including nausea, diarrhoea and vomiting, were
                    common in clinical studies; some participants discontinued treatment. The TGA also
                    highlights delayed gastric emptying and associated concerns during anaesthesia or
                    deep sedation for incretin medicines. Australian approvals relate to specified
                    medicines and indications. Published trials do not establish equivalence with a
                    separately supplied research vial. See the{' '}
                    <ExtLink href={LINKS.tgaIncretin}>
                      TGA information on incretin medicines
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
                  <h2 className={`${h2Class} pt-2`}>Understanding Tirzepatide Testing and COAs</h2>
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
                    <h3 className={h3Class}>Is tirzepatide approved in Australia?</h3>
                    <p className={bodyClass}>
                      The TGA identifies Mounjaro as approved for type 2 diabetes and chronic weight
                      management. This is a product-specific approval, not approval of every
                      tirzepatide preparation. See the{' '}
                      <ExtLink href={LINKS.tgaMounjaro}>TGA source</ExtLink>.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Where can I find Tirzepatide research papers?</h3>
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
                  <span className="text-[#6B7280]">Semaglutide (coming soon)</span>
                  {' · '}
                  <Link to={RESEARCH_RETATRUTIDE_PATH} className={linkClass}>
                    Retatrutide
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
