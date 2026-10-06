import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  ExternalLink,
  FlaskConical,
  HelpCircle,
  Microscope,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ProductImage from '@/components/ProductImage';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import {
  COA_ARCHIVE_PATH,
  RESEARCH_PATH,
  RESEARCH_COMPOUNDS_PATH,
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
  { feature: 'Compound name', details: 'Retatrutide' },
  { feature: 'Research code', details: 'LY3437943' },
  { feature: 'Compound type', details: 'Peptide' },
  { feature: 'Mechanism', details: 'GIP, GLP-1 and glucagon receptor agonism' },
  {
    feature: 'Research areas',
    details: 'Obesity, glucose regulation and metabolic liver disease',
  },
  {
    feature: 'Development stage',
    details: 'Investigational, with published human studies including Phase 3 research',
  },
] as const;

const GLANCE_ROWS = [
  {
    area: 'Body weight',
    investigated: 'Changes in body weight over defined study periods',
    distinction: 'Group averages do not predict individual results',
  },
  {
    area: 'Glucose regulation',
    investigated: 'Glycaemic outcomes in adults with type 2 diabetes',
    distinction: 'Findings depend on the population and trial design',
  },
  {
    area: 'Liver fat',
    investigated: 'Changes measured using MRI',
    distinction: 'Reduced liver fat does not establish reversal of fibrosis',
  },
  {
    area: 'Safety and tolerability',
    investigated: 'Adverse events and treatment discontinuation',
    distinction: 'Longer-term and population-specific questions remain',
  },
] as const;

const FAQS = [
  {
    q: 'Is retatrutide a peptide?',
    a: 'Yes. Retatrutide is a peptide designed to activate GIP, GLP-1 and glucagon receptors.',
  },
  {
    q: 'What is LY3437943?',
    a: 'LY3437943 is retatrutide’s development code. Both names appear in scientific publications and clinical trial records.',
  },
  {
    q: 'Why is retatrutide called a triple agonist?',
    a: 'Retatrutide activates three receptor types within a single molecule. “Triple” describes the number of receptor targets, not a guaranteed level of effectiveness.',
  },
  {
    q: 'What is retatrutide being researched for?',
    a: 'Research includes obesity, type 2 diabetes, liver fat and other metabolic outcomes. The strength and scope of the evidence vary by research question.',
  },
  {
    q: 'Has retatrutide been studied in humans?',
    a: 'Yes. Retatrutide has been investigated in human clinical trials, including Phase 2 and Phase 3 studies.',
  },
  {
    q: 'What does the 24.2% weight-loss figure refer to?',
    a: 'It is the mean body-weight reduction reported at 48 weeks in the highest-dose group of the 2023 Phase 2 obesity trial. It is a study result, not a guaranteed outcome.',
  },
  {
    q: 'Are different vial quantities different compounds?',
    a: 'No. A stated quantity, such as 10 mg or 20 mg, describes an amount rather than a different molecular identity. Identity and actual content are separate analytical questions.',
  },
] as const;

const LINKS = {
  cellMetabolism: 'https://doi.org/10.1016/j.cmet.2022.07.013',
  nejmObesity: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972',
  lancetDiabetes:
    'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01053-X/abstract',
  natureLiver: 'https://www.nature.com/articles/s41591-024-03018-2',
  triumph2:
    'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(26)01861-1/abstract',
  clinicalTrials: 'https://clinicaltrials.gov/search?term=retatrutide',
  lillyUpdate:
    'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-substantial-weight',
  pubmed: 'https://pubmed.ncbi.nlm.nih.gov/?term=retatrutide+OR+LY3437943',
} as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function ResearchRetatrutide() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadProductsFromSupabase()
      .then((products) => {
        if (cancelled) return;
        const slug = resolveProductSlug('retatrutide').toLowerCase();
        const product = products.find(
          (p) =>
            p.id.toLowerCase() === slug ||
            p.id.toLowerCase() === 'reta' ||
            p.name.toLowerCase() === 'retatrutide',
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
      <SEO
        title={PAGE_SEO.researchRetatrutide.title}
        description={PAGE_SEO.researchRetatrutide.description}
      />
      <JsonLd
        id="research-retatrutide-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: 'Retatrutide', path: RESEARCH_RETATRUTIDE_PATH },
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
              to={RESEARCH_COMPOUNDS_PATH}
              className="flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Compounds
            </Link>
          </div>
        </nav>

        <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="mx-auto mb-6 h-28 w-24 overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] flex items-center justify-center">
                {imageSrc ? (
                  <ProductImage
                    src={imageSrc}
                    alt="Retatrutide research vial"
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
                Retatrutide Research <span className="gradient-text">Overview</span>
              </h1>
              <p className={`${bodyClass} text-base sm:text-lg max-w-2xl mx-auto`}>
                Triple Receptor Activity and Metabolic Research
              </p>
            </div>

            <div className="space-y-6">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  Retatrutide is an investigational peptide studied for its effects on body weight,
                  glucose regulation and metabolic processes. Also known as LY3437943, it activates
                  three hormone receptors: GIP, GLP-1 and glucagon.
                </p>
                <p className={bodyClass}>
                  This page brings together retatrutide’s mechanism of action, published research
                  findings and scientific references to help readers explore the evidence.
                </p>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>What Is Retatrutide?</h2>
                <div className="space-y-4 mb-6">
                  <p className={bodyClass}>
                    Retatrutide is a peptide developed by Eli Lilly as a triple hormone receptor
                    agonist. An agonist is a molecule that activates a receptor and produces a
                    biological response.
                  </p>
                  <p className={bodyClass}>
                    Rather than targeting a single receptor, retatrutide interacts with three systems
                    involved in metabolic regulation. Researchers are investigating how this combined
                    activity influences body weight, blood glucose and related outcomes.
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
                  <h2 className={`${h2Class} pt-2`}>How Does Retatrutide Work?</h2>
                </div>
                <p className={`${bodyClass} mb-6`}>
                  Retatrutide’s mechanism combines activity at three distinct receptor types.
                </p>

                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>GIP Receptor Activity</h3>
                    <p className={bodyClass}>
                      Glucose-dependent insulinotropic polypeptide, or GIP, participates in the
                      body’s response to nutrient intake. Its receptor is involved in
                      glucose-dependent insulin secretion and metabolic signalling.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>GLP-1 Receptor Activity</h3>
                    <p className={bodyClass}>
                      Glucagon-like peptide-1, or GLP-1, participates in glucose regulation, appetite
                      signalling and gastric emptying. Activating this receptor is one component of
                      retatrutide’s metabolic activity.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Glucagon Receptor Activity</h3>
                    <p className={bodyClass}>
                      Glucagon receptors participate in hepatic glucose production and energy
                      metabolism. Retatrutide incorporates glucagon receptor activity alongside its
                      GIP and GLP-1 actions.
                    </p>
                  </div>
                </div>

                <p className={`${bodyClass} mt-6 mb-3`}>
                  Scientists study the combined effect of these pathways. Activating three receptors
                  does not automatically establish superiority over compounds with fewer receptor
                  targets.
                </p>
                <p className={bodyClass}>
                  Scientific reference:{' '}
                  <ExtLink href={LINKS.cellMetabolism}>
                    Retatrutide discovery and clinical proof-of-concept study — Cell Metabolism
                  </ExtLink>
                  .
                </p>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-6`}>Retatrutide Research Findings</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className={h3Class}>Body Weight and Obesity Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A randomised Phase 2 trial published in the{' '}
                        <em>New England Journal of Medicine</em> in 2023 investigated retatrutide in
                        adults with obesity or overweight and a weight-related condition.
                      </p>
                      <p className={bodyClass}>
                        At 48 weeks, the highest-dose study group had a mean body-weight reduction of
                        24.2%, compared with 2.1% in the placebo group.
                      </p>
                      <p className={bodyClass}>
                        These findings contributed to further clinical development. They represent
                        averages observed under a defined trial protocol, rather than a prediction of
                        individual outcomes.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.nejmObesity}>
                          Read the original Phase 2 obesity study
                        </ExtLink>
                        .
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={h3Class}>Glucose Regulation and Type 2 Diabetes</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A Phase 2 study published in <em>The Lancet</em> in 2023 evaluated
                        retatrutide in adults with type 2 diabetes.
                      </p>
                      <p className={bodyClass}>
                        The trial investigated blood glucose control, body weight and safety, using
                        placebo and dulaglutide comparison groups. It provides evidence about
                        retatrutide’s activity in a defined population with type 2 diabetes.
                      </p>
                      <p className={bodyClass}>
                        When interpreting these findings, consider the participants’ baseline
                        characteristics, study duration and comparison treatment.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.lancetDiabetes}>
                          Read the original Phase 2 diabetes study
                        </ExtLink>
                        .
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={h3Class}>Liver Fat and Metabolic Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2024 study published in <em>Nature Medicine</em> investigated changes in
                        liver fat among participants with metabolic dysfunction-associated steatotic
                        liver disease, commonly abbreviated as MASLD.
                      </p>
                      <p className={bodyClass}>
                        Researchers used MRI measurements and reported reductions in liver fat
                        compared with placebo.
                      </p>
                      <p className={bodyClass}>
                        This research contributes to the understanding of retatrutide’s metabolic
                        effects. Liver-fat reduction is a specific outcome; effects on fibrosis and
                        long-term liver complications require separate evidence.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.natureLiver}>
                          Read the original liver-fat study
                        </ExtLink>
                        .
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={h3Class}>Phase 3 Clinical Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        Retatrutide has progressed to Phase 3 investigation through programmes
                        studying obesity, type 2 diabetes and associated conditions.
                      </p>
                      <p className={bodyClass}>
                        The 2026 TRIUMPH-2 publication reported findings in adults with obesity and
                        type 2 diabetes. In the treatment-regimen analysis, mean body-weight change
                        at 80 weeks was −18.8% in the highest-dose group, compared with −5.1% with
                        placebo.
                      </p>
                      <p className={bodyClass}>
                        The analysis used matters: estimates can differ depending on how researchers
                        account for treatment discontinuation and other events. Results from separate
                        trials should not be compared as though they came from a direct head-to-head
                        study.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.triumph2}>
                          Read the Phase 3 TRIUMPH-2 publication
                        </ExtLink>
                        .
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.clinicalTrials}>
                          Explore retatrutide studies on ClinicalTrials.gov
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
                    Reported adverse effects in clinical studies include nausea, diarrhoea, vomiting
                    and constipation. The Phase 2 obesity trial also reported dose-dependent
                    increases in heart rate. Later Phase 3 reporting includes dysesthesia, or altered
                    skin sensations.
                  </p>
                  <p className={bodyClass}>
                    Some participants discontinued treatment because of adverse events. Findings
                    should therefore be considered alongside tolerability, study duration and the
                    characteristics of the participants.
                  </p>
                  <p className={bodyClass}>
                    Retatrutide remains investigational and is not approved by the TGA as of October
                    2026. Published clinical findings relate to the study preparation and do not
                    establish equivalence with separately supplied research materials.
                  </p>
                  <p className={bodyClass}>
                    Further reading:{' '}
                    <ExtLink href={LINKS.nejmObesity}>Phase 2 clinical findings</ExtLink> and{' '}
                    <ExtLink href={LINKS.lillyUpdate}>Lilly’s Phase 3 research update</ExtLink>.
                  </p>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-6 h-6 text-[#2ED1B4]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>Understanding Retatrutide Testing and COAs</h2>
                </div>
                <p className={`${bodyClass} mb-3`}>
                  Analytical testing helps researchers assess the characteristics of a submitted
                  sample.
                </p>
                <p className={`${bodyClass} mb-3`}>Different methods answer different questions:</p>
                <ul className="space-y-2 text-[#A9B3C7] mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Chromatographic purity:</strong> HPLC
                      measures the relative proportions of detected components under specified test
                      conditions.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Identity assessment:</strong> Mass
                      spectrometry provides evidence about whether a sample is consistent with the
                      expected molecule.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Peptide content:</strong> Quantitative
                      analysis measures the amount of peptide present.
                    </span>
                  </li>
                </ul>
                <p className={`${bodyClass} mb-4`}>
                  When reviewing a Certificate of Analysis, check the compound name, sample or batch
                  identifier, laboratory, testing date, methods and reported results. Only treat a
                  property as tested when the report includes the relevant measurement.
                </p>
                <p className={bodyClass}>
                  Explore PEPLAB’s{' '}
                  <Link to="/standards" className={linkClass}>
                    Quality &amp; Testing
                  </Link>{' '}
                  information and available{' '}
                  <Link to={COA_ARCHIVE_PATH} className={linkClass}>
                    COA Results
                  </Link>
                  .
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
                    <h3 className={h3Class}>Where can I find retatrutide research papers?</h3>
                    <p className={bodyClass}>
                      The references on this page link to original publications. Search retatrutide
                      or LY3437943 on{' '}
                      <ExtLink href={LINKS.pubmed}>PubMed</ExtLink> for additional literature.
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
