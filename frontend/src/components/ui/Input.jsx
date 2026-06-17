import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label className="text-sm font-medium text-brand-textMuted select-none">
          {label} {required && <span className="text-brand-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border text-brand-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 ${
          error ? 'border-brand-danger focus:ring-brand-danger' : 'border-gray-700 focus:ring-brand-primary'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-brand-danger mt-1">{error}</span>}
    </div>
  );
};

export default Input;
