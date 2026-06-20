import type { Metadata } from 'next';
import { TypographyPage } from '@/components/pages/TypographyPage';

export const metadata: Metadata = {
  title: 'Typography — Style System Creator',
};

export default function TypographyRoute() {
  return <TypographyPage />;
}
