import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Copy,
  Download,
  Edit,
  ExternalLink,
  Globe,
  Lock,
  MoreHorizontal,
  Share2,
  Star,
  Trash2,
  Users,
} from 'lucide-react';

import { ICON_SIZE } from '../../lib/sizing/icon-size';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Kbd } from '../Kbd/Kbd';
import {
  DeleteMenuItem,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './DropdownMenu';

const meta = {
  title: 'Components/UI/DropdownMenu',
  component: DropdownMenuContent,
  parameters: { layout: 'centered', controls: { disable: true } },
  args: {
    side: 'bottom',
    align: 'start',
    sideOffset: 4,
  },
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    sideOffset: { control: 'number' },
  },
} satisfies Meta<typeof DropdownMenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent {...args}>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/**
 * Icons use `ICON_SIZE.xs` (14px) to match the 14px `text-sm` line height.
 * Destructive item applies semantic error tokens via `data-[highlighted]` variants.
 */
export const WithIcons: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            variant="secondary"
            aria-label="Card actions"
            icon={<MoreHorizontal className={ICON_SIZE.sm} aria-hidden={true} />}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Edit className={ICON_SIZE.xs} aria-hidden={true} />
          Edit deck
          <DropdownMenuShortcut>
            <Kbd>⌘E</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className={ICON_SIZE.xs} aria-hidden={true} />
          Duplicate
          <DropdownMenuShortcut>
            <Kbd>⌘D</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className={ICON_SIZE.xs} aria-hidden={true} />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className={ICON_SIZE.xs} aria-hidden={true} />
          Export PDF
          <DropdownMenuShortcut>
            <Kbd>⌘P</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Star className={ICON_SIZE.xs} aria-hidden={true} />
          Add to favourites
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-error data-[highlighted]:bg-error-subtle data-[highlighted]:text-error">
          <Trash2 className={ICON_SIZE.xs} aria-hidden={true} />
          Delete deck
          <DropdownMenuShortcut>
            <Kbd>⌫</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: function WithCheckboxItems() {
    const [showManaIcons, setShowManaIcons] = useState(true);
    const [showRarity, setShowRarity] = useState(false);
    const [showPrice, setShowPrice] = useState(true);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" />}>
          View options
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Visible columns</DropdownMenuGroupLabel>
            <DropdownMenuCheckboxItem checked={showManaIcons} onCheckedChange={setShowManaIcons}>
              Mana icons
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showRarity} onCheckedChange={setShowRarity}>
              Rarity
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showPrice} onCheckedChange={setShowPrice}>
              Price (EUR)
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithRadioItems: Story = {
  render: function WithRadioItems() {
    const [visibility, setVisibility] = useState('private');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" />}>
          Visibility
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Who can see this deck</DropdownMenuGroupLabel>
            <DropdownMenuRadioGroup value={visibility} onValueChange={setVisibility}>
              <DropdownMenuRadioItem value="private">
                <Lock className={ICON_SIZE.xs} aria-hidden={true} />
                Private
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="friends">
                <Users className={ICON_SIZE.xs} aria-hidden={true} />
                Friends only
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="public">
                <Globe className={ICON_SIZE.xs} aria-hidden={true} />
                Public
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/**
 * Two-step armed delete: first click arms the item (icon + label change, menu stays open),
 * second click confirms and closes. Waiting 3s resets automatically.
 */
export const WithDeleteMenuItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            variant="secondary"
            aria-label="Deck actions"
            icon={<MoreHorizontal className={ICON_SIZE.sm} aria-hidden={true} />}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Edit className={ICON_SIZE.xs} aria-hidden={true} />
          Edit deck
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className={ICON_SIZE.xs} aria-hidden={true} />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DeleteMenuItem onDelete={() => alert('Deleted')}>Delete deck</DeleteMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/**
 * Multiple menus — each armed state is independent.
 */
export const DeleteMenuItemInList: Story = {
  render: function DeleteMenuItemInList() {
    const [decks, setDecks] = useState(['Commander Goodstuff', 'Burn Everything', 'Control Tower']);

    return (
      <div className="flex w-64 flex-col divide-y divide-border">
        {decks.map((deck) => (
          <div
            key={deck}
            className="flex items-center justify-between gap-4 py-2.5 text-sm text-text"
          >
            <span>{deck}</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <IconButton
                    icon={<MoreHorizontal className={ICON_SIZE.sm} aria-hidden={true} />}
                    aria-label={`Options for ${deck}`}
                    variant="ghost"
                    size="xs"
                  />
                }
              />
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem>
                  <Edit className={ICON_SIZE.xs} aria-hidden={true} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DeleteMenuItem onDelete={() => setDecks((prev) => prev.filter((d) => d !== deck))}>
                  Delete
                </DeleteMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    );
  },
};

export const WithGroups: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>Account</DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>My account</DropdownMenuGroupLabel>
          <DropdownMenuItem>
            <Edit className={ICON_SIZE.xs} aria-hidden={true} />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>
              <Kbd>⌘,</Kbd>
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Deck</DropdownMenuGroupLabel>
          <DropdownMenuItem>
            <Share2 className={ICON_SIZE.xs} aria-hidden={true} />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ExternalLink className={ICON_SIZE.xs} aria-hidden={true} />
            View public page
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
