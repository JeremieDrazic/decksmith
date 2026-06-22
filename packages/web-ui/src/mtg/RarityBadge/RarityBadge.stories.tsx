import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../typography/Text';
import { Eyebrow } from '../../typography/Eyebrow';
import { RarityBadge } from './RarityBadge';

const RARITIES = ['common', 'uncommon', 'rare', 'mythic'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/MTG/RarityBadge',
  component: RarityBadge,
  parameters: { layout: 'centered' },
  args: { rarity: 'rare', size: 'md' },
} satisfies Meta<typeof RarityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllRarities: Story = {
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left">
            <Eyebrow>rarity</Eyebrow>
          </th>
          <th className="text-left">
            <Eyebrow>rendered</Eyebrow>
          </th>
        </tr>
      </thead>
      <tbody>
        {RARITIES.map((rarity) => (
          <tr key={rarity}>
            <td>
              <Text size="sm" tone="muted" mono>{`"${rarity}"`}</Text>
            </td>
            <td>
              <RarityBadge rarity={rarity} size="md" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left">
            <Eyebrow>rarity</Eyebrow>
          </th>
          {SIZES.map((size) => (
            <th key={size} className="text-left">
              <Eyebrow>{size}</Eyebrow>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {RARITIES.map((rarity) => (
          <tr key={rarity}>
            <td>
              <Text size="sm" tone="muted" mono>{`"${rarity}"`}</Text>
            </td>
            {SIZES.map((size) => (
              <td key={`${rarity}-${size}`} className="align-middle">
                <RarityBadge rarity={rarity} size={size} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const WithLabel: Story = {
  name: 'With label (composition)',
  render: () => (
    <div className="flex flex-col gap-3">
      {RARITIES.map((rarity) => (
        <span key={rarity} className="inline-flex items-center gap-1.5">
          <RarityBadge rarity={rarity} size="md" />
          <Text size="sm" tone="muted" mono>
            {rarity}
          </Text>
        </span>
      ))}
    </div>
  ),
};
