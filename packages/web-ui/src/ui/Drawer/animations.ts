// Drawer-specific animations — colocated in Drawer/animations.ts, not in
// lib/floating/animations.ts (which is reserved for cross-component shared anims).
//
// --drawer-swipe-progress, --drawer-snap-point-offset, --drawer-swipe-movement-*,
// and --drawer-swipe-strength are runtime measurements set by Base UI on the popup
// and backdrop elements. Using [property:var(--drawer-*)] is intentional — same
// exception as [height:var(--collapsible-panel-height)] and
// [height:var(--toast-frontmost-height)]. Timing/easing always use design tokens.

import type { DrawerSide } from './types';

/** Swipe-aware fade for the Drawer backdrop.
 *  Opacity tracks the swipe gesture live via --drawer-swipe-progress (0 → fully gone). */
export const DRAWER_BACKDROP_ANIMATION = [
  'transition-opacity duration-slow ease-out',
  // 0.5 is the resting backdrop opacity; scales to 0 as the swipe progresses.
  '[opacity:calc(0.5*(1-var(--drawer-swipe-progress,0)))]',
  // While dragging: instant — backdrop follows the finger 1:1 with no lag.
  'data-[swiping]:duration-0',
  'data-[starting-style]:opacity-0',
  'data-[ending-style]:opacity-0',
  // On release: transition duration scales with swipe velocity (--drawer-swipe-strength 0.1–1).
  'data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)*400ms)]',
] as const;

/** Shared timing/swiping classes for the panel — merged into each side entry. */
const PANEL_BASE = [
  'transition-transform duration-slow ease-out will-change-transform',
  // While dragging: no transition so the panel tracks the pointer exactly.
  'data-[swiping]:duration-0',
  // On release: snappier or slower transition depending on swipe velocity.
  'data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)*400ms)]',
] as const;

/**
 * Slide animation per edge.
 * The resting transform combines snap-point offset (distance from a non-full snap)
 * and the live swipe movement so the panel follows both gestures simultaneously.
 * data-[starting/ending-style] selectors appear after the resting transform in
 * source order → they take priority and fully exit/enter the panel on open/close.
 */
export const DRAWER_PANEL_ANIMATION: Record<DrawerSide, string[]> = {
  right: [
    ...PANEL_BASE,
    '[transform:translateX(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-x,0px)))]',
    'data-[starting-style]:[transform:translateX(100%)]',
    'data-[ending-style]:[transform:translateX(100%)]',
  ],
  left: [
    ...PANEL_BASE,
    '[transform:translateX(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-x,0px)))]',
    'data-[starting-style]:[transform:translateX(-100%)]',
    'data-[ending-style]:[transform:translateX(-100%)]',
  ],
  bottom: [
    ...PANEL_BASE,
    '[transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]',
    'data-[starting-style]:[transform:translateY(100%)]',
    'data-[ending-style]:[transform:translateY(100%)]',
  ],
  top: [
    ...PANEL_BASE,
    '[transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]',
    'data-[starting-style]:[transform:translateY(-100%)]',
    'data-[ending-style]:[transform:translateY(-100%)]',
  ],
};
