import type { Meta, StoryObj } from '@storybook/react-vite';
import { getColorIdentityName } from '@decksmith/domain';
import type { ColorIdentity as ColorIdentityType } from '@decksmith/domain';
import { ColorIdentity } from './ColorIdentity';
import type { ColorIdentityProps } from './ColorIdentity';

const meta = {
  title: 'Components/MTG/ColorIdentity',
  component: ColorIdentity,
  parameters: { layout: 'centered' },
  args: { identity: ['W', 'U'], size: 'md' },
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
        { identity: ['W'] },
        { identity: ['U'] },
        { identity: ['B'] },
        { identity: ['R'] },
        { identity: ['G'] },
      ]}
    />
  ),
};

export const Guilds: Story = {
  render: () => (
    <IdentityTable
      rows={[
        { identity: ['W', 'U'] },
        { identity: ['U', 'B'] },
        { identity: ['B', 'R'] },
        { identity: ['R', 'G'] },
        { identity: ['W', 'G'] },
        { identity: ['W', 'B'] },
        { identity: ['U', 'R'] },
        { identity: ['B', 'G'] },
        { identity: ['W', 'R'] },
        { identity: ['U', 'G'] },
      ]}
    />
  ),
};

export const ShardsAndClans: Story = {
  render: () => (
    <IdentityTable
      rows={[
        { identity: ['W', 'U', 'B'] },
        { identity: ['U', 'B', 'R'] },
        { identity: ['B', 'R', 'G'] },
        { identity: ['W', 'R', 'G'] },
        { identity: ['W', 'U', 'G'] },
        { identity: ['W', 'B', 'G'] },
        { identity: ['W', 'U', 'R'] },
        { identity: ['U', 'B', 'G'] },
        { identity: ['W', 'B', 'R'] },
        { identity: ['U', 'R', 'G'] },
      ]}
    />
  ),
};

export const FiveColor: Story = {
  render: () => <IdentityTable rows={[{ identity: ['W', 'U', 'B', 'R', 'G'] }]} />,
};

export const Sizes: Story = {
  render: () => (
    <IdentityTable
      rows={[
        { identity: ['W', 'U', 'B', 'R', 'G'], size: 'sm' },
        { identity: ['W', 'U', 'B', 'R', 'G'], size: 'md' },
        { identity: ['W', 'U', 'B', 'R', 'G'], size: 'lg' },
      ]}
    />
  ),
};
