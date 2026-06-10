import * as React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Optional trailing label. */
  label?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Controlled on/off toggle; track fills with accent when on. */
export function Switch(props: SwitchProps): React.JSX.Element;
