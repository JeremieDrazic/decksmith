import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip/Tooltip';
import { Button } from '../Button/Button';
import { Kbd, KbdCmd, KbdDel, KbdEnter, KbdGroup, KbdOpt, KbdShift } from './Kbd';

const meta = {
  title: 'Components/UI/Kbd',
  component: Kbd,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: () => (
    <KbdGroup>
      <KbdCmd aria-label="Command" />
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

/**
 * Modifier keys use icon helpers — `aria-label` is the translated accessible name.
 * Letter/word keys use `<Kbd>` with plain text content.
 */
export const SingleKeys: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">Command</span>
      <KbdCmd aria-label="Command" />
      <span className="font-mono text-xs text-text-faint">Option</span>
      <KbdOpt aria-label="Option" />
      <span className="font-mono text-xs text-text-faint">Shift</span>
      <KbdShift aria-label="Shift" />
      <span className="font-mono text-xs text-text-faint">Delete</span>
      <KbdDel aria-label="Delete" />
      <span className="font-mono text-xs text-text-faint">Enter</span>
      <KbdEnter aria-label="Enter" />
      <span className="font-mono text-xs text-text-faint">text</span>
      <div className="flex items-center gap-1">
        <Kbd>Ctrl</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>Tab</Kbd>
        <Kbd>K</Kbd>
      </div>
    </div>
  ),
};

/**
 * Compound shortcuts — description on the left, chord on the right.
 * This is the standard UX pattern for keyboard shortcut reference lists.
 */
export const CompoundShortcuts: Story = {
  render: () => (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-12 gap-y-3">
      <span className="text-sm text-text-muted">Open command palette</span>
      <KbdGroup>
        <KbdCmd aria-label="Command" />
        <Kbd>K</Kbd>
      </KbdGroup>
      <span className="text-sm text-text-muted">Export PDF</span>
      <KbdGroup>
        <KbdCmd aria-label="Command" />
        <KbdShift aria-label="Shift" />
        <Kbd>P</Kbd>
      </KbdGroup>
      <span className="text-sm text-text-muted">Undo</span>
      <KbdGroup>
        <KbdCmd aria-label="Command" />
        <Kbd>Z</Kbd>
      </KbdGroup>
      <span className="text-sm text-text-muted">Delete word</span>
      <KbdGroup>
        <KbdCmd aria-label="Command" />
        <KbdOpt aria-label="Option" />
        <KbdDel aria-label="Delete" />
      </KbdGroup>
    </div>
  ),
};

/** The most common placement: inside a Tooltip to surface the shortcut for an action. */
export const InTooltip: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>Save</TooltipTrigger>
        <TooltipContent>
          <span className="flex items-center gap-2">
            Save deck
            <KbdGroup>
              <KbdCmd aria-label="Command" />
              <Kbd>S</Kbd>
            </KbdGroup>
          </span>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>Search</TooltipTrigger>
        <TooltipContent>
          <span className="flex items-center gap-2">
            Search cards
            <KbdGroup>
              <KbdCmd aria-label="Command" />
              <Kbd>K</Kbd>
            </KbdGroup>
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};
