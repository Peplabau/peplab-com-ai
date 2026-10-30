import { Droplets, FlaskConical, Syringe, Target } from 'lucide-react';
import ContentPageHeader from '@/components/ContentPageHeader';
import ReconstitutionCalculator from '@/components/ReconstitutionCalculator';
import Footer from '@/sections/Footer';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';

const USAGE_STEPS = [
  {
    icon: Syringe,
    title: 'Choose syringe size',
    description: 'Select 0.3 mL, 0.5 mL or 1 mL so the unit markings match the syringe you will use.',
  },
  {
    icon: FlaskConical,
    title: 'Enter the vial amount',
    description: 'Add the compound amount printed on the vial, using mg or IU.',
  },
  {
    icon: Droplets,
    title: 'Add diluent volume',
    description: 'Enter how much bacteriostatic water or other compatible diluent you will add.',
  },
  {
    icon: Target,
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
          <section className="mb-8 rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.55)] p-5 sm:p-6">
            <h1 className="mb-3 text-2xl font-bold text-[#F4F6FA] sm:text-3xl lg:text-4xl">
              Peptide <span className="gradient-text">Calculator</span>
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[#A9B3C7] sm:text-base">
              Use this free peptide calculator to work out reconstitution volumes, concentration and
              syringe units for laboratory research. Enter the vial amount, diluent volume and intended
              dose. Results are estimates for research use only and should be checked against the vial
              label and your protocol.
            </p>

            <h2 className="mt-6 mb-4 text-lg font-semibold text-[#F4F6FA]">How to use the calculator</h2>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {USAGE_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.title}
                    className="rounded-xl border border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.55)] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(46,209,180,0.25)] bg-[rgba(46,209,180,0.12)] text-[#2ED1B4]">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(46,209,180,0.12)] text-xs font-semibold text-[#2ED1B4]">
                        {index + 1}
                      </span>
                    </div>
                    <p className="mb-1.5 text-sm font-semibold text-[#F4F6FA]">{step.title}</p>
                    <p className="text-xs leading-relaxed text-[#A9B3C7] sm:text-[13px]">{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <ReconstitutionCalculator />
        </div>
      </main>

      <Footer />
    </div>
  );
}
