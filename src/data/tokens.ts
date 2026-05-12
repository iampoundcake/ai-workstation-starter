// Design tokens — single source of truth.
//
// Token names are SEMANTIC ROLES, not literal colors. They're inherited from
// the Workshop palette where they happen to be cream/sage/etc, but in other
// themes those same role tokens take different values (e.g. in Daylight,
// "cream" is a near-black text color because cream = "primary text").
//
// Roles:
//   ink       primary canvas / page background
//   wall      mid surface (cards, panels)
//   shelf     elevated surface (hover state)
//   cream     primary text (high contrast against ink)
//   pencil    muted text (labels, metadata)
//   bookplate softest text (italic captions)
//   sage      primary accent / "room color" (borders, focus rings)
//   terracotta  primary CTA accent (send button)
//   brass     secondary CTA accent (file button)
//   lavender  marker accent (per-domain markers)

import { config } from '../config';

export type ThemeName = 'workshop' | 'daylight' | 'terminal' | 'studio';

export interface ThemeTokens {
  ink: string;
  wall: string;
  shelf: string;
  cream: string;
  pencil: string;
  bookplate: string;
  sage: string;
  terracotta: string;
  brass: string;
  lavender: string;
  fontDisplay: string;
  fontBody: string;
  fontSerif: string;
  fontMono: string;
  wavesStroke: string; // CSS color w/ alpha
}

export const THEMES: Record<ThemeName, ThemeTokens> = {
  // Workshop — editorial dark, sage room color, terracotta accent.
  // Joe's original. From anotherjoescott.com.
  workshop: {
    ink: '#111410',
    wall: '#1A1E1A',
    shelf: '#222722',
    cream: '#E8E4DF',
    pencil: '#8A8580',
    bookplate: '#9A9590',
    sage: '#8BA888',
    terracotta: '#C47D5A',
    brass: '#D4A855',
    lavender: '#B0A0C8',
    fontDisplay: '"Inter", system-ui, sans-serif',
    fontBody: '"IBM Plex Sans", system-ui, sans-serif',
    fontSerif: '"Instrument Serif", Georgia, serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
    wavesStroke: 'rgba(232, 228, 223, 0.18)',
  },

  // Daylight — warm-editorial paper. Forest accent on cream.
  // Inspired by open-design/warm-editorial.
  daylight: {
    ink: '#FAF7F2',
    wall: '#F2EDE4',
    shelf: '#E8DFD0',
    cream: '#1C1A17',
    pencil: '#6E6660',
    bookplate: '#8A817A',
    sage: '#2F5B4F',
    terracotta: '#C0512F',
    brass: '#A88636',
    lavender: '#6B5B7A',
    fontDisplay: '"Instrument Serif", Georgia, serif',
    fontBody: '"IBM Plex Sans", system-ui, sans-serif',
    fontSerif: '"Instrument Serif", Georgia, serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
    wavesStroke: 'rgba(28, 26, 23, 0.10)',
  },

  // Terminal — Bloomberg-style dark trading terminal. Cyan + coral + amber.
  // Inspired by open-design/trading-terminal.
  terminal: {
    ink: '#0D0D0D',
    wall: '#141414',
    shelf: '#1A1A1A',
    cream: '#FFFFFF',
    pencil: '#AAAAAA',
    bookplate: '#828282',
    sage: '#00D4AA',
    terracotta: '#FF4757',
    brass: '#FFB800',
    lavender: '#808086',
    fontDisplay: '"JetBrains Mono", ui-monospace, monospace',
    fontBody: '"JetBrains Mono", ui-monospace, monospace',
    fontSerif: '"JetBrains Mono", ui-monospace, monospace',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
    wavesStroke: 'rgba(0, 212, 170, 0.12)',
  },

  // Studio — burgundy editorial magazine on cream paper.
  // Custom palette; no direct open-design source.
  studio: {
    ink: '#F2EBE0',
    wall: '#ECE3D5',
    shelf: '#E0D4C0',
    cream: '#2A1318',
    pencil: '#7A6B66',
    bookplate: '#8F827A',
    sage: '#7B1F2A',
    terracotta: '#B89968',
    brass: '#B89968',
    lavender: '#5A4A6E',
    fontDisplay: '"Instrument Serif", Georgia, serif',
    fontBody: '"IBM Plex Sans", system-ui, sans-serif',
    fontSerif: '"Instrument Serif", Georgia, serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
    wavesStroke: 'rgba(42, 19, 24, 0.10)',
  },
};

const activeTheme = (config.theme as ThemeName) in THEMES
  ? (config.theme as ThemeName)
  : 'workshop';

export const COLOR = THEMES[activeTheme];

// Per-domain marker assignment. Rotates so adjacent grid tiles never share.
export const DOMAIN_MARKER: Record<string, keyof typeof COLOR> = {
  coaching: 'sage',
  account: 'terracotta',
  strategy: 'lavender',
  pod: 'brass',
  sales: 'sage',
  brand: 'terracotta',
  admin: 'brass',
  eng: 'lavender',
};

// Asymmetric grid spans (12-col grid at xl+).
export const DOMAIN_SPAN: Record<string, { xl: number; featured: boolean }> = {
  coaching: { xl: 4, featured: false },
  account: { xl: 4, featured: false },
  sales: { xl: 4, featured: false },
  strategy: { xl: 8, featured: true },
  pod: { xl: 4, featured: false },
  brand: { xl: 4, featured: false },
  admin: { xl: 4, featured: false },
  eng: { xl: 4, featured: false },
};

export function markerFor(domainId: string): string {
  return COLOR[DOMAIN_MARKER[domainId] || 'sage'] as string;
}

export function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const aa = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${aa}`;
}

// Inject CSS vars + font-family vars for the active theme into :root.
// Tailwind utilities resolve through `var(--color-X-rgb)` so all classes
// adapt automatically when the theme changes.
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

const COLOR_KEYS = [
  'ink', 'wall', 'shelf', 'cream', 'pencil', 'bookplate',
  'sage', 'terracotta', 'brass', 'lavender',
] as const;

export function applyTheme(name: ThemeName = activeTheme) {
  const t = THEMES[name] ?? THEMES.workshop;
  const root = document.documentElement.style;
  for (const key of COLOR_KEYS) {
    root.setProperty(`--color-${key}-rgb`, hexToRgb(t[key]));
  }
  root.setProperty('--font-display', t.fontDisplay);
  root.setProperty('--font-body', t.fontBody);
  root.setProperty('--font-serif', t.fontSerif);
  root.setProperty('--font-mono', t.fontMono);
  root.setProperty('--waves-stroke', t.wavesStroke);
  document.documentElement.dataset.theme = name;
}
