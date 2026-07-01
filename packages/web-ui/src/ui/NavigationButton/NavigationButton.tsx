import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { IconButton, type IconButtonProps } from '../IconButton/IconButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip/Tooltip';

// ─── NavigationButton ─────────────────────────────────────────────────────────

/** Each nav variant maps to a canonical icon + a screen-reader label used when
 *  no explicit `aria-label` is provided. */
const VARIANT_MAP = {
  close: { icon: <X aria-hidden={true} />, defaultLabel: 'Close' },
  back: { icon: <ChevronLeft aria-hidden={true} />, defaultLabel: 'Back' },
  forward: { icon: <ChevronRight aria-hidden={true} />, defaultLabel: 'Forward' },
} as const;

export type NavigationButtonVariant = keyof typeof VARIANT_MAP;

// `variant` is omitted from IconButtonProps because it collides with
// NavigationButtonVariant — both would be named `variant` but carry different
// string unions, yielding `never` in the intersection and breaking rest
// destructuring (TS2700). The visual style is re-exposed as `buttonVariant`.
export type NavigationButtonProps = Omit<IconButtonProps, 'icon' | 'aria-label' | 'variant'> & {
  /** Navigation semantic: determines the icon and default accessible label. */
  variant: NavigationButtonVariant;
  /**
   * Visual style of the underlying IconButton.
   * @default 'ghost'
   */
  buttonVariant?: IconButtonProps['variant'];
  /**
   * Accessible label for the button — also used as the tooltip text.
   * Defaults: close → "Close", back → "Back", forward → "Forward".
   */
  'aria-label'?: string;
};

/**
 * Presentational navigation button — a thin wrapper around IconButton that maps
 * a semantic variant (`close` / `back` / `forward`) to the correct Lucide icon,
 * an accessible default label, and a built-in Tooltip.
 *
 * Intentionally behaviour-free: closing/navigating is handled by the overlay
 * primitive. Compose with `render` to wire the behaviour:
 *
 * @example
 * // Closes a Popover
 * <PopoverClose render={<NavigationButton variant="close" />} />
 *
 * @example
 * // Closes a Dialog with a custom label
 * <Dialog.Close render={<NavigationButton variant="close" aria-label="Dismiss" />} />
 *
 * @example
 * // Standalone back button in a multi-step flow
 * <NavigationButton variant="back" onClick={goToPreviousStep} />
 */
export function NavigationButton({
  variant,
  buttonVariant = 'ghost',
  'aria-label': ariaLabel,
  ...props
}: NavigationButtonProps) {
  const { icon, defaultLabel } = VARIANT_MAP[variant];
  const label = ariaLabel ?? defaultLabel;

  return (
    <Tooltip>
      <TooltipTrigger
        render={<IconButton variant={buttonVariant} icon={icon} aria-label={label} {...props} />}
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
