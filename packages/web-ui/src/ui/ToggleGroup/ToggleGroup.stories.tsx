import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutGrid, List, Table } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

const meta = {
  title: 'Components/UI/ToggleGroup',
  component: ToggleGroup,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToggleGroup aria-label="Text alignment">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const ViewSwitcher: Story = {
  render: () => (
    <ToggleGroup defaultValue={['grid']} aria-label="Collection view">
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid aria-hidden={true} />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List aria-hidden={true} />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table aria-hidden={true} />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Attached: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-text-muted text-xs font-mono">ghost + spacing=0</p>
        <ToggleGroup spacing={0} aria-label="Format">
          <ToggleGroupItem value="standard">Standard</ToggleGroupItem>
          <ToggleGroupItem value="modern">Modern</ToggleGroupItem>
          <ToggleGroupItem value="commander">Commander</ToggleGroupItem>
          <ToggleGroupItem value="legacy">Legacy</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-text-muted text-xs font-mono">secondary + spacing=0</p>
        <ToggleGroup variant="secondary" spacing={0} aria-label="Format">
          <ToggleGroupItem value="standard">Standard</ToggleGroupItem>
          <ToggleGroupItem value="modern">Modern</ToggleGroupItem>
          <ToggleGroupItem value="commander">Commander</ToggleGroupItem>
          <ToggleGroupItem value="legacy">Legacy</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ToggleGroup variant="ghost" aria-label="Ghost group">
        <ToggleGroupItem value="a">Option A</ToggleGroupItem>
        <ToggleGroupItem value="b">Option B</ToggleGroupItem>
        <ToggleGroupItem value="c">Option C</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup variant="secondary" aria-label="Secondary group">
        <ToggleGroupItem value="a">Option A</ToggleGroupItem>
        <ToggleGroupItem value="b">Option B</ToggleGroupItem>
        <ToggleGroupItem value="c">Option C</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <ToggleGroup key={size} size={size} aria-label={`Size ${size}`}>
          <ToggleGroupItem value="a">{size}</ToggleGroupItem>
          <ToggleGroupItem value="b">Option</ToggleGroupItem>
          <ToggleGroupItem value="c">Option</ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ToggleGroup orientation="vertical" variant="secondary" spacing={0} aria-label="Deck sections">
      <ToggleGroupItem value="creatures">Creatures</ToggleGroupItem>
      <ToggleGroupItem value="spells">Spells</ToggleGroupItem>
      <ToggleGroupItem value="lands">Lands</ToggleGroupItem>
      <ToggleGroupItem value="sideboard">Sideboard</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-text-muted text-xs font-mono">
        Plusieurs valeurs actives simultanément (defaultValue tableau)
      </p>
      <ToggleGroup defaultValue={['u', 'r']} aria-label="Colors filter">
        <ToggleGroupItem value="w">White</ToggleGroupItem>
        <ToggleGroupItem value="u">Blue</ToggleGroupItem>
        <ToggleGroupItem value="b">Black</ToggleGroupItem>
        <ToggleGroupItem value="r">Red</ToggleGroupItem>
        <ToggleGroupItem value="g">Green</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};
