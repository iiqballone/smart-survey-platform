import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="fg">
        {label && <label htmlFor={inputId} className="fl">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`fi ${className}`.trim()}
          style={error ? { borderColor: 'var(--danger)' } : undefined}
          {...props}
        />
        {error && <p className="ferr">{error}</p>}
        {hint && !error && <p className="fhint">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
