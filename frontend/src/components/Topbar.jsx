import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Topbar = ({ title }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-card shadow-luxury border-b border-secondary/20">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-text-dark">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-text-dark">
              <User size={18} className="text-secondary" />
              <span className="font-medium">{user.name || 'User'}</span>
              <span className="text-sm text-accent bg-secondary/10 px-2 py-1 rounded-full">
                {user.role || 'Role'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-card rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-luxury hover:shadow-luxury-lg"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
