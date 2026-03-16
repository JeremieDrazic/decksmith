import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Decksmith',
  description: 'Magic: The Gathering deck management — architecture, specs, and decisions',
  base: '/decksmith/',

  themeConfig: {
    logo: '🃏',

    nav: [
      { text: 'Roadmap', link: '/roadmap' },
      { text: 'ADRs', link: '/adr/' },
      { text: 'Specs', link: '/specs/' },
      { text: 'Skills & Agents', link: '/skills-and-agents' },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Roadmap', link: '/roadmap' },
          { text: 'Project State', link: '/context/project-state' },
          { text: 'Decisions Log', link: '/context/decisions-log' },
          { text: 'Skills & Agents', link: '/skills-and-agents' },
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
        ],
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
});
