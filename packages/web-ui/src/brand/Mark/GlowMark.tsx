import { useId } from 'react';

import { usePrefersReducedMotion } from '../../hooks/use-prefers-reduced-motion';

import { BrilliantPaths } from './BrilliantPaths';

type MarkA11yProps = {
  'aria-hidden'?: true;
  role?: 'img';
  'aria-label'?: string;
};

type GlowMarkProps = MarkA11yProps & { size: number };

/**
 * Outer-ring glow mark — two-layer SVG approach.
 *
 * Layer 1: solid silhouette filtered via feGaussianBlur + feComposite "out" → outer halo only.
 * Layer 2: BrilliantPaths unfiltered on top → facets and transparent center preserved.
 *
 * Mark renders in text-accent — amber in dark mode, violet in light mode.
 * stdDeviation breathes 2.5 → 5 → 2.5 over 3.6s (ease-in-out via calcMode spline).
 * Respects prefers-reduced-motion: SMIL animate elements are omitted when set.
 *
 * @param size - SVG width/height in pixels
 */
export function GlowMark({ size, ...a11y }: GlowMarkProps) {
  const id = useId();
  const filterId = `glow-${id}`;
  const isMotionReduced = usePrefersReducedMotion();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className="text-accent shrink-0"
      style={{ overflow: 'visible' }}
      {...a11y}
    >
      <defs>
        <filter id={filterId} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.5} result="blurred">
            {isMotionReduced ? null : (
              <animate
                attributeName="stdDeviation"
                values="2.5;5;2.5"
                dur="3.6s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                keyTimes="0;0.5;1"
              />
            )}
          </feGaussianBlur>
          <feFlood result="flood" style={{ floodColor: 'var(--accent)', floodOpacity: 0.85 }} />
          <feComposite in="flood" in2="blurred" operator="in" result="coloredHalo" />
          <feComposite in="coloredHalo" in2="SourceAlpha" operator="out" />
        </filter>
      </defs>
      {/* Solid silhouette → filtered to outer-ring halo only */}
      <path d="M16 1.5 30.5 16 16 30.5 1.5 16Z" fill="currentColor" filter={`url(#${filterId})`} />
      {/* Brilliant-cut gem — unfiltered, no glow through facets or center hole */}
      <BrilliantPaths />
    </svg>
  );
}
