import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';

const meta = {
  title: 'Components/Typography/Text',
  component: Text,
  parameters: { layout: 'padded' },
  args: {
    children: 'Build decks deliberately.',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['lg', 'base', 'sm'] as const).map((size) => (
        <Text key={size} size={size} as="p">
          {size} — Build decks deliberately.
        </Text>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['default', 'muted', 'faint', 'accent'] as const).map((tone) => (
        <Text key={tone} tone={tone} as="p">
          {tone} — Build decks deliberately.
        </Text>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['normal', 'medium', 'semibold'] as const).map((weight) => (
        <Text key={weight} weight={weight} as="p">
          {weight} — Build decks deliberately.
        </Text>
      ))}
    </div>
  ),
};

export const Mono: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text as="p" tone="muted" size="sm">
        Regular body copy alongside mono values
      </Text>
      <Text mono as="p">
        60 cards · 142 € · CMC 3.4
      </Text>
      <Text mono size="sm" tone="muted" as="p">
        87% coverage · 12 missing
      </Text>
    </div>
  ),
};

export const InlineUsage: Story = {
  render: () => (
    <Text as="p">
      Your deck has{' '}
      <Text mono weight="semibold">
        60 cards
      </Text>{' '}
      with a total value of{' '}
      <Text mono weight="semibold" tone="accent">
        142 €
      </Text>
      .
    </Text>
  ),
};
