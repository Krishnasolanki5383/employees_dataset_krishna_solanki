import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getInitials } from '../../utils/helpers';
import { toggleTheme } from '../../store/uiSlice';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  return (
    <header className="h-16 border-b border-gray-800/10 bg-brand-card flex items-center justify-between px-6 sticky top-0 z-40 transition-colors">
      {/* Brand Logo & Mobile Trigger */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="text-brand-textMuted hover:text-brand-primary p-2 rounded-lg lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="text-xl font-bold tracking-tight text-brand-text flex items-center gap-2">
          <span className="text-brand-primary">⚙️</span> EMS <span className="text-brand-textMuted text-sm font-normal hidden sm:inline">Portal</span>
        </Link>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="text-brand-textMuted hover:text-brand-primary hover:bg-brand-primary/10 p-2 rounded-lg transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-brand-text">{user.name || user.email}</p>
              <p className="text-xs text-brand-textMuted capitalize">{user.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold text-xs">
              {getInitials(user.name || user.email)}
            </div>
            <button
              onClick={logout}
              className="ml-2 text-brand-textMuted hover:text-brand-danger hover:bg-brand-danger/10 p-2 rounded-lg transition-all cursor-pointer"
              title="Logout"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

