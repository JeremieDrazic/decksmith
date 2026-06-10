import * as React from 'react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "default" */
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: React.ReactNode;
  onClose?: () => void;
}

/** Notification card with a tone accent bar; stack in a fixed corner. */
export function Toast(props: ToastProps): React.JSX.Element;
