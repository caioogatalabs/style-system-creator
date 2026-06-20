import type { Metadata } from 'next';
import { ContextPage } from '@/components/pages/ContextPage';

export const metadata: Metadata = {
  title: 'In Context — Brand System',
};

export default function ContextRoute() {
  return <ContextPage />;
}
