import type { Meta, StoryObj } from '@storybook/react-vite';
import { ManaSymbol } from './ManaSymbol';

const meta = {
  title: 'Components/MTG/ManaSymbol',
  component: ManaSymbol,
  parameters: { layout: 'centered' },
  args: { symbol: 'u', size: 'md' },
} satisfies Meta<typeof ManaSymbol>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WUBRG: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {(['w', 'u', 'b', 'r', 'g', 'c', 'x'] as const).map((s) => (
        <ManaSymbol key={s} symbol={s} size="md" />
      ))}
    </div>
  ),
};

export const GenericMana: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap max-w-xs">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20].map((n) => (
        <ManaSymbol key={n} symbol={n} size="md" />
      ))}
    </div>
  ),
};

export const HybridTwoColor: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap max-w-xs">
      {['wu', 'ub', 'br', 'rg', 'gw', 'wb', 'ur', 'bg', 'rw', 'gu'].map((s) => (
        <ManaSymbol key={s} symbol={s} size="md" />
      ))}
    </div>
  ),
};

export const HybridGeneric: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {['2w', '2u', '2b', '2r', '2g'].map((s) => (
        <ManaSymbol key={s} symbol={s} size="md" />
      ))}
    </div>
  ),
};

export const Phyrexian: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {['wp', 'up', 'bp', 'rp', 'gp', 'cp'].map((s) => (
        <ManaSymbol key={s} symbol={s} size="md" />
      ))}
    </div>
  ),
};

export const SpecialSymbols: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {['s', 'e', 'tap', 'untap', 'half'].map((s) => (
        <ManaSymbol key={s} symbol={s} size="md" />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <ManaSymbol symbol="wu" size="sm" />
      <ManaSymbol symbol="wu" size="md" />
      <ManaSymbol symbol="wu" size="lg" />
    </div>
  ),
};
