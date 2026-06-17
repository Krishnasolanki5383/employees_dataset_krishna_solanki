import React from 'react';
import { BiLoaderAlt } from 'react-icons/bi';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-blue-600 active:scale-95',
    secondary: 'bg-brand-card text-brand-text border border-gray-700 hover:bg-gray-700 hover:text-white active:scale-95',
    danger: 'bg-brand-danger text-white hover:bg-red-600 active:scale-95',
    outline: 'border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white active:scale-95',
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <BiLoaderAlt className="animate-spin mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;
