import React from 'react';

/**
 * Switch — controlled on/off toggle. Track fills with the accent when on.
 * Pass `checked` + `onChange(next)`.
 */
export function Switch({ checked = false, onChange, disabled = false, label, style, ...rest }) {
  const toggle = () => !disabled && onChange && onChange(!checked);
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      style={{
        position: 'relative',
        width: 40,
        height: 24,
        flex: 'none',
        borderRadius: 'var(--radius-badge)',
        border: '1px solid',
        borderColor: checked ? 'var(--accent)' : 'var(--border)',
        background: checked ? 'var(--accent)' : 'var(--surface-raised)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition:
          'background var(--duration-normal) var(--ease-out), border-color var(--duration-normal) var(--ease-out)',
        padding: 0,
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: 'var(--radius-badge)',
          background: checked ? 'var(--on-accent)' : 'var(--text-muted)',
          transition: 'left var(--duration-normal) var(--ease-spring)',
        }}
      />
    </button>
  );
  if (!label) return control;
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {control}
      <span
        style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text)' }}
      >
        {label}
      </span>
    </label>
  );
}
