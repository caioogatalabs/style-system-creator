import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { TokenConfigProvider } from '@/context/TokenConfigContext';
import { OverlayProvider } from '@/context/OverlayContext';
import { BrandProvider } from '@/context/BrandContext';
import { TokenApplierBridge } from '@/components/TokenApplierBridge';
import { AppShell } from '@/components/layout/AppShell';
import { OverlayPanel } from '@/components/overlay/OverlayPanel';
import { generateInitialStyles } from '@/lib/token-css-server';
import { loadBrand } from '@/lib/brand-loader';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const { manifest } = loadBrand();
  return {
    title: `${manifest.name} — Brand System`,
    description: manifest.description,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The brand under public/brand/ is the source of truth. Loaded server-side
  // so the first paint already reflects it (no flash) and the client tree
  // starts from the brand's TokenConfig.
  const { config, manifest, assets } = loadBrand();
  const brandStyles = generateInitialStyles(config);

  return (
    <html lang="en" data-theme={config.theme} suppressHydrationWarning>
      <head>
        {/* Inject exact token values server-side to eliminate first-paint flash */}
        <style dangerouslySetInnerHTML={{ __html: brandStyles }} />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <BrandProvider manifest={manifest} assets={assets}>
          <TokenConfigProvider initialConfig={config}>
            <OverlayProvider>
              <TokenApplierBridge />
              <AppShell>
                {children}
              </AppShell>
              <OverlayPanel />
            </OverlayProvider>
          </TokenConfigProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
