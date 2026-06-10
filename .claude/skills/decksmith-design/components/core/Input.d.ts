import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Error message — also swaps the field to the error style. */
  error?: string;
  /** Helper text shown below when there is no error. */
  helper?: string;
  iconLeft?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

/** Text field with optional label, helper/error text, and leading icon. */
export function Input(props: InputProps): React.JSX.Element;
