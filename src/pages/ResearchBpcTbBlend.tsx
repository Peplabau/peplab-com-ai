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
  RESEARCH_BPC_TB_PATH,
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
  { feature: 'Material name', details: 'BPC-157 + TB-500 blend' },
  { feature: 'Compound type', details: 'Mixture, not one new peptide' },
  { feature: 'BPC-157 component', details: 'Experimental pentadecapeptide' },
  {
    feature: 'TB-500 component',
    details: 'Exact sequence and identity require documentation',
  },
  {
    feature: 'Research areas',
    details: 'Cell migration, tissue injury and repair',
  },
  {
    feature: 'Evidence base',
    details:
      'Mainly component studies; limited uncontrolled human observations involving BPC-157 and TB4',
  },
] as const;

const GLANCE_ROWS = [
  {
    area: 'Tendon biology',
    investigated: 'BPC-157 experiments in cells and tissue',
    distinction: 'Not a controlled trial of this blend',
  },
  {
    area: 'Human observations',
    investigated: 'Small retrospective BPC-157/TB4 report',
    distinction: 'Cannot establish causality or synergy',
  },
  {
    area: 'Molecular identity',
    investigated: 'Analysis of a TB-500-labelled material',
    distinction: 'Full-length TB4 and a fragment are distinct',
  },
] as const;

const FAQS = [
  {
    q: 'Is BPC-157 + TB-500 one peptide?',
    a: 'No. It is a mixture. Each component retains its own molecular identity, and the blend ratio affects the amount of each material present.',
  },
  {
    q: 'Is TB-500 always full-length thymosin beta-4?',
    a: 'The name alone is insufficient. Published analytical work identified a shorter acetylated fragment in a TB-500 product. Check the exact sequence and laboratory report.',
  },
  {
    q: 'Has the blend been studied in humans?',
    a: 'A small retrospective report included BPC-157 with TB4, but it was not a controlled trial of a characterised PEPLAB blend. The distinction matters.',
  },
  {
    q: 'Does the blend work better than BPC-157 alone?',
    a: 'The cited evidence does not establish superiority or synergy. A suitable comparison would need to test the exact combination against its individual components.',
  },
  {
    q: 'Does a total vial amount show the ratio?',
    a: 'No. A total amount does not state how much of each peptide is present. Component amounts should be listed and quantitatively verified.',
  },
  {
    q: 'Can studies prove faster injury recovery?',
    a: 'The studies here do not establish a reliable human recovery timetable. Cellular responses and patient-reported pain are different from verified structural healing.',
  },
] as const;

const LINKS = {
  tendon: 'https://pubmed.ncbi.nlm.nih.gov/21030672/',
  knee: 'https://pubmed.ncbi.nlm.nih.gov/34324435/',
  tb500Identity: 'https://pubmed.ncbi.nlm.nih.gov/22962027/',
} as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function ResearchBpcTbBlend() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadProductsFromSupabase()
      .then((products) => {
        if (cancelled) return;
        const slug = resolveProductSlug('bpc-157-tb-500').toLowerCase();
        const product = products.find((p) => {
          const id = p.id.toLowerCase();
          const name = p.name.toLowerCase();
          return (
            id === slug ||
            id === 'bpc-5mg-tb-5mg' ||
            id === 'bpc-tb-combo' ||
            (name.includes('bpc') && name.includes('tb'))
          );
        });
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
        title={PAGE_SEO.researchBpcTb.title}
        description={PAGE_SEO.researchBpcTb.description}
      />
      <JsonLd
        id="research-bpc-tb-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: 'BPC-157 + TB-500', path: RESEARCH_BPC_TB_PATH },
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
                    alt="BPC-157 + TB-500 blend research vial"
                    className="h-full w-full object-contain p-2"
                    variant="card"
                  />
                ) : (
                  <FlaskConical className="w-10 h-10 text-[#8B5CF6] opacity-60" />
                )}
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#2ED1B4] mb-3">
                Peptide Blends / Tissue Research
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
                BPC-157 + TB-500 Blend Research{' '}
                <span className="gradient-text">Overview</span>
              </h1>
              <p className={`${bodyClass} text-base sm:text-lg max-w-2xl mx-auto`}>
                Component Evidence and Tissue-Repair Research
              </p>
            </div>

            <div className="space-y-6">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  BPC-157 + TB-500 describes a combination of two peptide materials associated with
                  tissue-repair research. Evidence for the individual components, related thymosin
                  peptides and the finished blend must be assessed separately. This overview explains
                  what the cited studies investigated and why molecular identity and blend composition
                  are essential to interpreting them.
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
                <h2 className={`${h2Class} mb-4`}>What Is BPC-157 + TB-500 Blend?</h2>
                <div className="space-y-4 mb-6">
                  <p className={bodyClass}>
                    BPC-157 is a 15-amino-acid experimental peptide. TB-500 is a name used for
                    thymosin beta-4-related materials; a published analytical study identified an
                    acetylated seven-amino-acid fragment in a product carrying that name. Full-length
                    thymosin beta-4 and that fragment are not the same molecule. The supplied sequence
                    must therefore be checked rather than inferred from the label.
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
                  <h2 className={`${h2Class} pt-2`}>How Does BPC-157 + TB-500 Blend Work?</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>BPC-157 Research Pathways</h3>
                    <p className={bodyClass}>
                      Laboratory work has examined tendon-cell migration, stress responses and
                      vascular signalling. These are mechanistic observations, not established
                      injury-healing outcomes in people.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Thymosin-Related Biology</h3>
                    <p className={bodyClass}>
                      Thymosin beta-4 research cannot automatically be assigned to every TB-500-labelled
                      material. The tested molecule, its length and modifications determine the
                      relevance of a reference.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Combination Questions</h3>
                    <p className={bodyClass}>
                      A blend introduces questions about interactions, stability and relative amounts.
                      Activity of each ingredient alone does not demonstrate additive effects or
                      synergy.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-6`}>BPC-157 + TB-500 Blend Research Findings</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className={h3Class}>Tendon-Cell Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2011 BPC-157 study used rat tendon explants and cultured fibroblasts. It
                        reported changes in cell outgrowth, migration and survival under stress. The
                        experiment did not test a BPC-157 + TB-500 blend or measure recovery from a
                        human tendon injury.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.tendon}>Read the BPC-157 tendon study</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>Limited Human Combination Observations</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2021 retrospective knee-pain report included BPC-157 alone and BPC-157 with
                        thymosin beta-4. Only four followed participants received the combination.
                        There was no randomised control group, and improvement was assessed by patient
                        reports. It does not establish blend superiority, structural repair or
                        equivalence to a commercial TB-500 preparation.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.knee}>Read the retrospective knee-pain report</ExtLink>.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className={h3Class}>TB-500 Identity</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2012 analytical paper identified Ac-LKKTETQ in a TB-500 product. This is an
                        identity study, not a clinical efficacy trial. It provides a reason to check
                        the supplier’s sequence and mass data before matching a vial to studies of
                        full-length thymosin beta-4.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.tb500Identity}>
                          Read the TB-500 characterisation study
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
                    Robust controlled evidence establishing the safety and effectiveness of the exact
                    commercial blend was not identified in the sources reviewed. Reported improvement
                    in an uncontrolled series does not establish cartilage regrowth, tendon repair or
                    a predictable recovery time. The combined preparation also requires its own
                    stability and analytical assessment; ingredient COAs alone do not characterise the
                    finished mixture.
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
                    Understanding BPC-157 + TB-500 Blend Testing and COAs
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
                  For this blend, request identity and quantitative content for both components.
                  TB-500 documentation should state the actual peptide sequence and modifications. One
                  combined purity figure cannot establish the amount or ratio of both peptides.
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
                      Where can I find BPC-157 + TB-500 Blend research papers?
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
                  Related research (page coming soon): BPC-157.
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
