import { useEffect, useRef } from 'react';
import { tinykeys } from 'tinykeys';

export type KeyboardShortcutOptions = {
  /** Disable the shortcut without unmounting. Useful for context-dependent shortcuts. @default true */
  enabled?: boolean;
};

/**
 * Registers a keyboard shortcut on `window` and fires `callback` when it matches.
 *
 * Shortcut syntax follows tinykeys conventions:
 * - Modifier keys: `Control`, `Alt`, `Shift`, `Meta`
 * - Cross-platform: `$mod` resolves to `Meta` on Mac, `Control` elsewhere
 * - Multiple shortcuts for one action: pass an array
 *
 * The listener is torn down and re-attached only when `shortcut` or `enabled` changes,
 * not when `callback` changes — always pass the latest callback reference safely.
 *
 * @example
 * // Open search on Ctrl+K (Windows) or Cmd+K (Mac)
 * useKeyboardShortcut('$mod+k', () => openSearch());
 *
 * @example
 * // Dismiss on Escape
 * useKeyboardShortcut('Escape', onClose, { enabled: isOpen });
 */
export function useKeyboardShortcut(
  shortcut: string | string[],
  callback: (event: KeyboardEvent) => void,
  { enabled = true }: KeyboardShortcutOptions = {}
): void {
  // Ref keeps the latest callback without re-attaching the listener on every render.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Serialize array to a stable string so the dep array compares by value,
  // not by array reference identity.
  const shortcutKey = Array.isArray(shortcut) ? shortcut.join(',') : shortcut;

  useEffect(() => {
    if (!enabled) return;

    const shortcuts = shortcutKey.split(',').map((s) => s.trim());
    const keymap = Object.fromEntries(
      shortcuts.map((s) => [s, (e: KeyboardEvent) => callbackRef.current(e)])
    );

    // oxlint-disable-next-line unicorn/prefer-global-this -- tinykeys expects Window explicitly
    return tinykeys(window, keymap);
  }, [shortcutKey, enabled]);
}
