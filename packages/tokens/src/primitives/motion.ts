export const motion = {
  duration: {
    instant: '50ms',
    fast: '100ms',
    normal: '200ms',
    slow: '350ms',
    page: '300ms',
    story: '500ms',
  },
  easing: {
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;
