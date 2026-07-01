import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { Bell, CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner';
import { toneOf } from './tone-of';
import type { ToneKey } from './tone-of';
import { TONE_STYLES } from './tone-styles';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 5000;

// Toast-specific enter/exit animation — not shared with other floating components,
// so it lives here rather than in animations.ts.
const TOAST_ANIMATION = [
  'transition-[opacity,transform] ease-spring duration-slow',
  'data-[ending-style]:ease-out data-[ending-style]:duration-normal',
  'data-[starting-style]:opacity-0 data-[starting-style]:[transform:translateY(12px)_scale(0.96)]',
  'data-[ending-style]:opacity-0 data-[ending-style]:[transform:translateY(-6px)_scale(0.97)]',
] as const;

const TONE_ICONS: Record<ToneKey, React.ElementType | null> = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
  loading: null, // Spinner handled separately
  default: Bell,
};

// ─── ToastProvider ────────────────────────────────────────────────────────────

export type ToastProviderProps = ToastPrimitive.Provider.Props;

/**
 * Provides toast state. Place once near the app root, above `<Toaster>`.
 *
 * @example
 * <ToastProvider>
 *   <App />
 *   <Toaster />
 * </ToastProvider>
 */
export function ToastProvider({
  timeout = DEFAULT_TIMEOUT,
  limit = 3,
  ...props
}: ToastProviderProps) {
  return <ToastPrimitive.Provider timeout={timeout} limit={limit} {...props} />;
}

export type ToasterPosition = 'bottom-right' | 'top-center';

// ─── ToastItem (internal) ─────────────────────────────────────────────────────

type ToastItemProps = {
  toast: ToastPrimitive.Root.ToastObject;
  position: ToasterPosition;
};

function ToastItem({ toast, position }: ToastItemProps) {
  const tone = toneOf(toast.type);
  const styles = TONE_STYLES[tone];
  const Icon = TONE_ICONS[tone];
  const isLoading = tone === 'loading';
  const hasTimer = !isLoading && (toast.timeout ?? DEFAULT_TIMEOUT) > 0;
  const timeout = toast.timeout ?? DEFAULT_TIMEOUT;

  return (
    <ToastPrimitive.Root
      toast={toast}
      data-slot="toast"
      // Stacking — all Roots anchor at the bottom (or top) edge of the Viewport.
      // Base UI sets --toast-index (unitless), --toast-offset-y (with "px"), --toast-height (with "px").
      //
      // Collapsed (no data-expanded):
      //   Index 0 = front toast, no offset. Older toasts peek via −12px × index + scale.
      //   pt-2.5 creates a visual gap that is included in offsetHeight → folded into
      //   --toast-offset-y, so expanded toasts spread cleanly with no DOM hole (no flicker).
      //
      // Expanded (data-expanded = hovering || focused):
      //   --toast-offset-y already carries "px" → multiply by -1, NOT by -1px (px×px = invalid).
      className={cn(
        'group',
        'absolute inset-x-0 bottom-0 w-full',
        // Visual gap above the card — folded into offsetHeight → clean expand without gap jumps.
        'pt-2.5',
        // Collapsed: push back and compress. --toast-index is unitless → calc is valid.
        '[transform:translateY(calc(var(--toast-index)*-12px))_scale(calc(1-var(--toast-index)*0.05))]',
        '[z-index:calc(1000-var(--toast-index))]',
        // Hide toasts past the limit (Base UI sets inert + data-limited on overflow toasts).
        'data-[limited]:opacity-0',
        // Expanded: restore natural offset. --toast-offset-y is "Npx" → *-1 not *-1px.
        'data-[expanded]:[transform:translateY(calc(var(--toast-offset-y)*-1))]',
        // Flip Y for top-center — gap goes below the card, expansion goes downward.
        position === 'top-center' && [
          'top-0 bottom-auto pt-0 pb-2.5',
          '[transform:translateY(calc(var(--toast-index)*12px))_scale(calc(1-var(--toast-index)*0.05))]',
          'data-[expanded]:[transform:translateY(var(--toast-offset-y))]',
        ],
        TOAST_ANIMATION
      )}
    >
      {/* ── Card ── */}
      <div
        className={cn(
          'relative flex items-center gap-3 overflow-hidden',
          'rounded-surface border bg-surface-raised',
          'shadow-overlay',
          'pl-5 pr-3 py-3',
          // Tone-tinted border
          styles.border
        )}
      >
        {/* Left accent bar */}
        <span
          aria-hidden
          className={cn('absolute left-0 top-0 bottom-0 w-[5px] rounded-l-surface', styles.bar)}
        />

        {/* Icon badge */}
        <span
          aria-hidden
          className={cn(
            'flex size-[26px] shrink-0 items-center justify-center rounded-badge',
            styles.iconBg
          )}
        >
          {isLoading ? (
            <Spinner className={cn('size-3.5', styles.icon)} />
          ) : Icon ? (
            <Icon className={cn('size-3.5', styles.icon)} strokeWidth={2.5} aria-hidden />
          ) : null}
        </span>

        {/* Body */}
        <ToastPrimitive.Content data-slot="toast-content" className="min-w-0 flex-1">
          <ToastPrimitive.Title
            data-slot="toast-title"
            className="text-sm/[1.35] font-semibold text-text"
          />
          <ToastPrimitive.Description
            data-slot="toast-description"
            className="mt-0.5 text-xs/[1.5] text-text-muted empty:hidden"
          />
          {/* Action button — rendered via actionProps from the toast object */}
          {toast.actionProps ? (
            <ToastPrimitive.Action
              data-slot="toast-action"
              className={cn(
                'mt-2 text-xs font-medium underline underline-offset-2 decoration-1',
                'transition-opacity duration-fast hover:opacity-70',
                styles.action
              )}
              {...toast.actionProps}
            />
          ) : null}
        </ToastPrimitive.Content>

        {/* Close button */}
        <ToastPrimitive.Close
          data-slot="toast-close"
          aria-label="Dismiss"
          className={cn(
            'self-start mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-interactive',
            'text-text-faint transition-colors duration-fast',
            'hover:bg-surface-hover hover:text-text',
            'outline-none focus-visible:ring-2 focus-visible:ring-border-focus'
          )}
        >
          <X className="size-3.5" aria-hidden />
        </ToastPrimitive.Close>

        {/* Progress bar — drains over the toast timeout, pauses when expanded */}
        {hasTimer ? (
          <span
            aria-hidden
            className={cn(
              'absolute bottom-0 left-0 right-0 h-[2px] origin-left',
              'animate-progress-x',
              // Pause bar when hovering/focused (data-expanded = hovering || focused)
              'group-data-[expanded]:[animation-play-state:paused]',
              styles.bar,
              'opacity-40'
            )}
            style={{ animationDuration: `${timeout}ms` }}
          />
        ) : null}
      </div>
    </ToastPrimitive.Root>
  );
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

export type ToasterProps = {
  /** Where toasts appear on screen. @default 'bottom-right' */
  position?: ToasterPosition;
};

/**
 * Renders the live toast stack. Place once near the app root.
 * Must be inside `<ToastProvider>`.
 *
 * @example
 * <ToastProvider>
 *   <App />
 *   <Toaster />
 * </ToastProvider>
 */
export function Toaster({ position = 'bottom-right' }: ToasterProps) {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className={cn(
          'fixed z-toast w-[340px]',
          // Height = frontmost toast only. Stacked/expanded toasts overflow visually
          // but remain DOM descendants → mouse events still reach them, no flicker.
          '[height:var(--toast-frontmost-height)]',
          position === 'bottom-right' && 'bottom-6 right-6',
          position === 'top-center' && 'top-6 left-1/2 -translate-x-1/2'
        )}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} position={position} />
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

// ─── Re-exports (imperative API) ──────────────────────────────────────────────

/**
 * Hook to imperatively add, update, and close toasts.
 * Must be used inside `<ToastProvider>`.
 *
 * @example
 * const { add } = useToast();
 * add({ title: 'Card added', type: 'success', timeout: 4000 });
 */
export const useToast = ToastPrimitive.useToastManager;

/**
 * Creates a toast manager for use outside React (e.g. in API response handlers).
 * Pass the returned manager to `<ToastProvider toastManager={...}>`.
 */
export const createToastManager = ToastPrimitive.createToastManager;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastObject = ToastPrimitive.Root.ToastObject;

// Re-export Base UI prop types for consumers that wrap sub-parts
export type { ToastProviderProps as ToastPrimitiveProviderProps };
