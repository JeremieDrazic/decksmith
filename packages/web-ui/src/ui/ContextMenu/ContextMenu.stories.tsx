import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Copy, Download, Edit, Globe, Lock, Share2, Star, Trash2, Users } from 'lucide-react';

import { ICON_SIZE } from '../../lib/sizing/icon-size';
import { Kbd } from '../Kbd/Kbd';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './ContextMenu';

const meta = {
  title: 'Components/UI/ContextMenu',
  component: ContextMenuContent,
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta<typeof ContextMenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Shared trigger style ─────────────────────────────────────────────────────

const TRIGGER_CLASS =
  'w-72 cursor-default rounded-surface border border-dashed border-border-subtle bg-surface-raised p-10 text-center text-sm text-text-muted select-none';

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className={TRIGGER_CLASS}>Right-click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Profile</ContextMenuItem>
        <ContextMenuItem>Settings</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Sign out</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className={TRIGGER_CLASS}>Right-click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Profile</ContextMenuItem>
        <ContextMenuItem>Settings</ContextMenuItem>
        <ContextMenuItem>Billing</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Sign out</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/**
 * Deck card context menu — icons + keyboard shortcuts.
 * Icons use `ICON_SIZE.xs` (14 px) to stay proportionate with `text-sm`.
 * Destructive item overrides highlight tokens to use error colours.
 */
export const WithIcons: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className={TRIGGER_CLASS}>Right-click a card</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Edit className={ICON_SIZE.xs} aria-hidden={true} />
          Edit deck
          <ContextMenuShortcut>
            <Kbd>⌘E</Kbd>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy className={ICON_SIZE.xs} aria-hidden={true} />
          Duplicate
          <ContextMenuShortcut>
            <Kbd>⌘D</Kbd>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Share2 className={ICON_SIZE.xs} aria-hidden={true} />
          Share
        </ContextMenuItem>
        <ContextMenuItem>
          <Download className={ICON_SIZE.xs} aria-hidden={true} />
          Export PDF
          <ContextMenuShortcut>
            <Kbd>⌘P</Kbd>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Star className={ICON_SIZE.xs} aria-hidden={true} />
          Add to favourites
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-error data-[highlighted]:bg-error-subtle data-[highlighted]:text-error">
          <Trash2 className={ICON_SIZE.xs} aria-hidden={true} />
          Delete deck
          <ContextMenuShortcut>
            <Kbd>⌫</Kbd>
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: function WithCheckboxItems() {
    const [showManaIcons, setShowManaIcons] = useState(true);
    const [showRarity, setShowRarity] = useState(false);
    const [showPrice, setShowPrice] = useState(true);

    return (
      <ContextMenu>
        <ContextMenuTrigger className={TRIGGER_CLASS}>
          Right-click to toggle columns
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuGroupLabel>Visible columns</ContextMenuGroupLabel>
            <ContextMenuCheckboxItem checked={showManaIcons} onCheckedChange={setShowManaIcons}>
              Mana icons
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={showRarity} onCheckedChange={setShowRarity}>
              Rarity
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={showPrice} onCheckedChange={setShowPrice}>
              Price (EUR)
            </ContextMenuCheckboxItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

export const WithGroups: Story = {
  render: function WithGroups() {
    const [visibility, setVisibility] = useState('private');

    return (
      <ContextMenu>
        <ContextMenuTrigger className={TRIGGER_CLASS}>Right-click a deck</ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuGroup>
            <ContextMenuGroupLabel>Actions</ContextMenuGroupLabel>
            <ContextMenuItem>
              <Edit className={ICON_SIZE.xs} aria-hidden={true} />
              Edit
            </ContextMenuItem>
            <ContextMenuItem>
              <Copy className={ICON_SIZE.xs} aria-hidden={true} />
              Duplicate
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuGroupLabel>Visibility</ContextMenuGroupLabel>
            <ContextMenuRadioGroup value={visibility} onValueChange={setVisibility}>
              <ContextMenuRadioItem value="private">
                <Lock className={ICON_SIZE.xs} aria-hidden={true} />
                Private
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="friends">
                <Users className={ICON_SIZE.xs} aria-hidden={true} />
                Friends only
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="public">
                <Globe className={ICON_SIZE.xs} aria-hidden={true} />
                Public
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuItem className="text-error data-[highlighted]:bg-error-subtle data-[highlighted]:text-error">
            <Trash2 className={ICON_SIZE.xs} aria-hidden={true} />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};
