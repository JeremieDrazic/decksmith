import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { useRender } from '@base-ui/react/use-render';

import { BREAKPOINTS, useMediaQuery } from '../../hooks/use-media-query';
import { cn } from '../../lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuTriggerProps,
} from '../DropdownMenu';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  type DrawerTriggerProps,
} from '../Drawer';

// ─── Context ────────────────────────────────────────────────────────────────
//
// The root picks the shape once (`menu` on desktop, `drawer` on mobile) and
// shares it, plus a `close()`, so every part renders the matching primitive
// without the consumer repeating the viewport decision.

type ResponsiveMenuMode = 'menu' | 'drawer';

type ResponsiveMenuContextValue = {
  mode: ResponsiveMenuMode;
  /** Imperatively closes the menu/sheet — used by mobile items (see `ResponsiveMenuItem`). */
  close: () => void;
};

const ResponsiveMenuContext = createContext<ResponsiveMenuContextValue | null>(null);

function useResponsiveMenuContext(component: string): ResponsiveMenuContextValue {
  const context = useContext(ResponsiveMenuContext);
  if (context === null) {
    throw new Error(`<${component}> must be used within <ResponsiveMenu>`);
  }
  return context;
}

// ─── ResponsiveMenu (Root) ────────────────────────────────────────────────────

export type ResponsiveMenuProps = {
  children: ReactNode;
  /** Controlled open state. Omit for an uncontrolled, trigger-driven menu. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * One menu, two shapes: a `DropdownMenu` anchored to its trigger on desktop, a
 * bottom `Drawer` on mobile. The shape is chosen in JavaScript from the `md`
 * breakpoint — `useMediaQuery` is SSR-safe (the sheet shows on the server and
 * corrects after hydration, which is invisible because the menu starts closed).
 *
 * The root owns the open state so mobile items can close the sheet on click:
 * a desktop `Menu.Item` closes itself, a row inside a `Drawer` does not.
 *
 * @example
 * <ResponsiveMenu>
 *   <ResponsiveMenuTrigger render={<IconButton aria-label="Account" />}>
 *     <UserIcon />
 *   </ResponsiveMenuTrigger>
 *   <ResponsiveMenuContent title="Account">
 *     <ResponsiveMenuItem render={<AppLink to="/settings" />}>Settings</ResponsiveMenuItem>
 *     <ResponsiveMenuSeparator />
 *     <ResponsiveMenuItem onClick={logout}>Log out</ResponsiveMenuItem>
 *   </ResponsiveMenuContent>
 * </ResponsiveMenu>
 */
export function ResponsiveMenu({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: ResponsiveMenuProps) {
  const isMenu = useMediaQuery(BREAKPOINTS.md);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );

  const value = useMemo<ResponsiveMenuContextValue>(
    () => ({ mode: isMenu ? 'menu' : 'drawer', close: () => setOpen(false) }),
    [isMenu, setOpen]
  );

  return (
    <ResponsiveMenuContext.Provider value={value}>
      {isMenu ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          {children}
        </DropdownMenu>
      ) : (
        <Drawer side="bottom" open={open} onOpenChange={setOpen}>
          {children}
        </Drawer>
      )}
    </ResponsiveMenuContext.Provider>
  );
}

// ─── ResponsiveMenuTrigger ────────────────────────────────────────────────────

export type ResponsiveMenuTriggerProps = DropdownMenuTriggerProps;

/**
 * The element that opens the menu. Pass `render={<Button />}` to merge props
 * without nesting, the same as the underlying triggers.
 */
export function ResponsiveMenuTrigger(props: ResponsiveMenuTriggerProps) {
  const { mode } = useResponsiveMenuContext('ResponsiveMenuTrigger');

  // Menu.Trigger and Drawer (Dialog) Trigger share one render/children/className
  // contract; the cast bridges their nominally-distinct Base UI prop types.
  return mode === 'menu' ? (
    <DropdownMenuTrigger {...props} />
  ) : (
    <DrawerTrigger {...(props as DrawerTriggerProps)} />
  );
}

// ─── ResponsiveMenuContent ──────────────────────────────────────────────────

export type ResponsiveMenuContentProps = {
  children?: ReactNode;
  className?: string;
  /**
   * Accessible heading for the content. On mobile it is the sheet's visible
   * `DrawerTitle` (its dialog requires one); on desktop it labels the menu.
   */
  title: string;
  /** Desktop only: which side of the trigger the menu opens on. @default 'bottom' */
  side?: DropdownMenuContentProps['side'];
  /** Desktop only: alignment relative to the trigger. @default 'end' */
  align?: DropdownMenuContentProps['align'];
};

/**
 * The menu panel (desktop) or sheet body (mobile). `side`/`align` position the
 * desktop menu; the mobile sheet always rises from the bottom edge.
 */
export function ResponsiveMenuContent({
  children,
  className,
  title,
  side = 'bottom',
  align = 'end',
}: ResponsiveMenuContentProps) {
  const { mode } = useResponsiveMenuContext('ResponsiveMenuContent');

  if (mode === 'menu') {
    return (
      <DropdownMenuContent side={side} align={align} aria-label={title} className={className}>
        {children}
      </DropdownMenuContent>
    );
  }

  return (
    <DrawerContent className={className}>
      <DrawerTitle>{title}</DrawerTitle>
      {children}
    </DrawerContent>
  );
}

// ─── ResponsiveMenuItem ──────────────────────────────────────────────────────

// Mobile row styling. On desktop the item is a Base UI Menu.Item and inherits
// DropdownMenu's own item styles; this only dresses the Drawer row, sized for a
// thumb and bled to the DrawerContent padding edges.
const DRAWER_ITEM = cn(
  'flex w-full cursor-pointer select-none items-center gap-3',
  '-mx-6 px-6 py-3 text-left text-base text-text outline-none',
  'transition-colors duration-fast ease-out',
  'hover:bg-accent-subtle focus-visible:bg-accent-subtle'
);

export type ResponsiveMenuItemProps = useRender.ComponentProps<'button'>;

/**
 * An interactive item. Pass `render={<AppLink />}` for navigation (keeping
 * `web-ui` router-agnostic) or an `onClick` for an action.
 *
 * Desktop items close the menu themselves (Base UI Menu.Item); mobile items are
 * plain rows inside a dialog, so this closes the sheet after the click handler.
 */
export function ResponsiveMenuItem(props: ResponsiveMenuItemProps) {
  const { mode, close } = useResponsiveMenuContext('ResponsiveMenuItem');
  const { render, ref, className, onClick, ...rest } = props;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event as MouseEvent<HTMLButtonElement>);
    close();
  };

  // `useRender` is a hook, so it is called unconditionally (rules of hooks). The
  // row it builds is only mounted on mobile; on desktop a Base UI Menu.Item is
  // rendered instead, which closes the menu itself on click.
  const drawerRow = useRender({
    render,
    ref,
    defaultTagName: 'button',
    props: {
      'data-slot': 'responsive-menu-item',
      type: 'button',
      className: cn(DRAWER_ITEM, className),
      onClick: handleClick,
      ...(rest as Record<string, unknown>),
    },
  });

  if (mode === 'menu') {
    return (
      <DropdownMenuItem
        render={render as DropdownMenuItemProps['render']}
        onClick={onClick as DropdownMenuItemProps['onClick']}
        className={className}
        {...(rest as DropdownMenuItemProps)}
      />
    );
  }

  return drawerRow;
}

// ─── ResponsiveMenuSeparator ──────────────────────────────────────────────────

export type ResponsiveMenuSeparatorProps = {
  className?: string;
};

/** A hairline between groups of items, full-bleed in both shapes. */
export function ResponsiveMenuSeparator({ className }: ResponsiveMenuSeparatorProps) {
  const { mode } = useResponsiveMenuContext('ResponsiveMenuSeparator');

  return mode === 'menu' ? (
    <DropdownMenuSeparator className={className} />
  ) : (
    <div
      data-slot="responsive-menu-separator"
      className={cn('-mx-6 my-2 h-px bg-border', className)}
    />
  );
}
