import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Download, Save, Share2, Trash2 } from 'lucide-react';

import { Button } from '../Button/Button';
import { ButtonGroup } from '../ButtonGroup/ButtonGroup';
import { IconButton } from '../IconButton/IconButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

const meta = {
  title: 'Components/UI/Tooltip',
  component: TooltipContent,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: { layout: 'centered', controls: { disable: true } },
  args: {
    side: 'top',
    align: 'center',
    sideOffset: 10,
    showArrow: true,
  },
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    sideOffset: { control: 'number' },
    showArrow: { control: 'boolean' },
  },
} satisfies Meta<typeof TooltipContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>Hover me</TooltipTrigger>
      <TooltipContent {...args}>Save changes</TooltipContent>
    </Tooltip>
  ),
};

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>Hover me</TooltipTrigger>
      <TooltipContent>Save changes</TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-2 gap-16 p-8">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <div key={side} className="flex items-center justify-center p-8">
          <Tooltip>
            <TooltipTrigger render={<Button variant="secondary" size="sm" />}>
              {side}
            </TooltipTrigger>
            <TooltipContent side={side}>Appears on {side}</TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  ),
};

export const WithoutArrow: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>No arrow</TooltipTrigger>
      <TooltipContent showArrow={false}>No directional arrow</TooltipContent>
    </Tooltip>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>Long tooltip</TooltipTrigger>
      <TooltipContent>
        Commander is a multiplayer format where each player uses a deck of exactly 100 cards, led by
        a legendary creature that defines the deck's colors and strategy.
      </TooltipContent>
    </Tooltip>
  ),
};

const TOOLBAR_ACTIONS = [
  { label: 'Save', icon: <Save aria-hidden={true} /> },
  { label: 'Duplicate', icon: <Copy aria-hidden={true} /> },
  { label: 'Export', icon: <Download aria-hidden={true} /> },
  { label: 'Share', icon: <Share2 aria-hidden={true} /> },
  { label: 'Delete', icon: <Trash2 aria-hidden={true} /> },
];

/**
 * Moving between triggers within the Provider's closeDelay window skips the
 * opening delay — the tooltip follows instantly from one action to the next.
 */
export const Toolbar: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <ButtonGroup aria-label="Deck actions">
      {TOOLBAR_ACTIONS.map(({ label, icon }) => (
        <Tooltip key={label}>
          <TooltipTrigger
            render={<IconButton variant="secondary" aria-label={label} icon={icon} />}
          />
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </ButtonGroup>
  ),
};
