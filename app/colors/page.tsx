import type { Metadata } from 'next';
import { ColorsPage } from '@/components/pages/ColorsPage';

export const metadata: Metadata = {
  title: 'Colors — Style System Creator',
};

export default function ColorsRoute() {
  return <ColorsPage />;
}
