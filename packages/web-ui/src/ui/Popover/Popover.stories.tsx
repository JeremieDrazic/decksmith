import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { NavigationButton } from '../NavigationButton/NavigationButton';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from './Popover';

const meta = {
  title: 'Components/UI/Popover',
  component: PopoverContent,
  parameters: { layout: 'centered', controls: { disable: true } },
  args: {
    side: 'bottom',
    align: 'center',
    sideOffset: 8,
    showArrow: true,
  },
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    sideOffset: { control: 'number' },
    showArrow: { control: 'boolean' },
  },
} satisfies Meta<typeof PopoverContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Open popover</PopoverTrigger>
      <PopoverContent {...args}>
        <PopoverTitle>Card filters</PopoverTitle>
        <PopoverDescription>Narrow results by colour, rarity, or set.</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Open popover</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Card filters</PopoverTitle>
        <PopoverDescription>Narrow results by colour, rarity, or set.</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Rename deck</PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverTitle>Rename deck</PopoverTitle>
        <PopoverDescription className="mb-3">Choose a new name for your deck.</PopoverDescription>
        <div className="flex flex-col gap-2">
          <Input placeholder="e.g. Atraxa Superfriends" aria-label="Deck name" />
          <div className="flex justify-end gap-2">
            <PopoverClose render={<Button variant="ghost" size="sm" />}>Cancel</PopoverClose>
            <Button size="sm">Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>With arrow</PopoverTrigger>
      <PopoverContent showArrow side="bottom" align="center">
        <PopoverTitle>Tip</PopoverTitle>
        <PopoverDescription>The arrow points back at its trigger.</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};

export const Sides: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid min-h-screen grid-cols-3 grid-rows-3 place-items-center p-8">
      {/* top — row 1, col 2 */}
      <div className="col-start-2 row-start-1">
        <Popover>
          <PopoverTrigger render={<Button variant="secondary" size="sm" />}>top</PopoverTrigger>
          <PopoverContent side="top" align="center">
            <PopoverTitle>Appears on top</PopoverTitle>
            <PopoverDescription>Arrow points toward the trigger.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </div>
      {/* left — row 2, col 1 */}
      <div className="col-start-1 row-start-2">
        <Popover>
          <PopoverTrigger render={<Button variant="secondary" size="sm" />}>left</PopoverTrigger>
          <PopoverContent side="left" align="center">
            <PopoverTitle>Appears on left</PopoverTitle>
            <PopoverDescription>Arrow points toward the trigger.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </div>
      {/* right — row 2, col 3 */}
      <div className="col-start-3 row-start-2">
        <Popover>
          <PopoverTrigger render={<Button variant="secondary" size="sm" />}>right</PopoverTrigger>
          <PopoverContent side="right" align="center">
            <PopoverTitle>Appears on right</PopoverTitle>
            <PopoverDescription>Arrow points toward the trigger.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </div>
      {/* bottom — row 3, col 2 */}
      <div className="col-start-2 row-start-3">
        <Popover>
          <PopoverTrigger render={<Button variant="secondary" size="sm" />}>bottom</PopoverTrigger>
          <PopoverContent side="bottom" align="center">
            <PopoverTitle>Appears on bottom</PopoverTitle>
            <PopoverDescription>Arrow points toward the trigger.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
};

export const WithClose: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Share deck</PopoverTrigger>
      <PopoverContent>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <PopoverTitle>Share link</PopoverTitle>
            <PopoverDescription>Anyone with this link can view your deck.</PopoverDescription>
          </div>
          <PopoverClose render={<NavigationButton variant="close" size="sm" />} />
        </div>
        <div className="flex gap-2">
          <Input
            readOnly
            value="https://decksmith.app/d/atraxa-sf"
            aria-label="Share URL"
            className="flex-1 text-xs"
          />
          <Button size="sm">Copy</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
