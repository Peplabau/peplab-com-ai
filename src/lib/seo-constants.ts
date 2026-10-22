/** Shared SEO copy — peplab.com.au homepage and site defaults. */

import { withOnpageSeo } from '@/lib/onpage-seo';

export const HOMEPAGE_SEO_TITLE = 'Research Peptides Australia | HPLC Tested | PEPLAB';

export const HOMEPAGE_SEO_DESCRIPTION =
  'Shop lab-grade research peptides in Australia. Each batch is HPLC tested, with all published COAs and fast same-day dispatch Mon–Fri. For research use only.';

export const SITE_BRAND_NAME = 'PEPLAB Australia';

function pageSeo(path: string, title: string, description: string) {
  return withOnpageSeo(path, { title, description });
}

export const PAGE_SEO = {
  shop: pageSeo(
    '/shop',
    'Shop PEPLAB Australia | Explore Our Products Online Today',
    'Explore the PEPLAB Australia online shop to discover our range of products. Browse available options and find the right products to suit your needs today.',
  ),
  coa: pageSeo(
    '/coa',
    'COA Results: HPLC Purity Reports for Every Peptide Batch',
    'Browse certificates of analysis (COAs) for every peptide batch. Independent HPLC purity results are published so Australian researchers can verify quality.',
  ),
  calculator: pageSeo(
    '/calculator',
    'Peptide Calculator: Reconstitution Volume and Concentration',
    'Use the free peptide calculator to work out reconstitution volumes, concentrations and dose measurements for your lab research. Quick, accurate and easy to use.',
  ),
  trackOrder: pageSeo(
    '/track-order',
    'Track Your Order Online | PEPLAB Australia Order Tracking',
    'Track your PEPLAB Australia order online to check your order status and shipping updates. Get the latest delivery information and contact support for assistance.',
  ),
  contact: pageSeo(
    '/contact',
    'Contact Us: Peptide Product Questions and Enquiries, AU',
    'Get in touch with our Sydney, NSW team about orders, shipping, order tracking or research peptide questions. Friendly support for customers across Australia.',
  ),
  contactInfo: pageSeo(
    '/contact-info',
    'Contact and Support: Get Help With Your Peptide Orders',
    'Contact our Sydney, NSW team for help with orders, order tracking, COA results or research peptide questions. Fast support for customers across Australia.',
  ),
  standards: pageSeo(
    '/standards',
    'PEPLAB Standards | Quality and Compliance Information Guide',
    'Learn about PEPLAB standards, quality requirements, and compliance information. Explore our standards to understand the guidelines and practices we follow.',
  ),
  research: pageSeo(
    '/research',
    'Research Compounds and Products | PEPLAB Australia',
    "Browse PEPLAB Australia's research compounds for product information, available specifications, and quality testing details for laboratory research purposes.",
  ),
  blog: pageSeo(
    '/blog',
    'Peptide Research Blog: Guides, Testing and Lab Insights',
    'Read research peptide articles, testing guides and lab tips written for Australian researchers. Learn about HPLC purity, COAs, reconstitution and storage.',
  ),
  researchCompounds: pageSeo(
    '/research/compounds',
    'Research Compounds and Peptides | PEPLAB Australia',
    'Explore research compounds at PEPLAB Australia, with product details, specifications, and information on available research compounds. For research use only.',
  ),
  faq: pageSeo(
    '/faq',
    'FAQ: Peptide Shipping, Testing, Storage and Returns',
    'Find answers to common questions on ordering, shipping times, payment, order tracking, COAs and HPLC testing for research peptides supplied across Australia.',
  ),
  shipping: pageSeo(
    '/shipping',
    'PEPLAB Australia Shipping Policy Delivery Information Guide',
    'Learn about PEPLAB Australia shipping options, delivery timeframes, and shipping policies. Find important information about order processing and delivery.',
  ),
  terms: pageSeo(
    '/terms',
    'PEPLAB Terms and Conditions | Website Use and Policies Guide',
    'Read the PEPLAB terms and conditions to understand website usage, purchasing policies, and applicable terms. Review our guidelines before using our website.',
  ),
  privacy: pageSeo(
    '/privacy',
    'Privacy Policy: How We Collect and Protect Your Data',
    'Read how your personal information is collected, stored and protected when you order research peptides online. Our privacy policy covers Australian customers.',
  ),
  refund: pageSeo(
    '/refund',
    'Refund and Returns Policy | PEPLAB Australia Official',
    "Read PEPLAB Australia's refund policy for details on return conditions, refund eligibility, order issues, and the steps required to submit a refund request.",
  ),
  legal: pageSeo(
    '/legal',
    'Legal and Compliance: Terms and Research Use Only Policy',
    'Review the terms, conditions and research-use-only disclaimers for all peptide products supplied from Sydney, Australia. Please read before placing an order.',
  ),
  leaderboard: pageSeo(
    '/leaderboard',
    'Rewards Leaderboard: Top Customers and Loyalty Rankings',
    'Explore the leaderboard for rankings and activity from our Australian research peptide community. HPLC-tested peptides, published COAs, same-day dispatch.',
  ),
};
