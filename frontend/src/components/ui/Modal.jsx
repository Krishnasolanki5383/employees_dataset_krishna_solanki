import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content container */}
      <div className={`relative w-full max-w-lg bg-brand-card border border-gray-800 rounded-2xl shadow-2xl p-6 z-10 transform transition-all duration-300 scale-100 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-brand-text">{title}</h3>
          <button 
            onClick={onClose}
            className="text-brand-textMuted hover:text-white rounded-lg p-1 transition-colors focus:outline-none"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
