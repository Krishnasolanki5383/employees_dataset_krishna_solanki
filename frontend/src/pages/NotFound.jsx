import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative">
      <Helmet>
        <title>404 Page Not Found | EMS Portal</title>
      </Helmet>
      <h1 className="text-9xl font-extrabold text-brand-primary tracking-widest animate-pulse">404</h1>
      <div className="bg-brand-primary text-white px-2 text-sm rounded rotate-12 absolute -translate-y-8">
        Page Not Found
      </div>
      <p className="text-brand-textMuted text-lg mt-6 mb-8 max-w-md">
        The link you followed may be broken, or the page may have been removed. Let's get you back on track.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        Go to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;

