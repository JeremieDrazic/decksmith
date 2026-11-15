export type ShellNavigation = {
  /** Rail collapsed to its icons (a persisted preference). */
  folded: boolean;
  /** Rail hidden for distraction-free focus mode (in-memory, not persisted). */
  hidden: boolean;
};

export type ShellNavigationAction = 'toggleFold' | 'toggleFocus';

/**
 * Keeps the two rail states independent: entering and leaving focus mode never
 * loses the collapsed/expanded choice, and folding is a no-op while hidden
 * (there is no rail on screen to fold).
 */
export function shellNavigationReducer(
  state: ShellNavigation,
  action: ShellNavigationAction
): ShellNavigation {
  if (action === 'toggleFocus') return { ...state, hidden: !state.hidden };
  if (state.hidden) return state;
  return { ...state, folded: !state.folded };
}
