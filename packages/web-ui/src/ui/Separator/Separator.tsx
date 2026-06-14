import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';

import { cn } from '../../lib/cn';

export type SeparatorProps = SeparatorPrimitive.Props & {
  /**
   * neutral — 1px line, functional (dropdowns, table rows, inline layout)
   * brand   — ornamental ◈ with fading gradient lines, between content sections
   */
  variant?: 'neutral' | 'brand';
  /**
   * Adds flanking dashes to the brand diamond: ─◈─
   * Only applies when variant="brand".
   */
  elaborate?: boolean;
};

/**
 * Separates content visually. Two variants:
 * - neutral: 1px line for functional separation
 * - brand: ornamental diamond divider for section breaks (use `elaborate` for ─◈─ form)
 *
 * @example
 * <Separator />
 * <Separator orientation="vertical" className="h-6" />
 * <Separator variant="brand" />
 * <Separator variant="brand" elaborate />
 */
export function Separator({
  className,
  orientation = 'horizontal',
  variant = 'neutral',
  elaborate = false,
  ...props
}: SeparatorProps) {
  if (variant === 'brand') {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        data-slot="separator"
        data-variant="brand"
        className={cn('flex w-full items-center gap-3.5 text-brand', className)}
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span aria-hidden="true" className="select-none text-base leading-none">
          {elaborate ? '─◈─' : '◈'}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    );
  }

  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'vertical' ? 'w-px self-stretch' : 'h-px w-full',
        className
      )}
      {...props}
    />
  );
}
