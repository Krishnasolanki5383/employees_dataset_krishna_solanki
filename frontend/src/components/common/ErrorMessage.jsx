import React from 'react';
import { BiErrorCircle } from 'react-icons/bi';

const ErrorMessage = ({ message = 'An unexpected error occurred. Please try again.', onRetry }) => {
  return (
    <div className="bg-brand-danger/10 border border-brand-danger/20 rounded-xl p-6 flex flex-col items-center text-center max-w-md mx-auto my-8">
      <BiErrorCircle className="text-brand-danger h-12 w-12 mb-3" />
      <h4 className="text-lg font-bold text-white mb-2">Operation Failed</h4>
      <p className="text-sm text-brand-textMuted mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-brand-danger text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
