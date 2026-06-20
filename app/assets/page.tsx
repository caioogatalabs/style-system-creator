import type { Metadata } from 'next';
import { AssetsPage } from '@/components/pages/AssetsPage';

export const metadata: Metadata = {
  title: 'Assets — Brand System',
};

export default function AssetsRoute() {
  return <AssetsPage />;
}
