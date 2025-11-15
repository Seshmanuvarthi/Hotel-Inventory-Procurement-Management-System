import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { UserPlus, Building, ChefHat, Truck, Package, Calculator } from 'lucide-react';

const AddOptionsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const options = [
    { label: 'Add MD', type: 'md', icon: UserPlus, description: 'Add Managing Director' },
    { label: 'Add Hotel', type: 'hotel', icon: Building, description: 'Create new hotel location' },
    { label: 'Add Hotel Manager', type: 'hotel_manager', icon: ChefHat, description: 'Assign hotel management' },
    { label: 'Add Procurement Officer', type: 'procurement_officer', icon: Truck, description: 'Manage procurement operations' },
    { label: 'Add Store Manager', type: 'store_manager', icon: Package, description: 'Oversee store operations' },
    { label: 'Add Accounts User', type: 'accounts', icon: Calculator, description: 'Handle financial operations' },
    {label:'Add Vendor',type:'vendor',icon:UserPlus,description:'Add new vendor to the system'},
  ];

  return (
    <Layout title="Add Options" userRole={user.role}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-primary text-card rounded-xl p-6 shadow-luxury">
          <h2 className="text-2xl font-bold mb-2">Add New Entities</h2>
          <p className="text-card/80">Choose what you want to add to the system</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option) => (
            <div
              key={option.type}
              className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10 hover:shadow-luxury-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/add-user-or-hotel?type=${option.type}`)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <option.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-dark mb-1">{option.label}</h3>
                  <p className="text-sm text-text-dark/60">{option.description}</p>
                </div>
                <PrimaryButton
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/add-user-or-hotel?type=${option.type}`);
                  }}
                >
                  Add {option.label.replace('Add ', '')}
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
              <UserPlus className="w-4 h-4" />
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
              onClick={() => navigate('/superadmin-delete-options')}
              className="flex items-center space-x-2"
            >
              <span>Delete Options</span>
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

export default AddOptionsPage;
