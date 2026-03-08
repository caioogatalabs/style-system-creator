import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { TokenConfigProvider } from '@/context/TokenConfigContext';
import { OverlayProvider } from '@/context/OverlayContext';
import { TokenApplierBridge } from '@/components/TokenApplierBridge';
import { AppShell } from '@/components/layout/AppShell';
import { OverlayPanel } from '@/components/overlay/OverlayPanel';
import { generateInitialStyles } from '@/lib/token-css-server';
import { DEFAULT_TOKEN_CONFIG } from '@/lib/default-config';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Style System Creator',
  description: 'Configure your design system tokens and see them applied in real-time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const defaultStyles = generateInitialStyles(DEFAULT_TOKEN_CONFIG);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Inject exact token values server-side to eliminate first-paint flash */}
        <style dangerouslySetInnerHTML={{ __html: defaultStyles }} />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <TokenConfigProvider>
          <OverlayProvider>
            <TokenApplierBridge />
            <AppShell>
              {children}
            </AppShell>
            <OverlayPanel />
          </OverlayProvider>
        </TokenConfigProvider>
      </body>
    </html>
  );
}
