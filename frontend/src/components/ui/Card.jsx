import React from 'react';

const Card = ({ title, subtitle, children, className = '', headerAction }) => {
  return (
    <div className={`bg-brand-card border border-gray-800 rounded-xl p-6 shadow-xl hover:border-gray-700/50 transition-all duration-300 ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <div>
            {title && <h3 className="text-lg font-bold text-brand-text">{title}</h3>}
            {subtitle && <p className="text-xs text-brand-textMuted mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
