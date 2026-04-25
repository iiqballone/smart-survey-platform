import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="fg">
        {label && <label htmlFor={inputId} className="fl">{label}</label>}
        <select
          ref={ref}
          id={inputId}
          className={`fsel ${className}`.trim()}
          style={error ? { borderColor: 'var(--danger)' } : undefined}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="ferr">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
