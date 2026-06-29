'use client';

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { ChevronDown } from 'lucide-react';

import { cn } from '../../lib/cn';
import { COLLAPSIBLE_ANIMATION } from '../../lib/floating/animations';

// ─── Collapsible ─────────────────────────────────────────────────────────────

export type CollapsibleProps = CollapsiblePrimitive.Root.Props;

/**
 * Toggles visibility of a panel. Uncontrolled by default — pass `open` +
 * `onOpenChange` to control from outside.
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>
 *     <span>Lands (24)</span>
 *     <ChevronDown aria-hidden />
 *   </CollapsibleTrigger>
 *   <CollapsiblePanel>…</CollapsiblePanel>
 * </Collapsible>
 */
export function Collapsible(props: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

// ─── CollapsibleTrigger ──────────────────────────────────────────────────────

export type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {
  /** Whether to render the built-in chevron indicator. @default true */
  showChevron?: boolean;
  /** Adds a subtle bottom border — visually separates the trigger from the panel content. */
  separator?: boolean;
  /**
   * Removes border-radius from the hover background.
   * Use when the trigger lives inside a bordered container (deck builder sections,
   * filter sidebar) — the hover rect extends edge-to-edge without floating corners.
   * Default (false) keeps `rounded-interactive` for standalone/free-floating use.
   */
  flush?: boolean;
};

/**
 * Button that toggles the panel. Renders a `ChevronDown` on the right by default.
 *
 * @example Standalone
 * <CollapsibleTrigger>Details</CollapsibleTrigger>
 *
 * @example Inside a bordered container (deck builder, sidebar)
 * <CollapsibleTrigger flush separator>
 *   <div className="flex items-center gap-2">
 *     <span>Creatures</span>
 *     <Badge size="sm">12</Badge>
 *   </div>
 * </CollapsibleTrigger>
 */
export function CollapsibleTrigger({
  className,
  showChevron = true,
  separator = false,
  flush = false,
  children,
  ...props
}: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'group',
        'flex w-full cursor-default items-center justify-between gap-2',
        'px-3 py-1.5',
        !flush && 'rounded-interactive',
        !flush && separator && 'rounded-b-none',
        'text-sm font-medium text-text',
        'outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        'hover:bg-surface-hover transition-colors duration-fast',
        separator && 'border-b border-border-subtle',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38]',
        className
      )}
      {...props}
    >
      {children}
      {showChevron ? (
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-text-muted transition-transform duration-normal group-data-[panel-open]:rotate-180"
        />
      ) : null}
    </CollapsiblePrimitive.Trigger>
  );
}

// ─── CollapsiblePanel ────────────────────────────────────────────────────────

export type CollapsiblePanelProps = CollapsiblePrimitive.Panel.Props;

/**
 * The animated content area. Height animates from 0 to its natural height on
 * open, and back to 0 on close.
 *
 * Pass `keepMounted` to keep the DOM node alive when closed — useful when the
 * panel contains a form or state that should survive toggling.
 */
export function CollapsiblePanel({ className, ...props }: CollapsiblePanelProps) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-panel"
      className={cn('px-3', COLLAPSIBLE_ANIMATION, className)}
      {...props}
    />
  );
}
