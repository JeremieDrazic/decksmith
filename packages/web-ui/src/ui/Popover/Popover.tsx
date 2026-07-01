import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { cn } from '../../lib/cn';
import { POPUP_ANIMATION } from '../../lib/floating/animations';

// ─── Popover ─────────────────────────────────────────────────────────────────

export type PopoverProps = PopoverPrimitive.Root.Props;

/**
 * Root state container for a single popover — pairs one Trigger with one Content.
 *
 * `modal` defaults to `true` so that Base UI's focus trapping activates automatically
 * when a `PopoverClose` is present (`focusManagerModal = modal !== false && hasClosePart`).
 * Without a close button `hasClosePart = 0` so the popup stays non-modal regardless.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger render={<Button />}>Open</PopoverTrigger>
 *   <PopoverContent>…</PopoverContent>
 * </Popover>
 */
export function Popover({ modal = true, ...props }: PopoverProps) {
  return <PopoverPrimitive.Root modal={modal} {...props} />;
}

// ─── PopoverTrigger ──────────────────────────────────────────────────────────

export type PopoverTriggerProps = PopoverPrimitive.Trigger.Props;

/**
 * The element that toggles the popover on click.
 * Pass `render={<Button />}` (or any element) to merge props without nesting.
 */
export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

// ─── PopoverContent ──────────────────────────────────────────────────────────

export type PopoverContentProps = PopoverPrimitive.Popup.Props & {
  /** Which side of the trigger the popover appears on. @default 'bottom' */
  side?: PopoverPrimitive.Positioner.Props['side'];
  /** Alignment relative to the trigger. @default 'center' */
  align?: PopoverPrimitive.Positioner.Props['align'];
  /** Gap in pixels between trigger and popover. @default 8 */
  sideOffset?: number;
  /** Whether to render the directional arrow. @default true */
  showArrow?: boolean;
};

/**
 * The floating popover panel. Renders via Portal to avoid stacking context issues.
 * Follows the page theme (unlike Tooltip which is always dark).
 *
 * @example
 * <PopoverContent side="bottom" align="start">
 *   <PopoverTitle>Settings</PopoverTitle>
 *   <PopoverDescription>Adjust your preferences.</PopoverDescription>
 * </PopoverContent>
 */
export function PopoverContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  showArrow = true,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner side={side} align={align} sideOffset={sideOffset}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'relative z-dropdown w-72',
            'rounded-surface border border-border bg-surface p-4',
            'text-sm text-text shadow-popover',
            POPUP_ANIMATION,
            className
          )}
          {...props}
        >
          {children}
          {showArrow && (
            <PopoverPrimitive.Arrow
              className={cn(
                // Base UI injects only cross-axis centering (left/top inline style).
                // We add: position:absolute + main-axis offset to seat the arrow at the popup edge.
                'absolute size-2.5 rotate-45 bg-surface border border-border',
                'data-[side=top]:bottom-[-6px]',
                'data-[side=bottom]:top-[-6px]',
                'data-[side=left]:right-[-6px]',
                'data-[side=right]:left-[-6px]',
                // Border hiding — 45° CW: T→NE, R→SE, B→SW, L→NW edges of diamond
                'data-[side=top]:border-t-0 data-[side=top]:border-l-0',
                'data-[side=bottom]:border-b-0 data-[side=bottom]:border-r-0',
                'data-[side=left]:border-l-0 data-[side=left]:border-b-0',
                'data-[side=right]:border-t-0 data-[side=right]:border-r-0'
              )}
            />
          )}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

// ─── PopoverClose ─────────────────────────────────────────────────────────────

export type PopoverCloseProps = PopoverPrimitive.Close.Props;

/**
 * A button that closes the popover when clicked.
 * Renders as a `<button>` by default. Pass `render` to use a custom element.
 */
export function PopoverClose(props: PopoverCloseProps) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

// ─── PopoverTitle ─────────────────────────────────────────────────────────────

export type PopoverTitleProps = PopoverPrimitive.Title.Props;

/**
 * Accessible title for the popover, referenced via `aria-labelledby` on the Popup.
 */
export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('mb-1 font-semibold leading-snug text-text', className)}
      {...props}
    />
  );
}

// ─── PopoverDescription ───────────────────────────────────────────────────────

export type PopoverDescriptionProps = PopoverPrimitive.Description.Props;

/**
 * Accessible description for the popover, referenced via `aria-describedby` on the Popup.
 */
export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('text-sm text-text-muted', className)}
      {...props}
    />
  );
}
