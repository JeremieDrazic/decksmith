import * as React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Controlled square checkbox; fills with accent when checked. */
export function Checkbox(props: CheckboxProps): React.JSX.Element;
