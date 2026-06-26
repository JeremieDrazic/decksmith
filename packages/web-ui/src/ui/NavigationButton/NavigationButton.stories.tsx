import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '../Popover/Popover';
import { TooltipProvider } from '../Tooltip/Tooltip';
import { NavigationButton } from './NavigationButton';

const meta = {
  title: 'Components/UI/NavigationButton',
  component: NavigationButton,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    variant: 'close',
    buttonVariant: 'ghost',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['close', 'back', 'forward'] },
    buttonVariant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof NavigationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
};

export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">close</span>
      <NavigationButton variant="close" />
      <span className="font-mono text-xs text-text-muted">back</span>
      <NavigationButton variant="back" />
      <span className="font-mono text-xs text-text-muted">forward</span>
      <NavigationButton variant="forward" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">xs</span>
      <NavigationButton variant="close" size="xs" />
      <span className="font-mono text-xs text-text-muted">sm</span>
      <NavigationButton variant="close" size="sm" />
      <span className="font-mono text-xs text-text-muted">md</span>
      <NavigationButton variant="close" size="md" />
      <span className="font-mono text-xs text-text-muted">lg</span>
      <NavigationButton variant="close" size="lg" />
    </div>
  ),
};

export const ButtonVariants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">ghost</span>
      <NavigationButton variant="close" buttonVariant="ghost" />
      <span className="font-mono text-xs text-text-muted">secondary</span>
      <NavigationButton variant="close" buttonVariant="secondary" />
      <span className="font-mono text-xs text-text-muted">primary</span>
      <NavigationButton variant="close" buttonVariant="primary" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">close</span>
      <NavigationButton variant="close" disabled />
      <span className="font-mono text-xs text-text-muted">back</span>
      <NavigationButton variant="back" disabled />
      <span className="font-mono text-xs text-text-muted">forward</span>
      <NavigationButton variant="forward" disabled />
    </div>
  ),
};

/**
 * The typical use case: wired into PopoverClose via `render`.
 * NavigationButton stays purely presentational — PopoverClose injects the
 * click handler that dismisses the overlay.
 */
export const WithPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Share deck</PopoverTrigger>
      <PopoverContent>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <PopoverTitle>Share link</PopoverTitle>
            <PopoverDescription>Anyone with this link can view your deck.</PopoverDescription>
          </div>
          <PopoverClose render={<NavigationButton variant="close" />} />
        </div>
        <p className="text-xs text-text-muted font-mono">https://decksmith.app/d/atraxa-sf</p>
      </PopoverContent>
    </Popover>
  ),
};
