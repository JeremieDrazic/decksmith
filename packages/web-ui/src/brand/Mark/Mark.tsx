import { GlowMark } from './GlowMark';
import { TiltMark } from './TiltMark';
import { BrilliantPaths } from './BrilliantPaths';

/** Pixel dimensions per size — aligned with Logo. */
const MARK_PX = { sm: 18, md: 24, lg: 36 } as const;

export type MarkProps = {
  size?: 'sm' | 'md' | 'lg';
  /**
   * Animation mode.
   * - `none`  — static mark (default)
   * - `glow`  — outer-ring halo pulse
   * - `tilt`  — pointer-tracked parallax + glow + specular glare
   */
  animate?: 'none' | 'glow' | 'tilt';
  /**
   * Accessible label — required when the mark is used standalone (sidebar, favicon).
   * When omitted the mark is hidden from assistive technology (use inside Logo lockup).
   */
  'aria-label'?: string;
};

/**
 * Decksmith diamond mark — standalone component.
 *
 * Use this when you need just the diamond (collapsed sidebar, loading indicator, favicon).
 * For the full brand lockup (mark + wordmark), use <Logo> instead.
 *
 * Mark always renders in var(--accent) — amber in dark mode, violet in light mode.
 *
 * @example
 * // Collapsed sidebar
 * <Mark size="sm" aria-label="Decksmith" />
 *
 * @example
 * // Hero with tilt effect
 * <Mark size="lg" animate="tilt" aria-label="Decksmith" />
 */
export function Mark({ size = 'md', animate = 'none', 'aria-label': ariaLabel }: MarkProps) {
  const px = MARK_PX[size];
  const a11y = ariaLabel
    ? ({ role: 'img' as const, 'aria-label': ariaLabel } as const)
    : ({ 'aria-hidden': true as const } as const);

  if (animate === 'glow') return <GlowMark size={px} {...a11y} />;
  if (animate === 'tilt') return <TiltMark size={px} {...a11y} />;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      className="text-accent shrink-0"
      {...a11y}
    >
      <BrilliantPaths />
    </svg>
  );
}
