'use client';

import { useRender } from '@base-ui/react/use-render';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { surfaceVariants } from '../Surface/Surface';

// ─── Interactive classes ──────────────────────────────────────────────────────
// Shared between LinkCard and ButtonCard. Module-private — not exported.
// Rest  : shadow-card-rest = shadow-card + inset top highlight (lit edge).
// Hover : lift −3px, bg surface-hover, border accent, shadow-card + accent glow.
// Focus : same visual as hover + explicit ring.
// Active: instant snap back to baseline.
// shadow-card-rest / shadow-card-lift are @theme-registered Tailwind utilities — no var() in JSX.

const interactiveCardClasses = [
  'cursor-pointer outline-none',
  'shadow-card-rest',
  'transition-[translate,box-shadow,border-color] duration-normal ease-out',
  'hover:-translate-y-[3px]',
  'hover:border-accent-border',
  'hover:bg-surface-hover',
  'hover:shadow-card-lift',
  'focus-visible:-translate-y-[3px]',
  'focus-visible:border-accent-border',
  'focus-visible:bg-surface-hover',
  'focus-visible:shadow-card-lift',
  'focus-visible:ring-2 focus-visible:ring-border-focus',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  'active:translate-y-0 active:duration-instant',
  'disabled:pointer-events-none disabled:opacity-[0.38] disabled:cursor-not-allowed',
].join(' ');

// ─── Card ─────────────────────────────────────────────────────────────────────

export type CardProps = React.ComponentProps<'div'> & VariantProps<typeof surfaceVariants>;

/**
 * Static surface container. Applies background, border, radius, shadow, and
 * default padding — ready for any content without extra wrappers.
 *
 * Use `ButtonCard` when the whole surface is an action, `LinkCard` when it
 * navigates to another route.
 *
 * @example
 * <Card>
 *   <Heading level={3}>Gruul Aggro</Heading>
 *   <Text muted>47 cards · 2 missing</Text>
 * </Card>
 */
export function Card({ ref, className, variant, padding = 'md', ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      ref={ref}
      className={cn(surfaceVariants({ variant, padding }), 'shadow-card-rest', className)}
      {...props}
    />
  );
}

// ─── ButtonCard ───────────────────────────────────────────────────────────────

export type ButtonCardProps = React.ComponentProps<'button'> & VariantProps<typeof surfaceVariants>;

/**
 * Interactive card that triggers an action when clicked.
 * Renders a semantic `<button>` — use for actions (open modal, toggle, select).
 * For navigation, use `LinkCard` instead.
 *
 * Hover: lift (−3px) + surface-hover bg + accent-border + accent glow. Press: instant snap back.
 *
 * @example
 * <ButtonCard onClick={handleSelect} padding="sm">
 *   <span className="text-sm font-medium text-text">Commander</span>
 * </ButtonCard>
 */
export function ButtonCard({ ref, className, variant, padding = 'md', ...props }: ButtonCardProps) {
  return (
    <button
      data-slot="button-card"
      type="button"
      ref={ref}
      className={cn(surfaceVariants({ variant, padding }), interactiveCardClasses, className)}
      {...props}
    />
  );
}

// ─── LinkCard ─────────────────────────────────────────────────────────────────

export type LinkCardProps = useRender.ComponentProps<'a'> & VariantProps<typeof surfaceVariants>;

/**
 * Interactive card that navigates to a route.
 * Renders an `<a>` by default. For SPA client-side navigation, inject the
 * router's Link via the `render` prop — `web-ui` stays router-agnostic.
 *
 * Hover: lift (−3px) + surface-hover bg + accent-border + accent glow. Press: instant snap back.
 *
 * @example Native anchor
 * <LinkCard href="/decks/abc">Deck content</LinkCard>
 *
 * @example TanStack Router (apps/web) — prevents full page reload
 * <LinkCard render={<Link to="/decks/$id" params={{ id: deck.id }} />}>
 *   Deck content
 * </LinkCard>
 */
export function LinkCard({
  ref,
  className,
  variant,
  padding = 'md',
  render,
  ...rest
}: LinkCardProps) {
  return useRender({
    render,
    ref,
    defaultTagName: 'a',
    props: {
      'data-slot': 'link-card',
      className: cn(surfaceVariants({ variant, padding }), interactiveCardClasses, className),
      ...(rest as Record<string, unknown>),
    },
  });
}
