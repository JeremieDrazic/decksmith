import * as React from 'react';

export interface DialogProps {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  /** Footer actions (e.g. Buttons), right-aligned on a raised bar. */
  footer?: React.ReactNode;
  width?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Centered modal with blurred backdrop; spring-scales in. Esc / backdrop close. */
export function Dialog(props: DialogProps): React.JSX.Element | null;
