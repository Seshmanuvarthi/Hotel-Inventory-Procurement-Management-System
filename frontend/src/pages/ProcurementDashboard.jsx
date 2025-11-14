import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { FileText, Eye, Upload, Receipt } from 'lucide-react';

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <DashboardCard
            title="Create Request"
            value="New Procurement"
            icon={FileText}
            color="primary"
            subtitle="Submit new procurement requests"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/create-procurement-request')}
                className="w-full"
              >
                Create Request
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="View Requests"
            value="Track Status"
            icon={Eye}
            color="secondary"
            subtitle="Monitor your procurement requests"
          >
            <div className="mt-4">
              <SecondaryButton
                onClick={() => navigate('/procurement-requests')}
                className="w-full"
              >
                View Requests
              </SecondaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Upload Bills"
            value="Bill Management"
            icon={Upload}
            color="accent"
            subtitle="Upload and manage procurement bills"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/upload-bill')}
                className="w-full"
              >
                Upload Bill
              </PrimaryButton>
            </div>
          </DashboardCard>
        </div>

        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/procurement-requests')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <FileText className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">My Requests</span>
            </button>
            <button
              onClick={() => navigate('/bills-list')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Receipt className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Bills List</span>
            </button>
            <button
              onClick={() => navigate('/upload-bill')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Upload className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Upload New Bill</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Procurement Guidelines</h3>
            <p className="text-sm text-accent">
              Ensure all requests include vendor details, quantities, and pricing.
              Bills must be uploaded within 24 hours of procurement.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProcurementDashboard;
