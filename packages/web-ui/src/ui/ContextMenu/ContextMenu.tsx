'use client';

import type { ComponentProps } from 'react';

import { Check } from 'lucide-react';
import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';

import { cn } from '../../lib/cn';
import { POPUP_ANIMATION } from '../../lib/floating/animations';

// ─── ContextMenu (Root) ──────────────────────────────────────────────────────

export type ContextMenuProps = ContextMenuPrimitive.Root.Props;

/**
 * Root state container. Pairs one Trigger area with one Content.
 * Opened by right-click or long press on the Trigger element.
 */
export function ContextMenu(props: ContextMenuProps) {
  return <ContextMenuPrimitive.Root {...props} />;
}

// ─── ContextMenuTrigger ──────────────────────────────────────────────────────

export type ContextMenuTriggerProps = ContextMenuPrimitive.Trigger.Props;

/**
 * The area that opens the menu on right-click or long press.
 * Renders a `<div>` by default — pass `render` to use a different element.
 */
export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

// ─── ContextMenuContent ──────────────────────────────────────────────────────

export type ContextMenuContentProps = ContextMenuPrimitive.Popup.Props;

/**
 * The floating menu panel, rendered into a Portal.
 * Positioned at the cursor — no side/align props needed.
 * Height is capped at `--available-height` (set by the Positioner) so overflow
 * is reachable via scroll.
 */
export function ContextMenuContent({ className, children, ...props }: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner>
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
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
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

// ─── ContextMenuGroup ────────────────────────────────────────────────────────

export type ContextMenuGroupProps = ContextMenuPrimitive.Group.Props;

/** Semantic wrapper for a set of related items. Pairs with `ContextMenuGroupLabel`. */
export function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

// ─── ContextMenuGroupLabel ───────────────────────────────────────────────────

export type ContextMenuGroupLabelProps = ContextMenuPrimitive.GroupLabel.Props;

/** Eyebrow-style label for a `ContextMenuGroup`. Not interactive. */
export function ContextMenuGroupLabel({ className, ...props }: ContextMenuGroupLabelProps) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-group-label"
      className={cn(
        'px-2 py-1.5 font-mono text-xs uppercase tracking-wide text-text-muted',
        className
      )}
      {...props}
    />
  );
}

// ─── ContextMenuSeparator ────────────────────────────────────────────────────

export type ContextMenuSeparatorProps = ContextMenuPrimitive.Separator.Props;

/** A 1px horizontal rule between groups of items. */
export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

// ─── Item base styles ─────────────────────────────────────────────────────────

// Duplicated from DropdownMenu — ContextMenu and DropdownMenu use distinct
// Base UI primitives (different Root/Trigger context), so sharing via barrel
// would violate the one-export-per-file rule.
const ITEM_BASE = [
  'relative flex cursor-pointer select-none items-center gap-2',
  'rounded-interactive px-2 py-1.5 text-sm text-text outline-none',
  'transition-colors duration-fast ease-out',
  'data-[highlighted]:bg-accent-subtle data-[highlighted]:text-text',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38]',
] as const;

// ─── ContextMenuItem ─────────────────────────────────────────────────────────

export type ContextMenuItemProps = ContextMenuPrimitive.Item.Props & {
  /**
   * Adds extra left padding so text aligns with CheckboxItem / RadioItem text
   * when mixing item types in the same menu.
   */
  inset?: boolean;
};

/** An interactive item. Closes the menu on click by default. */
export function ContextMenuItem({ className, inset, ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      className={cn(ITEM_BASE, inset && 'pl-8', className)}
      {...props}
    />
  );
}

// ─── ContextMenuCheckboxItem ─────────────────────────────────────────────────

export type ContextMenuCheckboxItemProps = ContextMenuPrimitive.CheckboxItem.Props;

/**
 * A checkable item. The checkmark appears at `left-2` inside a 32px gutter
 * so text stays aligned whether or not the item is ticked.
 */
export function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(ITEM_BASE, 'pl-8', className)}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <Check className="size-3" aria-hidden={true} />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

// ─── ContextMenuRadioGroup ───────────────────────────────────────────────────

export type ContextMenuRadioGroupProps = ContextMenuPrimitive.RadioGroup.Props;

/** Wraps a set of mutually exclusive `ContextMenuRadioItem`s. */
export function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

// ─── ContextMenuRadioItem ────────────────────────────────────────────────────

export type ContextMenuRadioItemProps = ContextMenuPrimitive.RadioItem.Props;

/**
 * A radio-selectable item inside a `ContextMenuRadioGroup`.
 * Same gutter pattern as CheckboxItem.
 */
export function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(ITEM_BASE, 'pl-8', className)}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <Check className="size-3" aria-hidden={true} />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

// ─── ContextMenuShortcut ─────────────────────────────────────────────────────

export type ContextMenuShortcutProps = ComponentProps<'span'>;

/**
 * Decorative keyboard shortcut hint, pushed to the right of the item.
 * Purely visual — does not bind the actual shortcut.
 */
export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  return (
    <span
      className={cn('ml-auto font-mono text-xs tracking-widest text-text-faint', className)}
      {...props}
    />
  );
}
