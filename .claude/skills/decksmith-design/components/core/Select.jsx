import React from 'react';

/**
 * Select — token-styled native select with a label and chevron. Keeps the
 * native popup for accessibility while matching Input's chrome.
 */
export function Select({
  label,
  id,
  options = [],
  style,
  containerStyle,
  disabled = false,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fieldId = id || React.useId();
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
      <div style={{ position: 'relative', display: 'flex', opacity: disabled ? 0.5 : 1 }}>
        <select
          id={fieldId}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: 'none',
            width: '100%',
            height: 40,
            padding: '0 36px 0 12px',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-interactive)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            cursor: 'pointer',
            ...style,
          }}
          {...rest}
        >
          {options.map((o) => {
            const value = typeof o === 'string' ? o : o.value;
            const text = typeof o === 'string' ? o : o.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            fontSize: 12,
          }}
        >
          ▾
        </span>
      </div>
    </div>
  );
}
