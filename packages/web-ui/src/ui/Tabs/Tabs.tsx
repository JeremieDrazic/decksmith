import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

// ─── Tabs ────────────────────────────────────────────────────────────────────

export type TabsProps = TabsPrimitive.Root.Props;

/**
 * Root state container. Uncontrolled by default — pass `value` + `onValueChange`
 * to control from outside (e.g. sync with URL search params).
 *
 * @example
 * <Tabs defaultValue="cards">
 *   <TabsList>
 *     <Tab value="cards">Cards</Tab>
 *     <Tab value="stats">Stats</Tab>
 *   </TabsList>
 *   <TabsIndicator />
 *   <TabsPanel value="cards">…</TabsPanel>
 *   <TabsPanel value="stats">…</TabsPanel>
 * </Tabs>
 */
export function Tabs(props: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

// ─── TabsList ────────────────────────────────────────────────────────────────

export type TabsListProps = TabsPrimitive.List.Props & {
  /**
   * When true, tabs activate automatically as the user navigates with arrow keys.
   * When false (default), arrow keys move focus without activating — the user
   * must press Enter or Space to trigger the tab change.
   *
   * Keep false when tab panels fetch data on activation — prevents a fetch on
   * every arrow key press.
   *
   * @default false
   */
  activateOnFocus?: boolean;
};

/**
 * Container for the tab buttons and the sliding indicator.
 * Place `<TabsIndicator />` as the last child.
 */
export function TabsList({ className, activateOnFocus = false, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      activateOnFocus={activateOnFocus}
      className={cn(
        'relative flex flex-row items-center',
        'border-b border-border',
        'gap-1',
        className
      )}
      {...props}
    />
  );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

const tabVariants = cva(
  [
    'relative cursor-default select-none whitespace-nowrap font-medium',
    'text-text-muted transition-colors duration-fast',
    'hover:text-text',
    'data-[active]:text-text',
    'outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:rounded-t-interactive',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'px-2.5 pb-2 pt-1.5 text-xs',
        md: 'px-3 pb-2.5 pt-2 text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

export type TabProps = TabsPrimitive.Tab.Props & VariantProps<typeof tabVariants>;

/**
 * Individual tab button. The `value` prop links it to its `TabsPanel`.
 *
 * @example
 * <Tab value="cards">Cards</Tab>
 * <Tab value="stats" disabled>Stats</Tab>
 */
export function Tab({ className, size, ...props }: TabProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tab"
      className={cn(tabVariants({ size }), className)}
      {...props}
    />
  );
}

// ─── TabsIndicator ───────────────────────────────────────────────────────────

export type TabsIndicatorProps = TabsPrimitive.Indicator.Props;

/**
 * Animated accent line that slides between active tabs.
 * Place inside `<TabsList>` as the last child.
 * Uses Base UI's runtime CSS vars `--active-tab-left` / `--active-tab-width`
 * for position — these are layout measurements, not design tokens.
 *
 * @example
 * <TabsList>
 *   <Tab value="a">A</Tab>
 *   <Tab value="b">B</Tab>
 *   <TabsIndicator />
 * </TabsList>
 */
export function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        'absolute bottom-0 h-0.5 rounded-full bg-accent',
        'left-[var(--active-tab-left)] w-[var(--active-tab-width)]',
        'transition-[left,width] duration-normal ease-out',
        className
      )}
      {...props}
    />
  );
}

// ─── TabsPanel ───────────────────────────────────────────────────────────────

export type TabsPanelProps = TabsPrimitive.Panel.Props;

/**
 * Content area for a tab. Hidden when its tab is not active.
 * Pass `keepMounted` to keep the DOM node alive when inactive — avoids
 * remounting cost when switching back, but increases initial render weight.
 *
 * @example
 * <TabsPanel value="cards">
 *   <CardGrid />
 * </TabsPanel>
 */
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn(
        'pt-4 outline-none',
        'focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:rounded-interactive',
        className
      )}
      {...props}
    />
  );
}
