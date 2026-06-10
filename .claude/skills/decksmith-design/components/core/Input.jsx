import React from 'react';

/**
 * Input — text field with optional label, helper/error text, and leading
 * icon. Focus ring uses border-focus; error state swaps to the error token.
 */
export function Input({
  label,
  error,
  helper,
  iconLeft,
  id,
  style,
  containerStyle,
  disabled = false,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fieldId = id || React.useId();
  const borderColor = error ? 'var(--error)' : focus ? 'var(--border-focus)' : 'var(--border)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...containerStyle }}>
      {label && (
        <label
          htmlFor={fieldId}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--text)',
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 40,
          padding: '0 12px',
          background: 'var(--surface)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-interactive)',
          boxShadow: focus && !error ? '0 0 0 3px var(--accent-subtle)' : 'none',
          transition:
            'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {iconLeft && (
          <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{iconLeft}</span>
        )}
        <input
          id={fieldId}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            ...style,
          }}
          {...rest}
        />
      </div>
      {(error || helper) && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: error ? 'var(--error-text)' : 'var(--text-muted)',
          }}
        >
          {error || helper}
        </span>
      )}
    </div>
  );
}
