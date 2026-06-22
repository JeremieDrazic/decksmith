import type { Meta, StoryObj } from '@storybook/react-vite';
import { ManaCost } from './ManaCost';
import type { ManaCostProps } from './ManaCost';

const meta = {
  title: 'Components/MTG/ManaCost',
  component: ManaCost,
  parameters: { layout: 'centered' },
  args: { cost: '{2}{W}{U}', size: 'md' },
} satisfies Meta<typeof ManaCost>;

export default meta;
type Story = StoryObj<typeof meta>;

type Row = { cost: string; label?: string; size?: ManaCostProps['size'] };

function CostTable({ rows, size }: { rows: Row[]; size?: ManaCostProps['size'] }) {
  return (
    <table className="border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="w-44 pb-2 pr-6 text-left font-mono text-xs uppercase tracking-wide text-text-muted">
            Input
          </th>
          <th className="pb-2 pr-8 text-left font-mono text-xs uppercase tracking-wide text-text-muted">
            Rendered
          </th>
          {rows.some((r) => r.label) && (
            <th className="pb-2 text-left font-mono text-xs uppercase tracking-wide text-text-muted">
              Label
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ cost, label, size: rowSize }) => (
          <tr
            key={`${cost}-${rowSize ?? ''}`}
            className="border-b border-border-subtle last:border-0"
          >
            <td className="w-44 whitespace-nowrap py-3 pr-6 font-mono text-xs text-text-muted">
              {cost}
            </td>
            <td className="py-3 pr-8">
              <ManaCost cost={cost} size={rowSize ?? size} />
            </td>
            {label && <td className="py-3 text-sm text-text-muted">{label}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const Playground: Story = {};

export const Common: Story = {
  render: () => (
    <CostTable
      rows={[
        { cost: '{W}', label: 'Plains' },
        { cost: '{1}{U}', label: 'Curiosity' },
        { cost: '{2}{W}{U}', label: 'Geist of Saint Traft' },
        { cost: '{4}{W}{U}{B}', label: 'Dragonlord Ojutai' },
        { cost: '{X}{G}{G}', label: 'Mistcutter Hydra' },
      ]}
    />
  ),
};

export const WithHybrid: Story = {
  render: () => (
    <CostTable
      rows={[
        { cost: '{U/B}', label: 'Two-color hybrid' },
        { cost: '{2}{U/B}{U/B}', label: 'Shadowmage Infiltrator' },
        { cost: '{2/W}{2/W}{2/W}', label: '2-generic hybrid' },
        { cost: '{W/P}{W/P}', label: 'Phyrexian — pay 2 life' },
        { cost: '{2}{U/B}{W/P}', label: 'Mixed' },
      ]}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <CostTable
      rows={[
        { cost: '{2}{W}{U/B}', label: 'sm', size: 'sm' },
        { cost: '{2}{W}{U/B}', label: 'md', size: 'md' },
        { cost: '{2}{W}{U/B}', label: 'lg', size: 'lg' },
      ]}
    />
  ),
};
