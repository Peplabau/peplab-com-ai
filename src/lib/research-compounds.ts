/**
 * Research Library compounds — Find Your Compound cards + overview routes.
 * Add compounds here as dedicated overview pages ship.
 *
 * `productSlug` matches the live storefront slug (images come from Supabase).
 */

export type ResearchCompound = {
  slug: string;
  name: string;
  category: string;
  /** Card headline, e.g. "What is Retatrutide?" */
  cardTitle: string;
  /** Short card blurb */
  cardDescription: string;
  /** Live shop product slug used to resolve vial image from Supabase */
  productSlug: string;
  /** When set, card links to this overview path */
  overviewPath: string | null;
};

export const RESEARCH_COMPOUNDS: ResearchCompound[] = [
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    category: 'GLP-1 / Incretin',
    cardTitle: 'What is Retatrutide?',
    cardDescription:
      'An investigational GIP / GLP-1 / glucagon triple receptor agonist (LY3437943) — classification, receptor mechanism and the research record.',
    productSlug: 'reta',
    overviewPath: '/research/compounds/retatrutide',
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    category: 'Copper Peptides / Skin & Tissue',
    cardTitle: 'What is GHK-Cu?',
    cardDescription:
      'A copper-binding tripeptide complex (copper tripeptide-1) studied for collagen, extracellular matrix remodelling, skin and tissue-repair research.',
    productSlug: 'ghk-cu',
    overviewPath: '/research/compounds/ghk-cu',
  },
  {
    slug: 'mots-c',
    name: 'MOTS-C',
    category: 'Mitochondrial / Metabolic',
    cardTitle: 'What is MOTS-C?',
    cardDescription:
      'A 16-amino-acid mitochondrial-derived peptide studied in metabolic regulation, AMPK signalling, muscle biology and exercise-related research.',
    productSlug: 'mots-c',
    overviewPath: '/research/compounds/mots-c',
  },
  {
    slug: 'bpc-157-tb-500',
    name: 'BPC-157 + TB-500',
    category: 'Peptide Blends / Tissue',
    cardTitle: 'What is BPC-157 + TB-500 Blend?',
    cardDescription:
      'A combination of two tissue-repair research peptides — component evidence, TB-500 identity questions and the limits of blend claims.',
    productSlug: 'bpc-5mg-tb-5mg',
    overviewPath: '/research/compounds/bpc-157-tb-500',
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'GLP-1 / Incretin',
    cardTitle: 'What is Tirzepatide?',
    cardDescription:
      'A dual GIP / GLP-1 receptor agonist (LY3298176) — clinical evidence on body weight, glucose regulation and the limits of product equivalence.',
    productSlug: 'tirzepatide',
    overviewPath: '/research/compounds/tirzepatide',
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'Growth Hormone / GHRH',
    cardTitle: 'What is Tesamorelin?',
    cardDescription:
      'A synthetic GHRH analogue studied mainly for HIV-associated visceral fat and liver-fat research — mechanism, trials and indication limits.',
    productSlug: 'tesamorelin',
    overviewPath: '/research/compounds/tesamorelin',
  },
];

export function getResearchCompound(slug: string): ResearchCompound | undefined {
  return RESEARCH_COMPOUNDS.find((c) => c.slug === slug);
}
