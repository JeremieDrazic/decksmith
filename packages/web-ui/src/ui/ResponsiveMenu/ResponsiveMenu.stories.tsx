import type { Meta, StoryObj } from '@storybook/react-vite';

import { LogOut, Settings, User } from 'lucide-react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { ICON_SIZE } from '../../lib/sizing/icon-size';
import { IconButton } from '../IconButton/IconButton';
import {
  ResponsiveMenu,
  ResponsiveMenuContent,
  ResponsiveMenuItem,
  ResponsiveMenuSeparator,
  ResponsiveMenuTrigger,
} from './ResponsiveMenu';

/**
 * One menu, two shapes. At `md` and up it is a `DropdownMenu` anchored to its
 * trigger; below `md` it becomes a bottom `Drawer`. Resize the preview across
 * 768px to see it switch — the shape is chosen from the live viewport.
 */
const meta = {
  title: 'Components/UI/ResponsiveMenu',
  component: ResponsiveMenuContent,
  parameters: { layout: 'centered', controls: { disable: true } },
  args: {
    title: 'Account',
    side: 'bottom',
    align: 'end',
  },
  argTypes: {
    title: { control: 'text' },
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
} satisfies Meta<typeof ResponsiveMenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <ResponsiveMenu>
      <ResponsiveMenuTrigger
        render={
          <IconButton
            variant="secondary"
            aria-label="Account"
            icon={<User className={ICON_SIZE.sm} aria-hidden={true} />}
          />
        }
      />
      <ResponsiveMenuContent {...args}>
        <ResponsiveMenuItem render={<a href="#settings" />}>
          <Settings className={ICON_SIZE.sm} aria-hidden={true} />
          Settings
        </ResponsiveMenuItem>
        <ResponsiveMenuSeparator />
        <ResponsiveMenuItem onClick={fn()}>
          <LogOut className={ICON_SIZE.sm} aria-hidden={true} />
          Log out
        </ResponsiveMenuItem>
      </ResponsiveMenuContent>
    </ResponsiveMenu>
  ),
  // Opening the menu exercises the trigger → content wiring and lets axe scan the
  // open panel. Items are matched by text, not role, so the assertion holds in
  // both shapes (a Drawer row is a button/link, not a `menuitem`).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Account' }));

    // The panel renders through a portal, so query the document, not the canvas.
    // waitFor retries past the open animation (opacity 0 → 1) before asserting visibility.
    await waitFor(() => expect(screen.getByText('Settings')).toBeVisible());
    await expect(screen.getByText('Log out')).toBeVisible();
  },
};

/**
 * The shell's account menu: a navigation item (a real link) and a sign-out
 * action. In `apps/web` the Settings item injects the router's `Link` via
 * `render`; here a plain `<a>` stands in to keep `web-ui` router-agnostic.
 */
export const AccountMenu: Story = {
  render: () => (
    <ResponsiveMenu>
      <ResponsiveMenuTrigger
        render={
          <IconButton
            variant="ghost"
            aria-label="Account"
            icon={<User className={ICON_SIZE.sm} aria-hidden={true} />}
          />
        }
      />
      <ResponsiveMenuContent title="Account">
        <ResponsiveMenuItem render={<a href="#settings" />}>
          <Settings className={ICON_SIZE.sm} aria-hidden={true} />
          Settings
        </ResponsiveMenuItem>
        <ResponsiveMenuSeparator />
        <ResponsiveMenuItem onClick={fn()}>
          <LogOut className={ICON_SIZE.sm} aria-hidden={true} />
          Log out
        </ResponsiveMenuItem>
      </ResponsiveMenuContent>
    </ResponsiveMenu>
  ),
  // Verifies the router-agnostic link path: a `render={<a>}` item is a real
  // anchor carrying its href, in whichever shape the menu takes.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Account' }));

    const settings = await screen.findByText('Settings');
    await expect(settings.closest('a')).toHaveAttribute('href', '#settings');
  },
};
