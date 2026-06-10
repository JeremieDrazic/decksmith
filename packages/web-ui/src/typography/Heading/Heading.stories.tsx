import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from './Heading';

const meta = {
  title: 'Design System/Typography/Heading',
  component: Heading,
  parameters: { layout: 'padded' },
  args: {
    children: 'The quick brown fox',
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['4xl', '3xl', '2xl', 'xl'] as const).map((size) => (
        <Heading key={size} size={size} as="h2">
          {size} — The quick brown fox
        </Heading>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['semibold', 'bold', 'extrabold'] as const).map((weight) => (
        <Heading key={weight} weight={weight} as="h2">
          {weight} — The quick brown fox
        </Heading>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['default', 'muted', 'accent'] as const).map((tone) => (
        <Heading key={tone} tone={tone} as="h2">
          {tone} — The quick brown fox
        </Heading>
      ))}
    </div>
  ),
};

export const DecoupledFromTag: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-text-muted text-sm font-mono mb-2">
        Same visual size (3xl), different HTML tags
      </p>
      {(['h1', 'h2', 'h3', 'h4'] as const).map((tag) => (
        <Heading key={tag} as={tag} size="2xl">
          {`<${tag}>`} rendered at size 2xl
        </Heading>
      ))}
    </div>
  ),
};
