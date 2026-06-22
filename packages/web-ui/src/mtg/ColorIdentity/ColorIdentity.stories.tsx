import type { Meta, StoryObj } from '@storybook/react-vite';
import { getColorIdentityName } from '@decksmith/domain';
import type { ColorIdentity as ColorIdentityType } from '@decksmith/domain';
import { ColorIdentity } from './ColorIdentity';
import type { ColorIdentityProps } from './ColorIdentity';

const meta = {
  title: 'Components/MTG/ColorIdentity',
  component: ColorIdentity,
  parameters: { layout: 'centered' },
  args: { identity: ['w', 'u'], size: 'md' },
} satisfies Meta<typeof ColorIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

type Row = { identity: ColorIdentityType; size?: ColorIdentityProps['size'] };

function IdentityTable({ rows, size }: { rows: Row[]; size?: ColorIdentityProps['size'] }) {
  return (
    <table className="border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="w-32 pb-2 pr-6 text-left font-mono text-xs uppercase tracking-wide text-text-muted">
            Name
          </th>
          <th className="pb-2 pr-8 text-left font-mono text-xs uppercase tracking-wide text-text-muted">
            Identity
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ identity, size: rowSize }) => (
          <tr
            key={`${identity.join('')}-${rowSize ?? ''}`}
            className="border-b border-border-subtle last:border-0"
          >
            <td className="w-32 whitespace-nowrap py-3 pr-6 font-mono text-xs text-text-muted">
              {getColorIdentityName(identity)}
            </td>
            <td className="py-3 pr-8">
              <ColorIdentity identity={identity} size={rowSize ?? size} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const Playground: Story = {};

export const Mono: Story = {
  render: () => (
    <IdentityTable
      rows={[
        { identity: ['w'] },
        { identity: ['u'] },
        { identity: ['b'] },
        { identity: ['r'] },
        { identity: ['g'] },
      ]}
    />
  ),
};

export const Guilds: Story = {
  render: () => (
    <IdentityTable
      rows={[
        { identity: ['w', 'u'] },
        { identity: ['u', 'b'] },
        { identity: ['b', 'r'] },
        { identity: ['r', 'g'] },
        { identity: ['w', 'g'] },
        { identity: ['w', 'b'] },
        { identity: ['u', 'r'] },
        { identity: ['b', 'g'] },
        { identity: ['w', 'r'] },
        { identity: ['u', 'g'] },
      ]}
    />
  ),
};

export const ShardsAndClans: Story = {
  render: () => (
    <IdentityTable
      rows={[
        { identity: ['w', 'u', 'b'] },
        { identity: ['u', 'b', 'r'] },
        { identity: ['b', 'r', 'g'] },
        { identity: ['w', 'r', 'g'] },
        { identity: ['w', 'u', 'g'] },
        { identity: ['w', 'b', 'g'] },
        { identity: ['w', 'u', 'r'] },
        { identity: ['u', 'b', 'g'] },
        { identity: ['w', 'b', 'r'] },
        { identity: ['u', 'r', 'g'] },
      ]}
    />
  ),
};

export const FiveColor: Story = {
  render: () => <IdentityTable rows={[{ identity: ['w', 'u', 'b', 'r', 'g'] }]} />,
};

export const Sizes: Story = {
  render: () => (
    <IdentityTable
      rows={[
        { identity: ['w', 'u', 'b', 'r', 'g'], size: 'sm' },
        { identity: ['w', 'u', 'b', 'r', 'g'], size: 'md' },
        { identity: ['w', 'u', 'b', 'r', 'g'], size: 'lg' },
      ]}
    />
  ),
};
