/**
 * SEO marketing landing at peplab.com.au/landing — Research Gateway.
 */
import '@/landing/index.css';
import '@/landing/research-atelier.css';
import BrandSplash from '@/landing/components/BrandSplash';
import ResearchGateway from '@/landing/pages/ResearchGateway';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';

export default function PeplabLandingRoute() {
  return (
    <>
      <BrandSplash />
      <Navigation logoHref="/landing" />
      <CartDrawer />
      <ResearchGateway />
    </>
  );
}
