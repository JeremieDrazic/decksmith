import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BookOpen,
  Copy,
  Download,
  Eye,
  EyeOff,
  Layers3,
  LayoutGrid,
  Save,
  Share2,
  Trash2,
} from 'lucide-react';

import { Button } from '../Button/Button';
import { ButtonGroup } from '../ButtonGroup/ButtonGroup';
import { IconButton } from '../IconButton/IconButton';
import { IconToggle } from '../IconToggle/IconToggle';
import { Kbd } from '../Kbd/Kbd';
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
    sideOffset: 8,
    showArrow: false,
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

/**
 * The default is arrowless. `showArrow` stays available for the rare case where
 * the anchor is genuinely ambiguous — the arrow follows the accent popup.
 */
export const WithArrow: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>With arrow</TooltipTrigger>
      <TooltipContent showArrow={true}>Opt-in directional arrow</TooltipContent>
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

const COLLAPSED_NAV = [
  { label: 'Dashboard', icon: <LayoutGrid aria-hidden={true} /> },
  { label: 'Decks', icon: <Layers3 aria-hidden={true} /> },
  { label: 'Collection and wishlist', icon: <BookOpen aria-hidden={true} /> },
];

/**
 * The collapsed rail: icons in a column, each naming itself in a tooltip to the
 * right. The third's longer label wraps within the 260px cap.
 */
export const RailCollapsed: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex w-16 flex-col items-center gap-1 bg-bg p-2">
      {COLLAPSED_NAV.map(({ label, icon }) => (
        <Tooltip key={label}>
          <TooltipTrigger render={<IconButton variant="ghost" aria-label={label} icon={icon} />} />
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * The top-bar focus toggle in both states — the tooltip names the action
 * (enter / exit), below the control.
 */
export const FocusToggle: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger
          render={
            <IconToggle variant="ghost" aria-label="Focus mode" icon={<Eye aria-hidden={true} />} />
          }
        />
        <TooltipContent side="bottom">Enter focus mode</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <IconToggle
              variant="ghost"
              aria-label="Focus mode"
              defaultPressed={true}
              icon={<EyeOff aria-hidden={true} />}
            />
          }
        />
        <TooltipContent side="bottom">Exit focus mode</TooltipContent>
      </Tooltip>
    </div>
  ),
};

/**
 * Composed content stays legible on the accent ground — here a keyboard hint.
 * Verifies a nested `Kbd` keeps its own typography and enough contrast.
 */
export const WithKbd: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>Save</TooltipTrigger>
      <TooltipContent>
        <span className="flex items-center gap-2">
          Save changes <Kbd>⌘S</Kbd>
        </span>
      </TooltipContent>
    </Tooltip>
  ),
};
