import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { CreditCard, Clock, Users, BarChart3, Receipt } from 'lucide-react';

const AccountsDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout title="Accounts Dashboard" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Financial Operations</h2>
          <p className="text-accent">Manage payments, vendors, and financial reporting</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <DashboardCard
            title="Enter Payment"
            value="Process Payment"
            icon={CreditCard}
            color="primary"
            subtitle="Record vendor payments"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/enter-payment')}
                className="w-full"
              >
                Enter Payment
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Pending Payments"
            value="Outstanding"
            icon={Clock}
            color="warning"
            subtitle="View pending payments"
          >
            <div className="mt-4">
              <SecondaryButton
                onClick={() => navigate('/pending-payments')}
                className="w-full"
              >
                View Pending
              </SecondaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Vendor Ledger"
            value="Transaction History"
            icon={Users}
            color="secondary"
            subtitle="Vendor payment records"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/vendor-ledger')}
                className="w-full"
              >
                View Ledger
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Payment Summary"
            value="Financial Overview"
            icon={BarChart3}
            color="accent"
            subtitle="Payment analytics and reports"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/payment-summary')}
                className="w-full"
              >
                View Summary
              </PrimaryButton>
            </div>
          </DashboardCard>
        </div>

        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/enter-payment')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <CreditCard className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">New Payment</span>
            </button>
            <button
              onClick={() => navigate('/pending-payments')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Clock className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Pending</span>
            </button>
            <button
              onClick={() => navigate('/vendor-ledger')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Users className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Vendor Ledger</span>
            </button>
            <button
              onClick={() => navigate('/payment-summary')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Receipt className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Summary</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Financial Management Guidelines</h3>
            <p className="text-sm text-accent">
              Ensure all payments are verified and recorded accurately. Maintain detailed records for audit purposes.
              Process payments within agreed vendor terms to maintain good relationships.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountsDashboard;
