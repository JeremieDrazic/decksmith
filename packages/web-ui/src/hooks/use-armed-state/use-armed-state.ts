import { useEffect, useRef, useState } from 'react';

/**
 * Manages the two-step "armed delete" interaction pattern.
 *
 * First call to `handleArmOrConfirm` arms the action (sets `armed=true`, starts a reset timer).
 * Second call within `timeout` fires `onDelete` and resets.
 * If the timer expires, the state resets to idle automatically.
 * The timer is cleared on unmount to prevent state updates on unmounted components.
 *
 * @param timeout - Milliseconds before the armed state auto-resets.
 * @param onDelete - Callback fired when the user confirms the second click.
 * @returns `armed` state flag and `handleArmOrConfirm` handler.
 */
export function useArmedState(timeout: number, onDelete: () => void) {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timerRef.current ?? undefined), []);

  function handleArmOrConfirm() {
    if (armed) {
      clearTimeout(timerRef.current ?? undefined);
      setArmed(false);
      onDelete();
    } else {
      setArmed(true);
      timerRef.current = setTimeout(() => setArmed(false), timeout);
    }
  }

  return { armed, handleArmOrConfirm };
}
