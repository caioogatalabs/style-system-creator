'use client';

const loadedFonts = new Set<string>();

// Fonts from Google Fonts (standard)
const GOOGLE_FONTS = new Set([
  'Inter', 'DM Sans', 'Plus Jakarta Sans', 'Outfit', 'Nunito',
  'Lato', 'Roboto', 'IBM Plex Sans', 'Manrope', 'Source Serif 4',
  'Playfair Display', 'DM Serif Display', 'Cormorant', 'Space Grotesk',
  'Syne', 'Bebas Neue', 'Fraunces', 'Epilogue', 'Raleway',
  'Josefin Sans', 'Libre Baskerville', 'Merriweather', 'Crimson Text',
]);

// Fonts from Fontshare
const FONTSHARE_FONTS: Record<string, string> = {
  'Clash Display': 'clash-display',
  'Cabinet Grotesk': 'cabinet-grotesk',
  'Supreme': 'supreme',
  'Satoshi': 'satoshi',
  'General Sans': 'general-sans',
  'Switzer': 'switzer',
};

export function loadGoogleFont(family: string, weights = '300;400;500;600;700') {
  if (loadedFonts.has(family)) return;
  if (!GOOGLE_FONTS.has(family)) return;

  loadedFonts.add(family);
  const encoded = encodeURIComponent(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@${weights}&display=swap`;
  document.head.appendChild(link);
}

export function loadFontshareFont(family: string) {
  if (loadedFonts.has(family)) return;
  const slug = FONTSHARE_FONTS[family];
  if (!slug) return;

  loadedFonts.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://api.fontshare.com/v2/css?f[]=${slug}@300,400,500,600,700&display=swap`;
  document.head.appendChild(link);
}

export function loadFont(family: string) {
  if (FONTSHARE_FONTS[family]) {
    loadFontshareFont(family);
  } else if (GOOGLE_FONTS.has(family)) {
    loadGoogleFont(family);
  }
}

// Pre-load all fonts in the curated list for the selector previews
export function preloadAllFonts() {
  GOOGLE_FONTS.forEach((family) => loadGoogleFont(family, '400;700'));
  Object.keys(FONTSHARE_FONTS).forEach((family) => loadFontshareFont(family));
}
