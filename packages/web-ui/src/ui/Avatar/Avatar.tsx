'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

const avatarVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
    'rounded-full bg-surface-raised',
    'font-mono font-semibold uppercase tracking-wide text-text-muted',
  ],
  {
    variants: {
      size: {
        sm: 'size-6 text-[10px]',
        md: 'size-8 text-xs',
        lg: 'size-10 text-sm',
        xl: 'size-14 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type AvatarProps = AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>;

/**
 * Container for a user avatar — displays a profile image with an initials fallback.
 *
 * @example
 * <Avatar size="md">
 *   <AvatarImage src={user.avatarUrl} alt={user.displayName} />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 */
export function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

// ─── AvatarImage ─────────────────────────────────────────────────────────────

export type AvatarImageProps = AvatarPrimitive.Image.Props;

/**
 * Profile image inside an Avatar. Hidden while loading or on error — AvatarFallback takes over.
 */
export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('size-full object-cover', className)}
      {...props}
    />
  );
}

// ─── AvatarFallback ──────────────────────────────────────────────────────────

export type AvatarFallbackProps = AvatarPrimitive.Fallback.Props;

/**
 * Content shown when the image is unavailable or still loading.
 * Typically initials: "JD" for "Jérémie Drazic".
 * delay defaults to 0 — no flash when no image src is provided.
 */
export function AvatarFallback({ className, delay = 0, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      delay={delay}
      className={cn('flex size-full select-none items-center justify-center', className)}
      {...props}
    />
  );
}
