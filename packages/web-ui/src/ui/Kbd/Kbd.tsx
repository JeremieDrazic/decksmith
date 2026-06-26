import type { ComponentProps } from 'react';

import { ArrowBigUp, Command, CornerDownLeft, Delete, Option } from 'lucide-react';

import { cn } from '../../lib/cn';

// ─── Kbd ─────────────────────────────────────────────────────────────────────

export type KbdProps = ComponentProps<'kbd'>;

/**
 * A single keyboard key chip. Semantically a `<kbd>` element so screen readers
 * announce it as a keyboard input.
 *
 * For modifier keys, use the pre-built helpers (`KbdCmd`, `KbdShift`, etc.)
 * which encapsulate the correct icon — pass `aria-label` with a translated string.
 *
 * @example
 * <Kbd>Esc</Kbd>
 * <Kbd>K</Kbd>
 */
export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex w-fit h-5 min-w-5 select-none items-center justify-center gap-1',
        'rounded-stamp border border-border bg-surface-raised px-1',
        'font-mono text-xs font-medium text-text-muted',
        className
      )}
      {...props}
    />
  );
}

// ─── KbdGroup ─────────────────────────────────────────────────────────────────

export type KbdGroupProps = ComponentProps<'kbd'>;

/**
 * A compound keyboard shortcut — wraps multiple `<Kbd>` keys into one chord.
 * Renders as `<kbd>` so the whole group is semantically one keyboard input.
 *
 * @example
 * <KbdGroup>
 *   <KbdCmd aria-label={t('keys.command')} />
 *   <Kbd>K</Kbd>
 * </KbdGroup>
 */
export function KbdGroup({ className, ...props }: KbdGroupProps) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
}

// ─── Icon key helpers ─────────────────────────────────────────────────────────
//
// Each helper encapsulates the correct Lucide icon + sizing. The caller MUST
// supply `aria-label` with a translated string — this package has no i18n layer.
//
// Pattern:
//   <KbdCmd aria-label={t('keys.command')} />
//   <KbdCmd aria-label="Command" />  // English fallback

/** Props for icon-based key helpers — `aria-label` is required. */
export type KbdIconProps = Omit<KbdProps, 'children' | 'aria-label'> & {
  /** Translated accessible name for the key (e.g. `t('keys.command')`). */
  'aria-label': string;
};

/** ⌘ Command key. */
export function KbdCmd({ 'aria-label': ariaLabel, ...props }: KbdIconProps) {
  return (
    <Kbd {...props}>
      <span className="sr-only">{ariaLabel}</span>
      <Command className="size-3" aria-hidden={true} />
    </Kbd>
  );
}

/** ⌥ Option / Alt key. */
export function KbdOpt({ 'aria-label': ariaLabel, ...props }: KbdIconProps) {
  return (
    <Kbd {...props}>
      <span className="sr-only">{ariaLabel}</span>
      <Option className="size-3" aria-hidden={true} />
    </Kbd>
  );
}

/** ⇧ Shift key. */
export function KbdShift({ 'aria-label': ariaLabel, ...props }: KbdIconProps) {
  return (
    <Kbd {...props}>
      <span className="sr-only">{ariaLabel}</span>
      <ArrowBigUp className="size-3" aria-hidden={true} />
    </Kbd>
  );
}

/** ⌫ Delete / Backspace key. */
export function KbdDel({ 'aria-label': ariaLabel, ...props }: KbdIconProps) {
  return (
    <Kbd {...props}>
      <span className="sr-only">{ariaLabel}</span>
      <Delete className="size-3" aria-hidden={true} />
    </Kbd>
  );
}

/** ↵ Enter / Return key. */
export function KbdEnter({ 'aria-label': ariaLabel, ...props }: KbdIconProps) {
  return (
    <Kbd {...props}>
      <span className="sr-only">{ariaLabel}</span>
      <CornerDownLeft className="size-3" aria-hidden={true} />
    </Kbd>
  );
}
