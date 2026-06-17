import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 text-center border-t border-gray-800 bg-brand-card text-brand-textMuted text-xs">
      &copy; {new Date().getFullYear()} Employee Management System. All rights reserved.
    </footer>
  );
};

export default Footer;
