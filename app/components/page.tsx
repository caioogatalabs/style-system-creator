import type { Metadata } from 'next';
import { ComponentsPage } from '@/components/pages/ComponentsPage';

export const metadata: Metadata = {
  title: 'Components — Style System Creator',
};

export default function ComponentsRoute() {
  return <ComponentsPage />;
}
