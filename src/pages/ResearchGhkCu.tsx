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
  RESEARCH_GHK_CU_PATH,
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
  { feature: 'Compound name', details: 'GHK-Cu' },
  { feature: 'Common name', details: 'Copper tripeptide-1' },
  {
    feature: 'Chemical description',
    details: 'Glycyl-L-histidyl-L-lysine copper complex',
  },
  { feature: 'Compound type', details: 'Copper–tripeptide complex' },
  { feature: 'Peptide sequence', details: 'Gly–His–Lys' },
  { feature: 'Peptide length', details: 'Three amino acids' },
  {
    feature: 'Research areas',
    details:
      'Collagen synthesis, extracellular matrix remodelling, skin, tissue repair and inflammatory responses',
  },
  {
    feature: 'Evidence base',
    details:
      'Laboratory and animal research, plus limited human studies of topical formulations',
  },
] as const;

const GLANCE_ROWS = [
  {
    area: 'Collagen',
    investigated: 'Collagen production in cultured fibroblasts',
    distinction: 'Cellular findings do not establish visible skin tightening',
  },
  {
    area: 'Tissue repair',
    investigated: 'Matrix accumulation in animal wound models',
    distinction: 'Animal findings do not establish human wound-healing effectiveness',
  },
  {
    area: 'Human skin',
    investigated: 'Topical products following laser resurfacing',
    distinction: 'A small trial found no objective advantage on the assessed skin outcomes',
  },
  {
    area: 'Hair and eyebrows',
    investigated: 'Eyebrow measurements in a small topical study',
    distinction: 'Eyebrow findings cannot establish effectiveness for scalp hair loss',
  },
  {
    area: 'Inflammation',
    investigated: 'Cellular signalling and responses in animal models',
    distinction: 'Preclinical findings do not demonstrate human treatment benefits',
  },
] as const;

const FAQS = [
  {
    q: 'What is GHK-Cu?',
    a: 'GHK-Cu is a complex of copper and the tripeptide glycine–histidine–lysine. It is studied in collagen production, tissue remodelling, skin biology and cellular responses to injury.',
  },
  {
    q: 'Is GHK-Cu the same as copper tripeptide-1?',
    a: 'Copper tripeptide-1 is a common name for GHK-Cu. Finished products containing this ingredient can differ in concentration, formulation and quality.',
  },
  {
    q: 'What is the difference between GHK and GHK-Cu?',
    a: 'GHK is the peptide glycine–histidine–lysine. GHK-Cu is its copper-bound complex. Research on one should not automatically be presented as evidence for the other.',
  },
  {
    q: 'Does GHK-Cu increase collagen?',
    a: 'Laboratory studies have reported increased collagen synthesis in fibroblasts exposed to GHK-Cu. This does not, by itself, establish wrinkle reduction or skin tightening in people.',
  },
  {
    q: 'Has GHK-Cu been studied in humans?',
    a: 'Yes. Small studies have investigated topical GHK-Cu products, including a post-laser skin study and a preliminary eyebrow study. Human evidence remains specific to the formulations and outcomes examined.',
  },
  {
    q: 'Does GHK-Cu help hair growth?',
    a: 'A small 2026 topical study reported improved eyebrow measurements. This does not establish effectiveness for scalp hair loss. Some frequently cited hair research tested AHK-Cu, a different compound.',
  },
  {
    q: 'Is GHK-Cu the same as AHK-Cu?',
    a: 'No. GHK-Cu contains glycine–histidine–lysine, while AHK-Cu contains alanine–histidine–lysine. The first amino acid differs, so they are distinct copper-peptide complexes.',
  },
  {
    q: 'Are different vial quantities different compounds?',
    a: 'No. Labels such as 50 mg and 100 mg describe stated amounts, rather than different molecular identities. Actual identity and content require appropriate analytical testing.',
  },
  {
    q: 'Does a high-purity COA prove safety or effectiveness?',
    a: 'No. A COA reports results for specified tests on a submitted sample. It does not establish clinical effectiveness, suitability for personal use or properties that were not tested.',
  },
] as const;

const LINKS = {
  collagen: 'https://doi.org/10.1016/0014-5793(88)80509-X',
  gag: 'https://doi.org/10.1016/0024-3205(92)90504-i',
  mmp2: 'https://pubmed.ncbi.nlm.nih.gov/11045606/',
  wound: 'https://www.jci.org/articles/view/116842',
  humanSkin: 'https://pubmed.ncbi.nlm.nih.gov/16847171/',
  eyebrow:
    'https://mfuir.mfu.ac.th/jspui/bitstream/123456789/1706/1/141538-Fulltext.pdf',
  ahkCu: 'https://pubmed.ncbi.nlm.nih.gov/17703734/',
  inflammation: 'https://www.oncotarget.com/article/11168/',
  pubmed: 'https://pubmed.ncbi.nlm.nih.gov/?term=GHK-Cu+OR+%22copper+tripeptide-1%22',
} as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function ResearchGhkCu() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadProductsFromSupabase()
      .then((products) => {
        if (cancelled) return;
        const slug = resolveProductSlug('ghk-cu').toLowerCase();
        const product = products.find(
          (p) =>
            p.id.toLowerCase() === slug ||
            p.id.toLowerCase() === 'ghk-cu' ||
            p.name.toLowerCase().includes('ghk'),
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
        title={PAGE_SEO.researchGhkCu.title}
        description={PAGE_SEO.researchGhkCu.description}
      />
      <JsonLd
        id="research-ghk-cu-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: 'GHK-Cu', path: RESEARCH_GHK_CU_PATH },
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
                    alt="GHK-Cu research vial"
                    className="h-full w-full object-contain p-2"
                    variant="card"
                  />
                ) : (
                  <FlaskConical className="w-10 h-10 text-[#8B5CF6] opacity-60" />
                )}
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#2ED1B4] mb-3">
                Copper Peptides / Skin &amp; Tissue Research
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
                GHK-Cu Research <span className="gradient-text">Overview</span>
              </h1>
              <p className={`${bodyClass} text-base sm:text-lg max-w-2xl mx-auto`}>
                Copper Peptide Activity, Collagen and Skin Research
              </p>
            </div>

            <div className="space-y-6">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  GHK-Cu is a copper-binding tripeptide complex studied for its effects on collagen
                  production, tissue remodelling and cellular responses to injury. It combines the
                  amino acids glycine, histidine and lysine with copper and is also commonly called
                  copper tripeptide-1.
                </p>
                <p className={`${bodyClass} mb-4`}>
                  This page brings together GHK-Cu’s biological activity, published research findings
                  and scientific references. Most mechanistic evidence comes from laboratory and
                  animal studies, with smaller human studies investigating particular topical
                  formulations.
                </p>
                <p className={bodyClass}>
                  For guidance on interpreting study findings and analytical testing, visit PEPLAB’s{' '}
                  <Link to={RESEARCH_PATH} className={linkClass}>
                    Research Overview
                  </Link>
                  .
                </p>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>What Is GHK-Cu?</h2>
                <div className="space-y-4 mb-6">
                  <p className={bodyClass}>
                    GHK-Cu is the copper complex of glycyl-L-histidyl-L-lysine, a three-amino-acid
                    peptide abbreviated as GHK. The letters G, H and K represent glycine, histidine
                    and lysine; Cu is the chemical symbol for copper.
                  </p>
                  <p className={bodyClass}>
                    Researchers investigate GHK-Cu in connective-tissue biology, including how cells
                    produce and remodel the extracellular matrix. This matrix is the network of
                    proteins and other molecules that helps support tissues.
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
                  <h2 className={`${h2Class} pt-2`}>How Does GHK-Cu Work?</h2>
                </div>
                <p className={`${bodyClass} mb-6`}>
                  GHK-Cu research examines several biological processes rather than one established
                  receptor mechanism.
                </p>

                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>Copper Binding</h3>
                    <p className={bodyClass}>
                      GHK binds copper ions to form GHK-Cu. The copper-bound complex and copper-free
                      GHK are chemically distinct, so studies should identify which material was
                      tested.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Collagen and Extracellular Matrix Activity</h3>
                    <p className={bodyClass}>
                      Fibroblasts are cells that produce components of connective tissue. Laboratory
                      research has investigated how GHK-Cu affects collagen synthesis and other
                      extracellular matrix components, including glycosaminoglycans.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Tissue Remodelling and Cellular Signalling</h3>
                    <p className={bodyClass}>
                      Tissue remodelling involves both the production and breakdown of matrix
                      components. Researchers have studied GHK-Cu’s effects on matrix
                      metalloproteinases, including MMP-2, as well as inflammatory signalling in
                      experimental models.
                    </p>
                  </div>
                </div>

                <p className={`${bodyClass} mt-6 mb-3`}>
                  These findings help explain research interest in GHK-Cu. They do not establish that
                  every laboratory effect produces a measurable benefit in people.
                </p>
                <p className={bodyClass}>
                  Scientific references:{' '}
                  <ExtLink href={LINKS.collagen}>Collagen synthesis in fibroblasts</ExtLink>,{' '}
                  <ExtLink href={LINKS.gag}>glycosaminoglycan synthesis</ExtLink> and{' '}
                  <ExtLink href={LINKS.mmp2}>MMP-2 expression</ExtLink>.
                </p>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-6`}>GHK-Cu Research Findings</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className={h3Class}>Collagen and Skin Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A study published in <em>FEBS Letters</em> in 1988 reported increased
                        collagen synthesis in fibroblast cultures exposed to GHK-Cu. This finding
                        contributed to interest in the compound’s role in connective-tissue biology.
                      </p>
                      <p className={bodyClass}>
                        A separate 1992 study investigated glycosaminoglycan production in cultured
                        human fibroblasts and reported concentration-dependent effects.
                      </p>
                      <p className={bodyClass}>
                        Both studies examined cells under laboratory conditions. Neither directly
                        measured visible wrinkle reduction, skin tightening or cosmetic outcomes in
                        people.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.collagen}>Read the original collagen study</ExtLink>.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.gag}>
                          Read the original glycosaminoglycan study
                        </ExtLink>
                        .
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={h3Class}>Tissue Repair and Wound Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 1993 study published in the <em>Journal of Clinical Investigation</em>{' '}
                        examined GHK-Cu in an experimental wound model in rats. Researchers reported
                        increased accumulation of collagen and other extracellular matrix components
                        in treated wound chambers.
                      </p>
                      <p className={bodyClass}>
                        The study supports further investigation of GHK-Cu in tissue repair. Animal
                        wound models do not establish effectiveness for human wounds, scars, tendon
                        injuries or recovery after surgery.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.wound}>Read the original animal wound study</ExtLink>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={h3Class}>Human Skin and Topical Formulation Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A randomised study published in 2006 evaluated skin-care regimens with or
                        without GHK-Cu following carbon dioxide laser resurfacing. Thirteen
                        participants completed the study.
                      </p>
                      <p className={bodyClass}>
                        Researchers found no significant between-group differences in objective
                        assessments of redness resolution, wrinkle improvement or overall skin
                        quality. However, participants using GHK-Cu reported greater satisfaction with
                        improvement in overall skin quality.
                      </p>
                      <p className={bodyClass}>
                        This small study illustrates why measured outcomes and participant
                        impressions should be considered separately. Its findings relate to the
                        topical products and post-laser setting studied.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.humanSkin}>Read the original human skin study</ExtLink>
                        .
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={h3Class}>Hair and Eyebrow Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A small randomised, double-blind study published in 2026 in{' '}
                        <em>Procedia of Multidisciplinary Research</em> investigated a topical GHK-Cu
                        serum in 18 participants. Each participant’s eyebrows received different
                        study preparations, allowing comparison within the same person.
                      </p>
                      <p className={bodyClass}>
                        The report described improvements in eyebrow hair count and diameter over 12
                        weeks compared with the vehicle preparation. Its small sample and short
                        follow-up make this preliminary evidence, rather than confirmation of
                        effectiveness for scalp hair loss.
                      </p>
                      <p className={bodyClass}>
                        Compound identity also matters. A frequently cited 2007 hair-follicle study
                        investigated AHK-Cu, a different copper peptide, rather than GHK-Cu.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.eyebrow}>Read the preliminary eyebrow study</ExtLink>.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.ahkCu}>Read the AHK-Cu hair-follicle study</ExtLink>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={h3Class}>Inflammation and Oxidative Stress Research</h3>
                    <div className="space-y-3">
                      <p className={bodyClass}>
                        A 2016 study investigated GHK-Cu in cultured immune cells and a mouse model
                        of acute lung injury. Researchers reported changes in inflammatory
                        signalling, reactive oxygen species and antioxidant activity.
                      </p>
                      <p className={bodyClass}>
                        These are preclinical findings. They do not establish GHK-Cu as a treatment
                        for inflammatory disorders or lung disease in humans.
                      </p>
                      <p className={bodyClass}>
                        <ExtLink href={LINKS.inflammation}>
                          Read the original preclinical study
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
                    GHK-Cu research spans different formulations, concentrations and experimental
                    settings. Findings from a topical cosmetic formulation cannot be assumed to apply
                    to injections or separately supplied research materials.
                  </p>
                  <p className={bodyClass}>
                    Small, short-term studies cannot reliably establish uncommon adverse effects or
                    long-term safety. The studies discussed here do not establish a safe or effective
                    injectable regimen for cosmetic, recovery or anti-ageing purposes.
                  </p>
                  <p className={bodyClass}>
                    Published findings relate to the materials actually studied. A matching compound
                    name does not establish equivalence in identity, content, formulation or quality.
                  </p>
                  <p className={bodyClass}>
                    This page summarises scientific literature and does not provide instructions for
                    personal use.
                  </p>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-6 h-6 text-[#2ED1B4]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>Understanding GHK-Cu Testing and COAs</h2>
                </div>
                <p className={`${bodyClass} mb-3`}>
                  Analytical testing helps researchers assess a submitted sample. Different methods
                  answer different questions:
                </p>
                <ul className="space-y-2 text-[#A9B3C7] mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Chromatographic purity:</strong> HPLC
                      estimates the relative proportions of detected components under the reported
                      test conditions. A purity percentage does not, by itself, establish the amount
                      of GHK-Cu in a vial.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Identity assessment:</strong> Appropriate
                      analytical methods, including mass spectrometry, can provide evidence about
                      molecular identity. For a copper complex, the method and interpretation should
                      account for the metal-bound material.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Peptide content:</strong> A validated
                      quantitative assay measures the amount of the specified analyte present.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2ED1B4] mt-1">•</span>
                    <span>
                      <strong className="text-[#F4F6FA]">Copper characterisation:</strong> Where
                      relevant, additional testing can assess copper content or characteristics of
                      the complex. Peptide purity alone does not establish these properties.
                    </span>
                  </li>
                </ul>
                <p className={`${bodyClass} mb-4`}>
                  Check the compound name, sample or batch identifier, laboratory, test date, methods
                  and reported results. Only describe a property as verified when the report includes
                  an appropriate measurement. Chromatographic purity does not establish sterility or
                  endotoxin status.
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
                  . Check whether a report covers the specific GHK-Cu batch being evaluated.
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
                    <h3 className={h3Class}>Where can I find GHK-Cu research papers?</h3>
                    <p className={bodyClass}>
                      Use the original-study links on this page or search{' '}
                      <ExtLink href={LINKS.pubmed}>PubMed</ExtLink> for GHK-Cu. Check whether each
                      paper studied GHK-Cu, copper-free GHK or another copper peptide.
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
