export const TONE_STYLES = {
  success: {
    bar: 'bg-success',
    iconBg: 'bg-success-subtle',
    icon: 'text-success',
    border: 'border-success/30',
    action: 'text-success-text',
  },
  error: {
    bar: 'bg-error',
    iconBg: 'bg-error-subtle',
    icon: 'text-error',
    border: 'border-error/30',
    action: 'text-error-text',
  },
  warning: {
    bar: 'bg-warning',
    iconBg: 'bg-warning-subtle',
    icon: 'text-warning',
    border: 'border-warning/30',
    action: 'text-warning-text',
  },
  info: {
    bar: 'bg-info',
    iconBg: 'bg-info-subtle',
    icon: 'text-info',
    border: 'border-info/30',
    action: 'text-info-text',
  },
  loading: {
    bar: 'bg-text-muted',
    iconBg: 'bg-surface-hover',
    icon: 'text-text-muted',
    border: 'border-border',
    action: 'text-accent-text',
  },
  default: {
    bar: 'bg-accent',
    iconBg: 'bg-accent-subtle',
    icon: 'text-accent',
    border: 'border-accent/30',
    action: 'text-accent-text',
  },
} as const;
