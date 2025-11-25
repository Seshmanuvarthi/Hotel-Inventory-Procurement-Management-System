import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Menu, LogOut } from 'lucide-react';

const Layout = ({ children, title, userRole }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-primary text-card transition-all duration-300 z-50
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
        w-64
      `}>
        <Sidebar
          userRole={userRole}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCloseMobile={() => setMobileMenuOpen(false)}
          isMobile={mobileMenuOpen}
        />
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
        ${mobileMenuOpen ? 'ml-0' : 'ml-0'}
      `}>
        {/* Mobile Header */}
        <div className="md:hidden bg-card shadow-luxury border-b border-secondary/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary/10 transition-colors duration-200"
            >
              <Menu size={24} className="text-primary" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-text-dark">{title}</h1>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary/10 transition-colors duration-200 text-primary"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Topbar */}
        <div className="hidden md:block">
          <Topbar title={title} />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
