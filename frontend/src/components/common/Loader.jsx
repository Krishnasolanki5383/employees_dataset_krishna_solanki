import React from 'react';
import { BiLoaderAlt } from 'react-icons/bi';

const Loader = ({ fullPage = false, message = 'Loading...' }) => {
  const containerStyle = fullPage 
    ? 'fixed inset-0 bg-brand-bg/85 z-50 flex flex-col items-center justify-center'
    : 'py-12 flex flex-col items-center justify-center';

  return (
    <div className={containerStyle}>
      <BiLoaderAlt className="animate-spin text-brand-primary h-10 w-10 mb-3" />
      {message && <p className="text-sm font-medium text-brand-textMuted">{message}</p>}
    </div>
  );
};

export default Loader;
