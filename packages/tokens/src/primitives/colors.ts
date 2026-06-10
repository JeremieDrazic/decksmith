export const primitiveColors = {
  // ─── Ink scale — dark warm-purple (dark mode backgrounds, surfaces, borders) ────
  // ink950 doubles as light mode text — the darkest ink becomes high-contrast text
  ink950: '#0f0e17',
  ink900: '#1a1827',
  ink850: '#232135', // dark surface-raised and dark border-subtle share this value intentionally — the raised surface acts as its own separator
  ink800: '#2a2840',
  ink750: '#2e2b47',

  // ─── Ink text scale — lavender-to-purple text (dark mode) ────────────────────
  ink50: '#f0eef8',
  ink300: '#a8a2cc',
  ink600: '#524d80', // used as dark text-faint AND light text-muted — same purple mid-tone
  ink400: '#7b75a8',

  // ─── Cream scale — warm white backgrounds (light mode) ───────────────────────
  cream0: '#ffffff',
  cream50: '#faf9f4',
  cream100: '#f2f0e6',
  cream200: '#ede9d8',
  cream300: '#e8e5d8',
  cream400: '#d5d0be',

  // ─── Amber family — brand color + dark mode interactive accent ────────────────
  amber400: '#e8b84b',
  amber500: '#c49a1a',
  amber600: '#9e7b10',
  amber700: '#8a6a0c',
  amber400Subtle: 'rgba(232, 184, 75, 0.12)',
  amber400Border: 'rgba(232, 184, 75, 0.3)',
  amber500Subtle: 'rgba(196, 154, 26, 0.08)',
  amber500Border: 'rgba(196, 154, 26, 0.25)',

  // ─── Violet family — light mode interactive accent ────────────────────────────
  violet500: '#5b4fcf',
  violet600: '#4a3db0',
  violet700: '#3d319a',
  violet500Subtle: 'rgba(91, 79, 207, 0.08)',
  violet500Border: 'rgba(91, 79, 207, 0.25)',

  // ─── On-accent — mode-specific by nature (text rendered ON the accent button) ─
  onAccentDark: '#0f0e17',
  onAccentLight: '#ffffff',

  // ─── Status — error ──────────────────────────────────────────────────────────
  error: '#ef4444',
  error12: 'rgba(239, 68, 68, 0.12)',
  error08: 'rgba(239, 68, 68, 0.08)',
  errorDeep: '#b91c1c',

  // ─── Status — success ────────────────────────────────────────────────────────
  success: '#22c55e',
  success12: 'rgba(34, 197, 94, 0.12)',
  success08: 'rgba(34, 197, 94, 0.08)',
  successDeep: '#15803d',

  // ─── Status — warning ────────────────────────────────────────────────────────
  warningVivid: '#f59e0b',
  warning: '#d97706',
  warning12: 'rgba(245, 158, 11, 0.12)',
  warning08: 'rgba(217, 119, 6, 0.08)',
  warningDeep: '#92400e',

  // ─── Status — info ───────────────────────────────────────────────────────────
  infoVivid: '#5b9cf6',
  info: '#2563eb',
  info12: 'rgba(91, 156, 246, 0.12)',
  info08: 'rgba(37, 99, 235, 0.08)',
  infoDeep: '#1d4ed8',

  // ─── MTG WUBRG ───────────────────────────────────────────────────────────────
  mtgWhiteCream: '#f5f0d8', // mtg-white on dark bg — warm cream
  mtgWhiteGold: '#c8b96e', // mtg-white on light bg — muted gold
  mtgBlue: '#1a6eb5',
  mtgBlack: '#160d22',
  mtgRed: '#cc2222',
  mtgGreen: '#006e3c',
  mtgColorless: '#8fa3b0',
  mtgMulti: '#c9a84c',
} as const;
