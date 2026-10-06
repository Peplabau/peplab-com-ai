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
  RESEARCH_MOTS_C_PATH,
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
  { feature: 'Compound name', details: 'MOTS-C / MOTS-c' },
  { feature: 'Compound type', details: 'Mitochondrial-derived peptide' },
  { feature: 'Peptide length', details: '16 amino acids' },
  {
    feature: 'Research pathways',
    details: 'Metabolic regulation, AMPK and stress adaptation',
  },
  {
    feature: 'Research areas',
    details: 'Insulin sensitivity, skeletal muscle and exercise biology',
  },
  {
    feature: 'Evidence base',
    details: 'Cell and animal interventions; human observations of endogenous MOTS-C',
  },
] as const;

const GLANCE_ROWS = [
  {
    area: 'Metabolic regulation',
    investigated: 'Cell and mouse experiments',
    distinction: 'Not proof of human fat loss',
  },
  {
    area: 'Exercise biology',
    investigated: 'Mouse interventions and human endogenous measurements',
    distinction: 'Human measurements do not establish administered-peptide efficacy',
  },
  {
    area: 'Ageing',
    investigated: 'Physical-capacity outcomes in older mice',
    distinction: 'Not evidence of human lifespan extension',
  },
] as const;

const FAQS = [
  {
    q: 'Is MOTS-C a peptide?',
    a: 'Yes. MOTS-C is a 16-amino-acid mitochondrial-derived peptide investigated in metabolic and stress-response research.',
  },
  {
    q: 'Does MOTS-C give stimulant-like energy?',
    a: 'The studies discussed here do not establish a stimulant-like subjective effect. Cellular energy regulation and feeling more alert are different outcomes.',
  },
  {
    q: 'Has MOTS-C been studied in humans?',
    a: 'Human work includes measurement of endogenous MOTS-C during exercise. This does not establish the safety or effectiveness of administering a MOTS-C preparation.',
  },
  {
    q: 'Is MOTS-C the same as SLU-PP-332?',
    a: 'No. MOTS-C is a peptide; SLU-PP-332 is a synthetic small molecule targeting estrogen-related receptors. Similar research topics do not make them interchangeable.',
  },
  {
    q: 'Does MOTS-C research prove weight loss?',
    a: 'Preclinical metabolic findings do not establish a predictable weight-loss effect in humans.',
  },
  {
    q: 'Does mitochondrial origin mean it extends lifespan?',
    a: 'No. A molecule’s origin or role in cell biology does not demonstrate that administering it extends human lifespan.',
  },
] as const;

const LINKS = {
  discovery: 'https://www.cell.com/cell-metabolism/fulltext/S1550-4131(15)00061-3',
  exercise: 'https://www.nature.com/articles/s41467-020-20790-0',
  fda: 'https://www.fda.gov/media/193347/download',
} as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function ResearchMotsC() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadProductsFromSupabase()
      .then((products) => {
        if (cancelled) return;
        const slug = resolveProductSlug('mots-c').toLowerCase();
        const product = products.find(
          (p) =>
            p.id.toLowerCase() === slug ||
            p.id.toLowerCase() === 'mots-c' ||
            p.name.toLowerCase().includes('mots'),
        );
        if (!product) return;
        const dosageImage = product.dosages?.find((d) => d.imageUrl)?.imageUrl;
        setImageSrc(dosageImage || product.image || '');
      })
      .catch(() => {
        /* keep placeholder */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEO title={PAGE_SEO.researchMotsC.title} description={PAGE_SEO.researchMotsC.description} />
      <JsonLd
        id="research-mots-c-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: 'MOTS-C', path: RESEARCH_MOTS_C_PATH },
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
                    alt="MOTS-C research vial"
                    className="h-full w-full object-contain p-2"
                    variant="card"
                  />
                ) : (
                  <FlaskConical className="w-10 h-10 text-[#8B5CF6] opacity-60" />
                )}
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#2ED1B4] mb-3">
                Mitochondrial / Metabolic Research
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
                MOTS-C Research <span className="gradient-text">Overview</span>
              </h1>
              <p className={`${bodyClass} text-base sm:text-lg max-w-2xl mx-auto`}>
                Mitochondrial Signalling and Metabolic Adaptation
              </p>
            </div>

            <div className="space-y-6">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  MOTS-C is a mitochondrial-derived peptide studied in metabolic regulation, cellular
                  stress responses and exercise biology. Researchers investigate both naturally
                  occurring MOTS-C and administered experimental material. Those are different
                  research questions: an exercise-related change in the body’s own peptide levels does
                  not establish the effects of administering a research preparation.
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
                <h2 className={`${h2Class} mb-4`}>What Is MOTS-C?</h2>
                <div className="space-y-4 mb-6">
                  <p className={bodyClass}>
                    MOTS-C stands for mitochondrial open reading frame of the 12S rRNA-c. It is a
                    16-amino-acid peptide described in research linking mitochondrial genetic
                    information with metabolic signalling. Mitochondria contribute to energy
                    metabolism, but MOTS-C is a signalling peptide rather than a direct replacement
                    for ATP or a conventional stimulant.
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
                  <h2 className={`${h2Class} pt-2`}>How Does MOTS-C Work?</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>Metabolic Signalling</h3>
                    <p className={bodyClass}>
                      The discovery study connected MOTS-C with folate/purine metabolism and
                      activation of AMPK, a cellular energy-sensing pathway. These findings arose from
                      experimental systems.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Muscle and Stress Adaptation</h3>
                    <p className={bodyClass}>
                      Later work examined skeletal-muscle metabolism and responses to metabolic
                      stress. Researchers assess gene expression and physical performance as separate
                      outcomes.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Endogenous Versus Administered Peptide</h3>
                    <p className={bodyClass}>
                      Measuring the body’s own MOTS-C during exercise is not equivalent to testing an
                      administered peptide. Concentration changes alone do not establish a therapeutic
                      effect.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-6`}>MOTS-C Research Findings</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className={h3Class}>Metabolic Homeostasis</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        The 2015 <em>Cell Metabolism</em> discovery paper identified MOTS-C and
                        reported metabolic effects in cells and mice, including effects on insulin
                        resistance in experimental models. It established a basis for further research
                        rather than a human weight-management treatment.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.discovery}>Read the MOTS-C discovery study</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Exercise and Physical Capacity</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2021 <em>Nature Communications</em> paper reported improved physical
                        performance after MOTS-C administration in mice. The same paper examined
                        exercise-related increases in naturally occurring MOTS-C in humans. The human
                        component was not a trial showing that administering MOTS-C improves exercise
                        performance.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.exercise}>Read the exercise and muscle study</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Translating the Evidence</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        The key distinction is between metabolic plausibility and demonstrated human
                        benefit. Trials would need to characterise the administered material, compare
                        it with a control and measure meaningful outcomes. Evidence for related
                        analogues would also need to be separated from evidence for native MOTS-C.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.exercise}>
                          Review the study designs in the original exercise paper
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
                    The cited intervention findings are predominantly preclinical. They do not
                    establish long-term human safety, an effective personal-use regimen or a
                    predictable energy response. The FDA has highlighted missing human exposure
                    information and characterisation concerns for compounded MOTS-C.{' '}
                    <ExtLink href={LINKS.fda}>Read the FDA safety information</ExtLink>. Research on
                    endogenous biology should not be used to imply that externally supplied material
                    is inherently safe.
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
                  <h2 className={`${h2Class} pt-2`}>Understanding MOTS-C Testing and COAs</h2>
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
                    <h3 className={h3Class}>Where can I find MOTS-C research papers?</h3>
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
                  Related research topics (pages coming soon): SLU-PP-332 · SS-31 · NAD+.
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
