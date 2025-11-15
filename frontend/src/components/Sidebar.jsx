import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  ShoppingCart,
  Building,
  Package,
  FileText,
  BarChart3,
  ChefHat,
  Receipt,
  TrendingUp,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react';

const Sidebar = ({ userRole, collapsed, onToggle, onCloseMobile, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    superadmin: [
      { icon: Home, label: 'Dashboard', path: '/superadmin-dashboard' },
      { icon: Users, label: 'User Management', path: '/superadmin-add-options' },
      { icon: ChefHat, label: 'Recipe Management', path: '/recipe-dashboard' },
    ],
    md: [
      { icon: Home, label: 'Dashboard', path: '/md-approvals' },
      { icon: BarChart3, label: 'Analytics', path: '/md-analytics' },
      { icon: FileText, label: 'Reports', path: '/md-reports-dashboard' },
    ],
    procurement_officer: [
      { icon: Home, label: 'Dashboard', path: '/procurement-dashboard' },
      { icon: ShoppingCart, label: 'Purchase Orders', path: '/procurement-orders' },
      { icon: ShoppingBag, label: 'New Orders', path: '/create-procurement-order' },
    ],
    hotel_manager: [
      { icon: Home, label: 'Dashboard', path: '/hotel-dashboard' },
      { icon: ChefHat, label: 'Consumption Entry', path: '/consumption-entry' },
      { icon: TrendingUp, label: 'Sales Entry', path: '/sales-entry' },
    ],
    store_manager: [
      { icon: Home, label: 'Dashboard', path: '/store-dashboard' },
      { icon: Package, label: 'Issue Stock', path: '/issue-stock' },
      { icon: Building, label: 'Store Stock', path: '/store-stock' },
      { icon: FileText, label: 'Issue Logs', path: '/issue-log' },
    ],
    accounts: [
      { icon: Home, label: 'Dashboard', path: '/accounts-dashboard' },
      { icon: Receipt, label: 'Enter Payment', path: '/enter-payment' },
      { icon: FileText, label: 'Pending Payments', path: '/pending-payments' },
      { icon: Users, label: 'Vendor Ledger', path: '/vendor-ledger' },
      { icon: BarChart3, label: 'Payment Summary', path: '/payment-summary' },
    ],
  };

  const currentMenu = menuItems[userRole] || [];

  return (
    <div className={`fixed left-0 top-0 h-full bg-primary text-card transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-secondary/20">
        {!collapsed && (
          <h2 className="text-xl font-bold text-secondary">Hotel ERP</h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-secondary/10 transition-colors duration-200"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {currentMenu.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={index}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-secondary text-primary shadow-luxury'
                      : 'hover:bg-secondary/10 text-card'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'group-hover:text-secondary'
                    }`}
                  />
                  {!collapsed && (
                    <span className="ml-3 font-medium animate-slide-in">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className={`bg-secondary/10 rounded-lg p-3 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed && (
            <p className="text-xs text-secondary/80 font-medium uppercase tracking-wide">
              {userRole} Panel
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
