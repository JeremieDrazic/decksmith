import { Trash, Trash2 } from 'lucide-react';

import { useArmedState } from '../../hooks/use-armed-state/use-armed-state';
import { cn } from '../../lib/cn';
import { Button } from '../Button/Button';
import type { ButtonProps } from '../Button/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeleteButtonProps = Omit<ButtonProps, 'variant' | 'onClick' | 'startIcon'> & {
  /** Callback fired when the user confirms by clicking twice. */
  onDelete: () => void;
  /** Label shown after the first click. @default "Confirm deletion" */
  confirmLabel?: string;
  /** Milliseconds before the armed state auto-resets to idle. @default 3000 */
  timeout?: number;
};

// ─── DeleteButton ─────────────────────────────────────────────────────────────

/**
 * Two-step "armed delete" button — prevents accidental deletions without a modal.
 *
 * First click arms the button (label + icon change, a reset timer starts).
 * Second click within `timeout` fires `onDelete`.
 * Waiting resets automatically.
 *
 * Use for low-to-medium consequence deletions (removing a tag, a card from a deck list).
 * For high-stakes irreversible operations prefer `AlertDialog` — it communicates
 * the full consequences more explicitly.
 *
 * @example
 * <DeleteButton onDelete={() => removeCard(id)}>Delete card</DeleteButton>
 */
export function DeleteButton({
  onDelete,
  confirmLabel = 'Confirm deletion',
  timeout = 3000,
  children,
  className,
  ...rest
}: DeleteButtonProps) {
  const { armed, handleArmOrConfirm } = useArmedState(timeout, onDelete);

  return (
    <Button
      variant="destructive"
      data-state={armed ? 'arming' : 'idle'}
      // Announce the armed state to screen readers: the accessible name switches to the
      // confirm label so the state change isn't purely visual (WCAG 4.1.2 / 4.1.3).
      aria-label={armed ? confirmLabel : undefined}
      startIcon={armed ? <Trash aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
      onClick={handleArmOrConfirm}
      className={cn(
        'data-[state=arming]:bg-error data-[state=arming]:text-on-error data-[state=arming]:border-error',
        className
      )}
      {...rest}
    >
      {armed ? confirmLabel : children}
    </Button>
  );
}
