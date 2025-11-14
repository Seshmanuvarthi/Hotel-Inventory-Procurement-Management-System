import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import { FileText, TrendingUp, AlertTriangle, BarChart3, ArrowRight, Activity } from 'lucide-react';

const MDReportsDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    issuedThisMonth: 0,
    consumedThisMonth: 0,
    leakageThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const from = firstDay.toISOString().split('T')[0];
      const to = lastDay.toISOString().split('T')[0];

      // Get leakage report for this month
      const leakageResponse = await axiosInstance.get(`/reports/leakage?from=${from}&to=${to}&groupBy=hotel`);
      const totalLeakage = leakageResponse.data.data.reduce((sum, item) => sum + item.leakage, 0);
      const totalIssued = leakageResponse.data.data.reduce((sum, item) => sum + item.issued, 0);
      const totalConsumed = leakageResponse.data.data.reduce((sum, item) => sum + item.consumed, 0);

      setStats({
        issuedThisMonth: totalIssued,
        consumedThisMonth: totalConsumed,
        leakageThisMonth: totalLeakage
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      title: 'Issued vs Consumed',
      description: 'Compare issued stock with consumption patterns',
      icon: TrendingUp,
      color: 'primary',
      path: '/reports/issued-vs-consumed',
      buttonText: 'View Report'
    },
    {
      title: 'Consumed vs Sales',
      description: 'Compare consumption with sales data analysis',
      icon: BarChart3,
      color: 'secondary',
      path: '/reports/consumed-vs-sales',
      buttonText: 'View Report'
    },
    {
      title: 'Leakage Report',
      description: 'Identify discrepancies and operational losses',
      icon: AlertTriangle,
      color: 'warning',
      path: '/reports/leakage',
      buttonText: 'View Report'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive business intelligence and insights',
      icon: Activity,
      color: 'accent',
      path: '/md-analytics',
      buttonText: 'View Analytics'
    }
  ];

  if (loading) {
    return (
      <Layout title="MD Reports Dashboard" userRole={user.role}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="MD Reports Dashboard" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Management Reports</h2>
          <p className="text-accent">Comprehensive reporting and operational insights</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Issued This Month"
            value={stats.issuedThisMonth.toFixed(2)}
            icon={FileText}
            color="primary"
            subtitle="Total stock issued"
          />
          <DashboardCard
            title="Consumed This Month"
            value={stats.consumedThisMonth.toFixed(2)}
            icon={TrendingUp}
            color="secondary"
            subtitle="Total consumption"
          />
          <DashboardCard
            title="Leakage This Month"
            value={stats.leakageThisMonth.toFixed(2)}
            icon={AlertTriangle}
            color={stats.leakageThisMonth >= 0 ? 'warning' : 'accent'}
            subtitle="Operational variance"
          />
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <div key={index} className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-${report.color}/10`}>
                    <report.icon className={`w-6 h-6 text-${report.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-dark">{report.title}</h3>
                    <p className="text-accent text-sm mt-1">{report.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <PrimaryButton
                  onClick={() => navigate(report.path)}
                  className="w-full flex items-center justify-center gap-2 group"
                >
                  {report.buttonText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/reports/issued-vs-consumed')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Issued vs Consumed</span>
            </button>
            <button
              onClick={() => navigate('/reports/consumed-vs-sales')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <BarChart3 className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Consumed vs Sales</span>
            </button>
            <button
              onClick={() => navigate('/reports/leakage')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <AlertTriangle className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Leakage Report</span>
            </button>
            <button
              onClick={() => navigate('/md-analytics')}
              className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200 text-center group"
            >
              <Activity className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:animate-bounce-subtle" />
              <span className="text-sm font-medium text-text-dark">Analytics</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Reporting Guidelines</h3>
            <p className="text-sm text-accent">
              Access detailed reports to monitor operational efficiency. Regular review of leakage reports helps identify
              areas for improvement. Use analytics for strategic decision-making and performance optimization.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MDReportsDashboard;
