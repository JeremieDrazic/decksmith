import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { BACKDROP_ANIMATION, POPUP_ANIMATION } from '../../lib/floating/animations';
import { CONTROL_HEIGHT } from '../../lib/sizing/control-height';
import { Separator } from '../Separator/Separator';

// ─── Select (Root) ────────────────────────────────────────────────────────────

export type SelectProps<
  Value = string,
  Multiple extends boolean = false,
> = SelectPrimitive.Root.Props<Value, Multiple>;

/**
 * Dropdown picker. Manages value state and keyboard navigation.
 * Pass `multiple` for multi-select — value becomes `Value[]` and
 * `onValueChange` receives `Value[] | null`.
 *
 * @example
 * <Select name="format" defaultValue="commander">
 *   <SelectTrigger id="format"><SelectValue /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="commander">Commander</SelectItem>
 *   </SelectContent>
 * </Select>
 */
export function Select<Value = string, Multiple extends boolean = false>(
  props: SelectProps<Value, Multiple>
) {
  return <SelectPrimitive.Root {...props} />;
}

// ─── SelectIcon ───────────────────────────────────────────────────────────────

export type SelectIconProps = SelectPrimitive.Icon.Props;

/**
 * Chevron icon rendered inside SelectTrigger. Rotates when popup is open.
 * Rendered automatically by SelectTrigger — only use this explicitly when
 * building a custom trigger layout.
 */
export function SelectIcon({ className, children, ...props }: SelectIconProps) {
  return (
    <SelectPrimitive.Icon
      data-slot="select-icon"
      className={cn(
        'shrink-0 text-text-muted',
        'transition-transform duration-fast data-[popup-open]:rotate-180',
        className
      )}
      {...props}
    >
      {children ?? <ChevronDown className="size-4" aria-hidden={true} />}
    </SelectPrimitive.Icon>
  );
}

// ─── SelectTrigger ────────────────────────────────────────────────────────────

export type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  /**
   * Whether to auto-render the default chevron icon.
   * Set to false when composing a custom icon with SelectIcon.
   * @default true
   */
  showIcon?: boolean;
};

/**
 * Button that opens the Select popup. Styled to match Input.
 * Place SelectValue inside — a chevron icon is rendered automatically.
 * Use showIcon={false} + explicit SelectIcon to provide a custom icon.
 *
 * @example
 * <SelectTrigger id="format">
 *   <SelectValue placeholder="Pick a format" />
 * </SelectTrigger>
 *
 * @example Custom icon
 * <SelectTrigger id="format" showIcon={false}>
 *   <SelectValue />
 *   <SelectIcon><MyIcon /></SelectIcon>
 * </SelectTrigger>
 */
export function SelectTrigger({
  className,
  children,
  showIcon = true,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        `group flex ${CONTROL_HEIGHT.md} w-full items-center justify-between gap-2`,
        'rounded-interactive border border-border-interactive bg-transparent',
        'px-3 py-1 text-sm text-text',
        'outline-none transition-[border-color,box-shadow] duration-fast',
        'focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'data-[popup-open]:border-border-focus',
        'aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20',
        'disabled:cursor-not-allowed disabled:opacity-disabled',
        className
      )}
      {...props}
    >
      {children}
      {showIcon && <SelectIcon />}
    </SelectPrimitive.Trigger>
  );
}

// ─── SelectValue ──────────────────────────────────────────────────────────────

export type SelectValueProps = SelectPrimitive.Value.Props;

/**
 * Displays the selected value or placeholder inside SelectTrigger.
 *
 * @example
 * <SelectValue placeholder="Pick a format" />
 */
export function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex-1 truncate text-left data-[placeholder]:text-text-muted', className)}
      {...props}
    />
  );
}

// ─── SelectList ───────────────────────────────────────────────────────────────

export type SelectListProps = SelectPrimitive.List.Props;

/**
 * Scrollable container for SelectItems and SelectGroups.
 * Rendered automatically inside SelectContent.
 * Use directly only when building a fully custom popup layout.
 */
export function SelectList({ className, ...props }: SelectListProps) {
  return (
    <SelectPrimitive.List
      data-slot="select-list"
      className={cn('max-h-[280px] overflow-y-auto p-1', className)}
      {...props}
    />
  );
}

// ─── SelectContent ────────────────────────────────────────────────────────────

export type SelectContentProps = SelectPrimitive.Popup.Props & {
  /** Pixel gap between trigger and popup. @default 4 */
  sideOffset?: number;
  /** Which side the popup opens on. @default 'bottom' */
  side?: SelectPrimitive.Positioner.Props['side'];
  /** Popup alignment relative to trigger. @default 'start' */
  align?: SelectPrimitive.Positioner.Props['align'];
  /** Additional alignment offset in pixels. @default 0 */
  alignOffset?: number;
  /**
   * Whether the selected item aligns with the trigger text.
   * When true the popup overlaps the trigger to visually align item text.
   * @default false
   */
  alignItemWithTrigger?: boolean;
  /** Padding from viewport edges to avoid overflow. @default 8 */
  collisionPadding?: SelectPrimitive.Positioner.Props['collisionPadding'];
};

/**
 * The dropdown popup. Wraps Portal → Positioner → Popup → ScrollArrows + List.
 * Scroll arrows are included automatically and only appear for long lists.
 * Min-width matches the trigger via the `--anchor-width` CSS variable.
 *
 * @example
 * <SelectContent>
 *   <SelectItem value="standard">Standard</SelectItem>
 *   <SelectItem value="commander">Commander</SelectItem>
 * </SelectContent>
 */
export function SelectContent({
  className,
  sideOffset = 4,
  side = 'bottom',
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = false,
  collisionPadding = 8,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        sideOffset={sideOffset}
        side={side}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        collisionPadding={collisionPadding}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'z-dropdown min-w-[var(--anchor-width)]',
            'rounded-surface border border-border bg-surface shadow-popover',
            'outline-none',
            POPUP_ANIMATION,
            className
          )}
          {...props}
        >
          <SelectList>{children}</SelectList>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

// ─── SelectItem ───────────────────────────────────────────────────────────────

export type SelectItemProps = SelectPrimitive.Item.Props;

/**
 * A single option in the Select popup.
 * Displays a checkmark indicator when selected.
 *
 * @example
 * <SelectItem value="commander">Commander</SelectItem>
 * <SelectItem value="legacy" disabled>Legacy (unavailable)</SelectItem>
 */
export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        `relative flex ${CONTROL_HEIGHT.md} cursor-default select-none items-center gap-2`,
        'rounded-sm px-2.5 pr-8 text-sm text-text outline-none',
        'data-[highlighted]:bg-surface-raised',
        'data-[selected]:text-accent-text',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        className="absolute right-2.5 flex items-center justify-center"
      >
        <Check className="size-3 text-accent-text" aria-hidden={true} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

// ─── SelectGroup ──────────────────────────────────────────────────────────────

export type SelectGroupProps = SelectPrimitive.Group.Props;

/** Groups related SelectItems under a shared SelectGroupLabel. */
export function SelectGroup({ className, ...props }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

// ─── SelectGroupLabel ─────────────────────────────────────────────────────────

export type SelectGroupLabelProps = SelectPrimitive.GroupLabel.Props;

/** Eyebrow label for a SelectGroup — mono uppercase, not selectable. */
export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn(
        'px-2.5 py-1.5',
        'font-mono text-[10px] uppercase tracking-wide font-semibold text-text-faint',
        className
      )}
      {...props}
    />
  );
}

// ─── SelectSeparator ──────────────────────────────────────────────────────────

export type SelectSeparatorProps = React.ComponentProps<typeof Separator>;

/** Visual divider between groups or items in SelectContent. */
export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <Separator data-slot="select-separator" className={cn('my-1', className)} {...props} />;
}

// ─── SelectBackdrop ───────────────────────────────────────────────────────────

export type SelectBackdropProps = SelectPrimitive.Backdrop.Props;

/**
 * Overlay rendered behind the Select popup.
 * Not included by default — add explicitly when needed (e.g. mobile sheets).
 * Place inside a Portal sibling alongside the Positioner.
 */
export function SelectBackdrop({ className, ...props }: SelectBackdropProps) {
  return (
    <SelectPrimitive.Backdrop
      data-slot="select-backdrop"
      className={cn('fixed inset-0 bg-transparent', BACKDROP_ANIMATION, className)}
      {...props}
    />
  );
}

// ─── SelectArrow ──────────────────────────────────────────────────────────────

export type SelectArrowProps = SelectPrimitive.Arrow.Props;

/**
 * Decorative arrow pointing from popup to trigger.
 * Not included by default — opt in when the popup-to-trigger relationship needs
 * to be visually explicit (e.g. tooltip-style dropdowns).
 */
export function SelectArrow({ className, ...props }: SelectArrowProps) {
  return (
    <SelectPrimitive.Arrow
      data-slot="select-arrow"
      className={cn('fill-surface stroke-border', className)}
      {...props}
    />
  );
}
