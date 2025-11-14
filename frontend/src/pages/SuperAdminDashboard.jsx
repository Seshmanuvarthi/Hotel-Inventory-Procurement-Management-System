import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import { UserPlus, Trash2, ChefHat } from 'lucide-react';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout title="SuperAdmin Dashboard" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Welcome to Hotel ERP</h2>
          <p className="text-accent">Manage your hotel operations with precision</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <DashboardCard
            title="User Management"
            value="Add Users & Hotels"
            icon={UserPlus}
            color="primary"
            subtitle="Create new accounts and locations"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/superadmin-add-options')}
                className="w-full"
              >
                Add Options
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Delete / Disable"
            value="Manage Entities"
            icon={Trash2}
            color="danger"
            subtitle="Remove or disable users and items"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/superadmin-delete-options')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Delete Options
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recipe Management"
            value="Culinary Database"
            icon={ChefHat}
            color="secondary"
            subtitle="Manage recipes and ingredients"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/recipe-dashboard')}
                className="w-full"
              >
                Manage Recipes
              </PrimaryButton>
            </div>
          </DashboardCard>
        </div>

        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/add-user-or-hotel')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center"
            >
              <UserPlus className="w-8 h-8 text-secondary mx-auto mb-2" />
              <span className="text-sm font-medium text-text-dark">Add User/Hotel</span>
            </button>
            <button
              onClick={() => navigate('/add-item')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center"
            >
              <ChefHat className="w-8 h-8 text-secondary mx-auto mb-2" />
              <span className="text-sm font-medium text-text-dark">Add Item</span>
            </button>
            <button
              onClick={() => navigate('/items-list')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center"
            >
              <Trash2 className="w-8 h-8 text-secondary mx-auto mb-2" />
              <span className="text-sm font-medium text-text-dark">Manage Items</span>
            </button>
            <button
              onClick={() => navigate('/add-recipe')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center"
            >
              <ChefHat className="w-8 h-8 text-secondary mx-auto mb-2" />
              <span className="text-sm font-medium text-text-dark">Add Recipe</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
