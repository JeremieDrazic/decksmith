import { describe, expect, it } from 'vitest';

import { shellNavigationReducer, type ShellNavigation } from './shell-navigation-reducer';

const VISIBLE: ShellNavigation = { folded: false, hidden: false };

describe('shellNavigationReducer', () => {
  it('toggles the fold while visible (happy path)', () => {
    expect(shellNavigationReducer(VISIBLE, 'toggleFold')).toEqual({ folded: true, hidden: false });
  });

  it('toggles focus (hidden) and preserves the fold', () => {
    const folded: ShellNavigation = { folded: true, hidden: false };
    expect(shellNavigationReducer(folded, 'toggleFocus')).toEqual({ folded: true, hidden: true });
  });

  it('entering then leaving focus keeps the collapsed/expanded choice', () => {
    const folded: ShellNavigation = { folded: true, hidden: false };
    const hidden = shellNavigationReducer(folded, 'toggleFocus');
    expect(shellNavigationReducer(hidden, 'toggleFocus')).toEqual({ folded: true, hidden: false });
  });

  it('does not fold while hidden — there is no rail to fold', () => {
    const hidden: ShellNavigation = { folded: false, hidden: true };
    expect(shellNavigationReducer(hidden, 'toggleFold')).toBe(hidden);
  });
});
