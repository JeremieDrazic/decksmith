export const typography = {
  fontFamily: {
    display: "'Outfit', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSize: {
    xs: 'clamp(0.6875rem, 0.6667rem + 0.1042vw, 0.75rem)',
    sm: 'clamp(0.8125rem, 0.7917rem + 0.1042vw, 0.875rem)',
    base: 'clamp(0.9375rem, 0.8958rem + 0.2083vw, 1.0625rem)',
    lg: 'clamp(1.0625rem, 1rem + 0.3125vw, 1.25rem)',
    xl: 'clamp(1.1875rem, 1.125rem + 0.3125vw, 1.375rem)',
    '2xl': 'clamp(1.375rem, 1.2917rem + 0.4167vw, 1.625rem)',
    '3xl': 'clamp(1.625rem, 1.5rem + 0.625vw, 2rem)',
    '4xl': 'clamp(1.875rem, 1.6667rem + 1.0417vw, 2.5rem)',
    '5xl': 'clamp(2.375rem, 2.0833rem + 1.4583vw, 3.25rem)',
    '6xl': 'clamp(3rem, 2.5833rem + 2.0833vw, 4.25rem)',
  },
  lineHeight: {
    xs: '1.5',
    sm: '1.5',
    base: '1.6',
    lg: '1.5',
    xl: '1.4',
    '2xl': '1.3',
    '3xl': '1.2',
    '4xl': '1.1',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.04em',
  },
} as const;
