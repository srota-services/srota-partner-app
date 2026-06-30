/**
 * Custom styled Select component
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import '../../styles/components/common/Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options?: SelectOption[];
  /** When `false`, no leading empty option is rendered. */
  placeholder?: string | false;
  error?: boolean;
  loading?: boolean;
  fieldSize?: 'sm' | 'md';
  wrapperClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  children,
  placeholder = 'Select an option',
  error = false,
  loading = false,
  fieldSize = 'md',
  className = '',
  wrapperClassName = '',
  disabled,
  'aria-invalid': ariaInvalid,
  ...props
}) => {
  const showPlaceholder = placeholder !== false;
  const placeholderText =
    typeof placeholder === 'string' ? placeholder : 'Select an option';
  const arrowSize = fieldSize === 'sm' ? 14 : 16;

  return (
    <div
      className={[
        'select-wrapper',
        `select-wrapper--${fieldSize}`,
        error ? 'select-error' : '',
        disabled || loading ? 'select-disabled' : '',
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <select
        className={`select-input ${className}`.trim()}
        disabled={disabled || loading}
        aria-invalid={error || ariaInvalid}
        {...props}
      >
        {showPlaceholder && (
          <option value="">{loading ? 'Loading...' : placeholderText}</option>
        )}
        {options
          ? options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown
        size={arrowSize}
        strokeWidth={2}
        className="select-arrow"
        aria-hidden
      />
    </div>
  );
};

export default Select;
