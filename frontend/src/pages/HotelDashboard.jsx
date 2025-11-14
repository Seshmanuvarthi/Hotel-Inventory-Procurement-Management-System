import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { ChefHat, TrendingUp } from 'lucide-react';

const HotelDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout title="Hotel Manager Dashboard" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Hotel Operations</h2>
          <p className="text-accent">Track consumption, sales, and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <DashboardCard
            title="Daily Consumption"
            value="Track Usage"
            icon={ChefHat}
            color="primary"
            subtitle="Record daily ingredient consumption"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/consumption-entry')}
                className="w-full"
              >
                Enter Consumption
              </PrimaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Daily Sales"
            value="Revenue Tracking"
            icon={TrendingUp}
            color="secondary"
            subtitle="Record daily sales and revenue"
          >
            <div className="mt-4">
              <SecondaryButton
                onClick={() => navigate('/sales-entry')}
                className="w-full"
              >
                Enter Sales
              </SecondaryButton>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Performance Reports"
            value="Analytics View"
            icon={TrendingUp}
            color="accent"
            subtitle="View consumption vs sales reports"
          >
            <div className="mt-4">
              <PrimaryButton
                onClick={() => navigate('/reports/consumed-vs-sales')}
                className="w-full"
              >
                View Reports
              </PrimaryButton>
            </div>
          </DashboardCard>
        </div>

        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/consumption-entry')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <ChefHat className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Consumption</span>
            </button>
            <button
              onClick={() => navigate('/sales-entry')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Sales Entry</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Daily Operations Reminder</h3>
            <p className="text-sm text-accent">
              Remember to enter consumption and sales data daily before 6 PM.
              Accurate data entry ensures precise inventory management and reporting.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HotelDashboard;
