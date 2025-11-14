import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { UserX, ChefHat, Truck, Package, Calculator } from 'lucide-react';

const DeleteOptionsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const options = [
    { label: 'Delete MD', role: 'md', icon: UserX, description: 'Remove Managing Director' },
    { label: 'Delete Hotel Manager', role: 'hotel_manager', icon: ChefHat, description: 'Remove hotel management' },
    { label: 'Delete Procurement Officer', role: 'procurement_officer', icon: Truck, description: 'Remove procurement operations' },
    { label: 'Delete Store Manager', role: 'store_manager', icon: Package, description: 'Remove store operations' },
    { label: 'Delete Accounts User', role: 'accounts', icon: Calculator, description: 'Remove financial operations' },
  ];

  return (
    <Layout title="Delete / Disable Options" userRole={user.role}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-red-600 text-white rounded-xl p-6 shadow-luxury">
          <h2 className="text-2xl font-bold mb-2">Delete / Disable Options</h2>
          <p className="text-white/80">Choose what you want to remove or disable from the system</p>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-yellow-800 text-sm">
              <strong>Warning:</strong> These actions are irreversible. Please proceed with caution.
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option) => (
            <div
              key={option.role}
              className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10 hover:shadow-luxury-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/delete-user?role=${option.role}`)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <option.icon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-dark mb-1">{option.label}</h3>
                  <p className="text-sm text-text-dark/60">{option.description}</p>
                </div>
                <PrimaryButton
                  className="w-full mt-2 bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/delete-user?role=${option.role}`);
                  }}
                >
                  {option.label.replace('Delete ', 'Delete ')}
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <SecondaryButton
              onClick={() => navigate('/users-list')}
              className="flex items-center space-x-2"
            >
              <UserX className="w-4 h-4" />
              <span>View All Users</span>
            </SecondaryButton>
            <SecondaryButton
              onClick={() => navigate('/items-list')}
              className="flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Manage Items</span>
            </SecondaryButton>
            <SecondaryButton
              onClick={() => navigate('/superadmin-add-options')}
              className="flex items-center space-x-2"
            >
              <span>Add Options</span>
            </SecondaryButton>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <SecondaryButton
            onClick={() => navigate('/superadmin-dashboard')}
            className="px-8"
          >
            Back to Dashboard
          </SecondaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default DeleteOptionsPage;
