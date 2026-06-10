import React from 'react';

/**
 * Checkbox — controlled square check. Fills with accent when checked.
 * Pass `checked` + `onChange(next)`; optional inline `label`.
 */
export function Checkbox({ checked = false, onChange, disabled = false, label, style, ...rest }) {
  const toggle = () => !disabled && onChange && onChange(!checked);
  const box = (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        flex: 'none',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        borderColor: checked ? 'var(--accent)' : 'var(--border)',
        background: checked ? 'var(--accent)' : 'var(--surface)',
        color: 'var(--on-accent)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition:
          'background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
        padding: 0,
        ...style,
      }}
      {...rest}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2 5 8.6 9.5 3.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
  if (!label) return box;
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {box}
      <span
        style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text)' }}
      >
        {label}
      </span>
    </label>
  );
}
