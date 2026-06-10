import * as React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  /** Options as strings or {value,label} objects. */
  options?: Array<string | SelectOption>;
  containerStyle?: React.CSSProperties;
}

/** Token-styled native select with label and chevron. */
export function Select(props: SelectProps): React.JSX.Element;
