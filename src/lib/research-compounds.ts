/**
 * Research Library compounds — Find Your Compound cards + overview routes.
 * Add compounds here as dedicated overview pages ship.
 */

export type ResearchCompound = {
  slug: string;
  name: string;
  category: string;
  /** Card headline, e.g. "What is Retatrutide?" */
  cardTitle: string;
  /** Short card blurb */
  cardDescription: string;
  /** Product vial image in /public */
  image: string;
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
    image: '/retatrutide.png',
    overviewPath: '/research/compounds/retatrutide',
  },
];

export function getResearchCompound(slug: string): ResearchCompound | undefined {
  return RESEARCH_COMPOUNDS.find((c) => c.slug === slug);
}
