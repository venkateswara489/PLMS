import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function isLinkActive(pathname, link) {
  if (link.href === '/') {
    return pathname === '/';
  }
  if (link.exact) {
    return pathname === link.href;
  }
  if (pathname === link.href) return true;
  if (pathname.startsWith(`${link.href}/`)) return true;
  return false;
}

const Sidebar = ({ links }) => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = isLinkActive(location.pathname, link);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}
                `}
              >
                <Icon 
                  className={`
                    flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors
                    ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}
                  `} 
                />
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
