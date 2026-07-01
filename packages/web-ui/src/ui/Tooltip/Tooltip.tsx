import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { cn } from '../../lib/cn';
import { POPUP_ANIMATION } from '../../lib/floating/animations';

// ─── TooltipProvider ─────────────────────────────────────────────────────────

export type TooltipProviderProps = TooltipPrimitive.Provider.Props;

/**
 * Wraps a section of the tree to share tooltip delay/close config.
 * Place once near the root — one provider covers all Tooltip instances below it.
 *
 * @example
 * <TooltipProvider>
 *   <App />
 * </TooltipProvider>
 */
export function TooltipProvider({ delay = 200, closeDelay = 0, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delay={delay} closeDelay={closeDelay} {...props} />;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export type TooltipProps = TooltipPrimitive.Root.Props;

/**
 * Root state container for a single tooltip — pairs one Trigger with one Content.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Save changes</TooltipContent>
 * </Tooltip>
 */
export function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />;
}

// ─── TooltipTrigger ──────────────────────────────────────────────────────────

export type TooltipTriggerProps = TooltipPrimitive.Trigger.Props;

/**
 * The element that triggers the tooltip on hover/focus.
 * Renders as a <button> by default. Pass `render={<span />}` (or any element)
 * to avoid nesting interactive elements — e.g. when wrapping an existing Button.
 *
 * @example
 * <TooltipTrigger render={<span />}>
 *   <Button>Save</Button>
 * </TooltipTrigger>
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

// ─── TooltipContent ──────────────────────────────────────────────────────────

export type TooltipContentProps = TooltipPrimitive.Popup.Props & {
  /** Which side of the trigger the tooltip appears on. @default 'top' */
  side?: TooltipPrimitive.Positioner.Props['side'];
  /** Alignment relative to the trigger. @default 'center' */
  align?: TooltipPrimitive.Positioner.Props['align'];
  /** Gap in pixels between trigger and tooltip. @default 8 */
  sideOffset?: number;
  /** Whether to render the directional arrow. @default true */
  showArrow?: boolean;
};

/**
 * The floating tooltip panel. Renders via Portal to avoid stacking context issues.
 *
 * @example
 * <TooltipContent side="bottom" showArrow={false}>
 *   Keyboard shortcut: ⌘S
 * </TooltipContent>
 */
export function TooltipContent({
  className,
  side = 'top',
  align = 'center',
  sideOffset = 10,
  showArrow = true,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} align={align} sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            // 'dark' forces dark-mode CSS variables regardless of html theme —
            // tooltip always uses its dark palette (bg-surface = #1a1827, text = #f0eef8).
            'dark relative z-tooltip max-w-[280px]',
            'rounded-interactive border border-border bg-surface px-3 py-1.5',
            'text-xs text-text shadow-popover',
            POPUP_ANIMATION,
            className
          )}
          {...props}
        >
          {children}
          {showArrow && (
            <TooltipPrimitive.Arrow
              className={cn(
                // Base UI injects only cross-axis centering (left/top inline style).
                // We add: position:absolute + main-axis offset to seat the arrow at the popup edge.
                'absolute size-2.5 rotate-45 bg-surface border border-border',
                'data-[side=top]:bottom-[-6px]',
                'data-[side=bottom]:top-[-6px]',
                'data-[side=left]:right-[-6px]',
                'data-[side=right]:left-[-6px]',
                // Border hiding — 45° CW: T→NE, R→SE, B→SW, L→NW edges of diamond
                // side=top  (▼): visible SE+SW → hide NE+NW → border-t-0 border-l-0
                'data-[side=top]:border-t-0 data-[side=top]:border-l-0',
                // side=bottom (▲): visible NE+NW → hide SE+SW → border-b-0 border-r-0
                'data-[side=bottom]:border-b-0 data-[side=bottom]:border-r-0',
                // side=left  (▶): visible NE+SE → hide NW+SW → border-l-0 border-b-0
                'data-[side=left]:border-l-0 data-[side=left]:border-b-0',
                // side=right (◀): visible NW+SW → hide NE+SE → border-t-0 border-r-0
                'data-[side=right]:border-t-0 data-[side=right]:border-r-0'
              )}
            />
          )}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
