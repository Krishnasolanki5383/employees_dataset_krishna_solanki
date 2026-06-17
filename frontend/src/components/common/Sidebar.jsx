import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiBarChart2, FiX } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Employees', path: '/employees', icon: FiUsers },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-brand-card border-r border-gray-800 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-800">
          <span className="text-white font-bold">Menu Navigation</span>
          <button onClick={onClose} className="text-brand-textMuted hover:text-white">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                      : 'text-brand-textMuted hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
