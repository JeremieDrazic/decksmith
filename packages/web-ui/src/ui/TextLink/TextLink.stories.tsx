import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExternalLink } from 'lucide-react';

import { TextLink } from './TextLink';

const meta = {
  title: 'Components/UI/TextLink',
  component: TextLink,
  parameters: { layout: 'centered' },
  args: {
    href: '#',
    children: 'Lien exemple',
  },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { variant: 'default', children: 'Créer un compte →' },
};

export const Subtle: Story = {
  args: { variant: 'subtle', children: 'Mot de passe oublié ?' },
};

// ─── With icon ────────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  render: () => (
    <TextLink href="#" className="inline-flex items-center gap-1">
      Documentation
      <ExternalLink className="size-3.5" aria-hidden="true" />
    </TextLink>
  ),
};

// ─── Inline in text ───────────────────────────────────────────────────────────

export const InlineInText: Story = {
  render: () => (
    <p className="text-text-muted text-sm">
      Vous avez déjà un compte ? <TextLink href="#">Se connecter →</TextLink>
    </p>
  ),
};
