import type { ComponentProps } from 'react';

import { Check, Trash, Trash2 } from 'lucide-react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { useArmedState } from '../../hooks/use-armed-state/use-armed-state';
import { cn } from '../../lib/cn';
import { POPUP_ANIMATION } from '../../lib/floating/animations';

// ─── DropdownMenu (Root) ─────────────────────────────────────────────────────

export type DropdownMenuProps = MenuPrimitive.Root.Props;

/**
 * Root state container. Pairs one Trigger with one Content.
 * `modal=true` by default: keyboard focus stays trapped while the menu is open.
 */
export function DropdownMenu({ modal = true, ...props }: DropdownMenuProps) {
  return <MenuPrimitive.Root modal={modal} {...props} />;
}

// ─── DropdownMenuTrigger ─────────────────────────────────────────────────────

export type DropdownMenuTriggerProps = MenuPrimitive.Trigger.Props;

/**
 * The element that opens the menu on click. Pass `render={<Button />}` to
 * merge props without nesting.
 */
export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

// ─── DropdownMenuContent ─────────────────────────────────────────────────────

export type DropdownMenuContentProps = MenuPrimitive.Popup.Props & {
  /** Which side of the trigger the menu appears on. @default 'bottom' */
  side?: MenuPrimitive.Positioner.Props['side'];
  /** Alignment relative to the trigger. @default 'start' */
  align?: MenuPrimitive.Positioner.Props['align'];
  /** Gap in pixels between trigger and menu. @default 4 */
  sideOffset?: number;
};

/**
 * The floating menu panel. Renders via Portal.
 * Defaults: side=bottom, align=start (platform convention for dropdown menus).
 * Height is capped at `--available-height` (set by Base UI's positioner) so the
 * menu never overflows the viewport — overflow items are reachable via scroll.
 */
export function DropdownMenuContent({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  children,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner side={side} align={align} sideOffset={sideOffset}>
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            // --available-height is injected by Base UI's positioner
            'relative z-dropdown min-w-[11rem] max-h-[var(--available-height)] overflow-y-auto p-1',
            'rounded-surface border border-border bg-surface',
            'text-sm text-text shadow-popover',
            POPUP_ANIMATION,
            className
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

// ─── DropdownMenuGroup ────────────────────────────────────────────────────────

export type DropdownMenuGroupProps = MenuPrimitive.Group.Props;

/** Semantic wrapper for a set of related items. Contributes to `aria-labelledby` when used with `DropdownMenuGroupLabel`. */
export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

// ─── DropdownMenuGroupLabel ──────────────────────────────────────────────────

export type DropdownMenuGroupLabelProps = MenuPrimitive.GroupLabel.Props;

/** Eyebrow-style label for a `DropdownMenuGroup`. Not interactive. */
export function DropdownMenuGroupLabel({ className, ...props }: DropdownMenuGroupLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-group-label"
      className={cn(
        'px-2 py-1.5 font-mono text-xs uppercase tracking-wide text-text-muted',
        className
      )}
      {...props}
    />
  );
}

// ─── DropdownMenuSeparator ────────────────────────────────────────────────────

export type DropdownMenuSeparatorProps = MenuPrimitive.Separator.Props;

/** A 1px horizontal rule between groups of items. */
export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

// ─── Item base styles ─────────────────────────────────────────────────────────

// Shared across Item, CheckboxItem, RadioItem.
const ITEM_BASE = [
  'relative flex cursor-pointer select-none items-center gap-2',
  'rounded-interactive px-2 py-1.5 text-sm text-text outline-none',
  'transition-colors duration-fast ease-out',
  'data-[highlighted]:bg-accent-subtle data-[highlighted]:text-text',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled',
] as const;

// ─── DropdownMenuItem ─────────────────────────────────────────────────────────

export type DropdownMenuItemProps = MenuPrimitive.Item.Props & {
  /**
   * Adds extra left padding so text aligns with CheckboxItem / RadioItem text
   * when mixing item types in the same menu.
   */
  inset?: boolean;
};

/**
 * An interactive item. Close-on-click is the default.
 * To keep the menu open after activation, pass `closeOnClick={false}`.
 */
export function DropdownMenuItem({ className, inset, ...props }: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(ITEM_BASE, inset && 'pl-8', className)}
      {...props}
    />
  );
}

// ─── DropdownMenuCheckboxItem ─────────────────────────────────────────────────

export type DropdownMenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props;

/**
 * A checkable item. The checkmark appears at `left-2` inside a 32px gutter
 * so text stays aligned whether or not the item is ticked.
 */
export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(ITEM_BASE, 'pl-8', className)}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <Check className="size-3" aria-hidden={true} />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

// ─── DropdownMenuRadioGroup ───────────────────────────────────────────────────

export type DropdownMenuRadioGroupProps = MenuPrimitive.RadioGroup.Props;

/** Wraps a set of mutually exclusive `DropdownMenuRadioItem`s. */
export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

// ─── DropdownMenuRadioItem ────────────────────────────────────────────────────

export type DropdownMenuRadioItemProps = MenuPrimitive.RadioItem.Props;

/**
 * A radio-selectable item inside a `DropdownMenuRadioGroup`.
 * Same gutter pattern as CheckboxItem.
 */
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(ITEM_BASE, 'pl-8', className)}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <Check className="size-3" aria-hidden={true} />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

// ─── DropdownMenuShortcut ─────────────────────────────────────────────────────

export type DropdownMenuShortcutProps = ComponentProps<'span'>;

/**
 * Decorative keyboard shortcut hint, pushed to the right of the item.
 * Purely visual — does not bind the actual shortcut.
 */
export function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  return (
    <span
      className={cn('ml-auto font-mono text-xs tracking-widest text-text-faint', className)}
      {...props}
    />
  );
}

// ─── DeleteMenuItem ───────────────────────────────────────────────────────────

export type DeleteMenuItemProps = Omit<DropdownMenuItemProps, 'onClick' | 'closeOnClick'> & {
  /** Callback fired when the user confirms by clicking twice. */
  onDelete: () => void;
  /** Label shown after the first click. @default "Confirm deletion" */
  confirmLabel?: string;
  /** Milliseconds before the armed state auto-resets to idle. @default 3000 */
  timeout?: number;
};

/**
 * Two-step "armed delete" menu item.
 *
 * First click: arms the item and **keeps the menu open** (`closeOnClick=false`).
 * Second click: fires `onDelete` and **closes the menu** (`closeOnClick=true`).
 * Waiting resets to idle automatically.
 *
 * @example
 * <DropdownMenuContent>
 *   <DropdownMenuItem>Edit</DropdownMenuItem>
 *   <DropdownMenuSeparator />
 *   <DeleteMenuItem onDelete={() => deleteDeck(id)}>Delete deck</DeleteMenuItem>
 * </DropdownMenuContent>
 */
export function DeleteMenuItem({
  onDelete,
  confirmLabel = 'Confirm deletion',
  timeout = 3000,
  children,
  className,
  ...rest
}: DeleteMenuItemProps) {
  const { armed, handleArmOrConfirm } = useArmedState(timeout, onDelete);

  return (
    <DropdownMenuItem
      closeOnClick={armed}
      data-state={armed ? 'arming' : 'idle'}
      onClick={handleArmOrConfirm}
      className={cn(
        'text-error-text',
        'data-[highlighted]:!bg-error-subtle data-[highlighted]:!text-error-text',
        'data-[state=arming]:bg-error-subtle',
        'data-[state=arming]:data-[highlighted]:!bg-error data-[state=arming]:data-[highlighted]:!text-on-error',
        className
      )}
      {...rest}
    >
      <span className="flex items-center gap-2">
        {armed ? (
          <Trash className="size-4" aria-hidden="true" />
        ) : (
          <Trash2 className="size-4" aria-hidden="true" />
        )}
        {armed ? confirmLabel : children}
      </span>
    </DropdownMenuItem>
  );
}
