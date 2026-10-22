import ContentPageHeader from '@/components/ContentPageHeader';
import ReconstitutionCalculator from '@/components/ReconstitutionCalculator';
import Footer from '@/sections/Footer';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';

const USAGE_STEPS = [
  {
    title: 'Choose syringe size',
    description: 'Select 0.3 mL, 0.5 mL or 1 mL so the unit markings match the syringe you will use.',
  },
  {
    title: 'Enter the vial amount',
    description: 'Add the compound amount printed on the vial, using mg or IU.',
  },
  {
    title: 'Add diluent volume',
    description: 'Enter how much bacteriostatic water or other compatible diluent you will add.',
  },
  {
    title: 'Set the research dose',
    description: 'Enter the intended dose in mg, mcg or IU. The calculator returns concentration, draw volume and dose count.',
  },
] as const;

export default function Calculator() {
  return (
    <div className="relative min-h-screen page-grid-bg">
      <SEO
        title={PAGE_SEO.calculator.title}
        description={PAGE_SEO.calculator.description}
        keywords={['peptide calculator', 'reconstitution calculator', 'BAC water', 'research peptides', 'PEPLAB Australia']}
      />
      <JsonLd
        id="calculator-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Peptide Calculator', path: '/calculator' },
        ])}
      />

      <ContentPageHeader />

      <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <section className="mb-8 max-w-3xl">
            <p className="text-base leading-relaxed text-[#A9B3C7] sm:text-lg">
              Use this free peptide calculator to work out reconstitution volumes, concentration and
              syringe units for laboratory research. Enter the vial amount, diluent volume and intended
              dose. Results are estimates for research use only and should be checked against the vial
              label and your protocol.
            </p>
            <h2 className="mt-6 mb-3 text-lg font-semibold text-[#F4F6FA]">How to use the calculator</h2>
            <ol className="space-y-3">
              {USAGE_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3 text-sm leading-relaxed text-[#A9B3C7] sm:text-base">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(46,209,180,0.12)] text-xs font-semibold text-[#2ED1B4]">
                    {index + 1}
                  </span>
                  <span>
                    <strong className="font-semibold text-[#F4F6FA]">{step.title}.</strong>{' '}
                    {step.description}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <ReconstitutionCalculator />
        </div>
      </main>

      <Footer />
    </div>
  );
}
