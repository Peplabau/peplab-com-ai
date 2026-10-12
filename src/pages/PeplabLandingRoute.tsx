/**
 * Legacy /landing route — always send visitors to the shop.
 */
import { Navigate } from 'react-router-dom';
import { SHOP_PATH } from '@/lib/routes';

export default function PeplabLandingRoute() {
  return <Navigate to={SHOP_PATH} replace />;
}
