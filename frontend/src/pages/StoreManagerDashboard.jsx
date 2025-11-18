import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { Package, Eye, FileText, Truck } from 'lucide-react';

const StoreManagerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout title="Store Manager Dashboard" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Central Store Operations</h2>
          <p className="text-accent">Manage inventory, stock issuance, and distribution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <DashboardCard
            title="Fulfill Stock Requests"
            value="Restaurant Requests"
            icon={Package}
            color="primary"
            subtitle="Fulfill pending stock requests from restaurants"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/pending-restaurant-stock-requests')}
                className="w-full"
              >
                Fulfill Requests
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Store Stock"
            value="Inventory View"
            icon={Eye}
            color="secondary"
            subtitle="View current stock levels"
          >
            <div className="mt-4">
              <SecondaryButton
                onClick={() => navigate('/store-stock')}
                className="w-full"
              >
                View Stock
              </SecondaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Issue Logs"
            value="Transaction History"
            icon={FileText}
            color="accent"
            subtitle="Track all stock issuances"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/issue-log')}
                className="w-full"
              >
                View Logs
              </PrimaryButton>
            </div>
          </DashboardCard>
        </div>

        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/pending-restaurant-stock-requests')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Package className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Fulfill Requests</span>
            </button>
            <button
              onClick={() => navigate('/store-stock')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Eye className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Stock Levels</span>
            </button>
            <button
              onClick={() => navigate('/issue-log')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <FileText className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Issue History</span>
            </button>
            <button
              onClick={() => navigate('/pending-restaurant-stock-requests')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Truck className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Restaurant Requests</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Inventory Management Guidelines</h3>
            <p className="text-sm text-accent">
              Always verify stock levels before issuing. Maintain accurate records of all transactions.
              Report any discrepancies immediately to ensure smooth operations.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StoreManagerDashboard;
