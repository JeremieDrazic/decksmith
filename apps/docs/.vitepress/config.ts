import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid({
  title: 'Decksmith',
  description: 'Magic: The Gathering deck management — architecture, specs, and decisions',
  base: '/docs/',

  // Internal dev-context notes (pitfalls per domain) are not part of the published
  // site: they are working notes referenced by CLAUDE.md, full of raw JSX snippets
  // ({{ }}, <Component />) that VitePress' Vue compiler would choke on. Excluded from
  // the build rather than escaping every snippet.
  srcExclude: ['**/context/pitfalls/**'],

  themeConfig: {
    logo: '🃏',

    nav: [
      { text: 'Roadmap', link: '/roadmap' },
      { text: 'ADRs', link: '/adr/' },
      { text: 'Specs', link: '/specs/' },
      { text: 'Design', link: '/design/DESIGN' },
      { text: 'Skills & Agents', link: '/skills-and-agents' },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Roadmap', link: '/roadmap' },
          { text: 'Project State', link: '/context/project-state' },
          { text: 'Decisions Log', link: '/context/decisions-log' },
          { text: 'Test Strategy', link: '/context/test-strategy' },
          { text: 'Skills & Agents', link: '/skills-and-agents' },
        ],
      },
      {
        text: 'Design System',
        collapsed: false,
        items: [
          { text: 'Quick Reference', link: '/design/DESIGN' },
          { text: 'Visual Identity', link: '/design/identity' },
          { text: 'Decisions', link: '/design/decisions' },
          {
            text: 'Screens',
            collapsed: true,
            items: [
              { text: 'Auth', link: '/design/screens/auth' },
              { text: 'Deck List', link: '/design/screens/deck-list' },
              { text: 'Deck Builder', link: '/design/screens/deck-builder' },
              { text: 'Collection', link: '/design/screens/collection' },
              { text: 'Card Search', link: '/design/screens/card-search' },
              { text: 'Card Detail', link: '/design/screens/card-detail' },
              { text: 'Settings', link: '/design/screens/settings' },
            ],
          },
        ],
      },
      {
        text: 'Architecture Decisions',
        collapsed: false,
        items: [
          { text: 'Index', link: '/adr/' },
          { text: 'ADR-0001: Use Fastify', link: '/adr/0001-use-fastify-as-web-framework' },
          {
            text: 'ADR-0002: Monorepo (pnpm + Turborepo)',
            link: '/adr/0002-monorepo-with-pnpm-and-turborepo',
          },
          {
            text: 'ADR-0003: TypeScript Strict',
            link: '/adr/0003-typescript-strict-configuration',
          },
          {
            text: 'ADR-0004: Code Quality',
            link: '/adr/0004-code-quality-and-formatting-standards',
          },
          {
            text: 'ADR-0005: Package Boundaries',
            link: '/adr/0005-package-boundaries-and-dependency-graph',
          },
          {
            text: 'ADR-0006: Testing (Vitest)',
            link: '/adr/0006-testing-strategy-with-vitest',
          },
          {
            text: 'ADR-0007: Job Queue (BullMQ)',
            link: '/adr/0007-job-queue-bullmq-redis',
          },
          {
            text: 'ADR-0008: Mobile-First Design',
            link: '/adr/0008-mobile-first-web-design-principles',
          },
          {
            text: 'ADR-0009: Responsive Strategy',
            link: '/adr/0009-responsive-feature-strategy',
          },
          {
            text: 'ADR-0010: Link Sharing',
            link: '/adr/0010-link-sharing-meta-tags',
          },
          {
            text: 'ADR-0011: File/Folder Conventions',
            link: '/adr/0011-file-folder-conventions',
          },
          {
            text: 'ADR-0012: Prisma DB Package',
            link: '/adr/0012-prisma-database-package',
          },
          {
            text: 'ADR-0013: Oxlint + Oxfmt',
            link: '/adr/0013-migrate-to-oxlint-and-oxfmt',
          },
          {
            text: 'ADR-0014: API-Proxied Auth',
            link: '/adr/0014-auth-api-proxied',
          },
          {
            text: 'ADR-0015: Design System Architecture',
            link: '/adr/0015-design-system-architecture',
          },
          {
            text: 'ADR-0016: TanStack Start',
            link: '/adr/0016-tanstack-start',
          },
          {
            text: 'ADR-0017: packages/tokens Architecture',
            link: '/adr/0017-packages-tokens-architecture',
          },
          {
            text: 'ADR-0018: Frontend Library Stack',
            link: '/adr/0018-frontend-library-stack',
          },
          {
            text: 'ADR-0019: web-ui Component Architecture',
            link: '/adr/0019-web-ui-component-architecture',
          },
          {
            text: 'ADR-0026: Reverse Proxy (Traefik)',
            link: '/adr/0026-reverse-proxy-traefik',
          },
          {
            text: 'ADR-0027: Web Hosting (SSR Node)',
            link: '/adr/0027-web-hosting-ssr-node-server',
          },
          {
            text: 'ADR-0028: Release & Versioning',
            link: '/adr/0028-release-versioning',
          },
        ],
      },
      {
        text: 'Deployment',
        collapsed: false,
        items: [{ text: 'Reverse Proxy (Traefik)', link: '/deployment/reverse-proxy' }],
      },
      {
        text: 'Feature Specs',
        collapsed: false,
        items: [
          { text: 'Index', link: '/specs/' },
          { text: 'User Auth', link: '/specs/user-auth' },
          { text: 'User Preferences', link: '/specs/user-preferences' },
          { text: 'Card Search', link: '/specs/card-search' },
          { text: 'Card Details', link: '/specs/card-details' },
          { text: 'Collection', link: '/specs/collection' },
          { text: 'Deck Management', link: '/specs/deck-management' },
          { text: 'Pricing', link: '/specs/pricing' },
          { text: 'PDF Generation', link: '/specs/pdf-generation' },
          { text: 'Craft Guide', link: '/specs/craft-guide' },
          { text: 'Recommendations', link: '/specs/recommendations' },
          { text: 'Data Model', link: '/specs/data-model' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/JeremieDrazic/decksmith' }],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Built with VitePress',
    },
  },

  // Mermaid theme — Decksmith accent (violet) layered onto Mermaid's own light/dark
  // themes. Colors only: the docs site has no font customization yet, so fontFamily
  // is left unset rather than reference an Outfit that isn't actually loaded here.
  // TODO(#89): once Outfit is self-hosted for apps/docs, add
  // themeVariables.fontFamily: "'Outfit', system-ui, sans-serif" here.
  //
  // Dark mode: vitepress-plugin-mermaid always forces mermaid's built-in "dark" theme
  // when <html class="dark"> (see node_modules/vitepress-plugin-mermaid/dist/Mermaid.vue
  // — `if (hasDarkClass) mermaidConfig.theme = "dark"` runs unconditionally), layering
  // themeVariables on top rather than replacing it. Two consequences shaped this config:
  //
  // 1. No *TextColor override below. An earlier version hardcoded light-mode text hexes
  //    (e.g. '#0f0e17') — since the dark override only swaps the theme *name*, that
  //    near-black text was still painted literally on the dark theme's near-black
  //    background (illegible). Leaving text colors unset lets each built-in theme (base
  //    for light, dark for dark) apply its own already-contrast-correct default instead.
  // 2. No solid opaque fills (e.g. '#f2f0e6' surface-raised) — same failure mode: a
  //    light-toned box under dark mode's light-toned default text is just as illegible
  //    the other way round. Every fill below is a translucent violet tint instead, so it
  //    reads as a soft accent over whichever page background shows through, in both modes.
  //
  // Net effect: violet (Decksmith's light-mode accent) is used as the single non-adaptive
  // diagram accent in both themes, rather than swapping to amber for dark like the rest
  // of the app does — same simplification already applied to `--accent-icon` in
  // packages/tokens/src/web/colors.css ("static violet — non-adaptive"). Full per-theme
  // fidelity would need patching the plugin; not worth it for diagram accents.
  mermaid: {
    theme: 'base',
    themeVariables: {
      fontSize: '15px',
      background: 'transparent',
      primaryColor: 'rgba(91, 79, 207, 0.12)',
      primaryBorderColor: '#5b4fcf',
      lineColor: '#5b4fcf',
      secondaryColor: 'rgba(91, 79, 207, 0.06)',
      tertiaryColor: 'rgba(91, 79, 207, 0.04)',

      // Sequence diagrams
      actorBkg: 'rgba(91, 79, 207, 0.12)',
      actorBorder: '#5b4fcf',
      actorLineColor: 'rgba(91, 79, 207, 0.35)',
      signalColor: '#5b4fcf',
      labelBoxBkgColor: 'rgba(91, 79, 207, 0.12)',
      labelBoxBorderColor: '#5b4fcf',
      noteBkgColor: 'rgba(91, 79, 207, 0.12)',
      noteBorderColor: '#5b4fcf',
      activationBkgColor: 'rgba(91, 79, 207, 0.16)',
      activationBorderColor: 'rgba(91, 79, 207, 0.4)',
    },
    sequence: {
      actorFontSize: 15,
      messageFontSize: 15,
      noteFontSize: 14,
    },
  },
});
