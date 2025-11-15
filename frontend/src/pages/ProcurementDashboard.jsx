import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { FileText, Eye } from 'lucide-react';

const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout title="Procurement Dashboard" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Procurement Operations</h2>
          <p className="text-accent">Manage procurement requests and billing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <DashboardCard
            title="New Order"
            value="Create Procurement"
            icon={FileText}
            color="primary"
            subtitle="Create complete digital bill"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/create-procurement-order')}
                className="w-full"
              >
                Create New Order
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="My Orders"
            value="Order History"
            icon={Eye}
            color="secondary"
            subtitle="View all your procurement orders"
          >
            <div className="mt-4">
              <SecondaryButton
                onClick={() => navigate('/procurement-orders')}
                className="w-full"
              >
                View Orders
              </SecondaryButton>
            </div>
          </DashboardCard>
        </div>

        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/create-procurement-order')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <FileText className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">New Order</span>
            </button>
            <button
              onClick={() => navigate('/procurement-orders')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Eye className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">My Orders</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Procurement Guidelines</h3>
            <p className="text-sm text-accent">
              Create complete digital bills with all vendor and item details.
              Orders go through MD approval before payment processing.
              Stock is automatically added after payment completion.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProcurementDashboard;
