import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown, LayoutGrid, List, Table } from 'lucide-react';

import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './ButtonGroup';

const meta = {
  title: 'Components/UI/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup aria-label="Text formatting">
      <Button variant="secondary">Bold</Button>
      <Button variant="secondary">Italic</Button>
      <Button variant="secondary">Underline</Button>
    </ButtonGroup>
  ),
};

export const ViewSwitcher: Story = {
  render: () => (
    <ButtonGroup aria-label="Collection view">
      <IconButton
        variant="secondary"
        icon={<LayoutGrid aria-hidden={true} />}
        aria-label="Grid view"
      />
      <IconButton variant="secondary" icon={<List aria-hidden={true} />} aria-label="List view" />
      <IconButton variant="secondary" icon={<Table aria-hidden={true} />} aria-label="Table view" />
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm font-mono">Split button — primary action + dropdown</p>
      <ButtonGroup aria-label="Save options">
        <Button variant="primary">Save deck</Button>
        <ButtonGroupSeparator />
        <IconButton
          variant="primary"
          icon={<ChevronDown aria-hidden={true} />}
          aria-label="More save options"
        />
      </ButtonGroup>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm font-mono">Prefix / suffix labels</p>
      <ButtonGroup aria-label="Price range">
        <ButtonGroupText>$</ButtonGroupText>
        <Button variant="secondary">Min</Button>
        <Button variant="secondary">Max</Button>
      </ButtonGroup>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" aria-label="Deck sections">
      <Button variant="secondary">Creatures</Button>
      <Button variant="secondary">Spells</Button>
      <Button variant="secondary">Lands</Button>
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <ButtonGroup aria-label="Small group">
        <Button size="sm" variant="secondary">
          Creatures
        </Button>
        <Button size="sm" variant="secondary">
          Spells
        </Button>
        <Button size="sm" variant="secondary">
          Lands
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Medium group">
        <Button size="md" variant="secondary">
          Creatures
        </Button>
        <Button size="md" variant="secondary">
          Spells
        </Button>
        <Button size="md" variant="secondary">
          Lands
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Large group">
        <Button size="lg" variant="secondary">
          Creatures
        </Button>
        <Button size="lg" variant="secondary">
          Spells
        </Button>
        <Button size="lg" variant="secondary">
          Lands
        </Button>
      </ButtonGroup>
    </div>
  ),
};

export const MixedVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm font-mono">
        Ghost variant — no visible border, radius only
      </p>
      <ButtonGroup aria-label="Filter format">
        <Button variant="ghost">Standard</Button>
        <Button variant="ghost">Modern</Button>
        <Button variant="ghost">Commander</Button>
        <Button variant="ghost">Legacy</Button>
      </ButtonGroup>
    </div>
  ),
};
