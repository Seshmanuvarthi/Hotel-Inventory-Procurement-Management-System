import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  TrendingUp,
  Filter
} from 'lucide-react';

const LeakageAlertsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [alerts, setAlerts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
  }, [filterStatus, filterType]);

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('alertType', filterType);

      const response = await axiosInstance.get(`/leakage-alerts?${params}`);
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/leakage-alerts/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const generateAlerts = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/leakage-alerts/generate');
      await fetchAlerts();
      await fetchStatistics();
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId, status, note = '') => {
    try {
      await axiosInstance.patch(`/leakage-alerts/${alertId}/status`, {
        status,
        note
      });
      await fetchAlerts();
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'investigating':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const tableHeaders = [
    'Alert Type',
    'Hotel',
    'Item',
    'Leakage %',
    'Status',
    'Assigned To',
    'Created',
    'Actions'
  ];

  const tableData = alerts.map(alert => [
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAlertTypeColor(alert.alertType)}`}>
      {alert.alertType.toUpperCase()}
    </span>,
    alert.hotelId?.name || 'Unknown',
    alert.itemId?.name || 'Unknown',
    `${alert.leakagePercentage.toFixed(2)}%`,
    <div className="flex items-center gap-2">
      {getStatusIcon(alert.status)}
      <span className="capitalize">{alert.status}</span>
    </div>,
    alert.assignedTo?.name || 'Unassigned',
    new Date(alert.createdAt).toLocaleDateString(),
    <div className="flex gap-2">
      {alert.status === 'active' && (
        <SecondaryButton
          onClick={() => updateAlertStatus(alert._id, 'investigating', 'Started investigation')}
          className="text-xs px-2 py-1"
        >
          Investigate
        </SecondaryButton>
      )}
      {alert.status === 'investigating' && (
        <PrimaryButton
          onClick={() => updateAlertStatus(alert._id, 'resolved', 'Issue resolved')}
          className="text-xs px-2 py-1"
        >
          Resolve
        </PrimaryButton>
      )}
    </div>
  ]);

  if (loading) {
    return (
      <Layout title="Leakage Alerts" userRole={user.role}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Leakage Alerts" userRole={user.role}>
      <div className="space-y-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 text-text-dark">
            Leakage Alerts & Monitoring
          </h2>
          <p className="text-accent">Real-time stock discrepancy detection and management</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statistics.statistics?.map(stat => (
            <div key={stat._id} className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent capitalize">{stat._id} Alerts</p>
                  <p className="text-2xl font-bold text-text-dark">{stat.totalCount}</p>
                  <p className="text-sm text-accent">
                    Loss: {formatCurrency(stat.totalLoss)}
                  </p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${
                  stat._id === 'red' ? 'text-red-500' :
                  stat._id === 'yellow' ? 'text-yellow-500' : 'text-green-500'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-secondary/20 rounded-md bg-background text-text-dark"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-secondary/20 rounded-md bg-background text-text-dark"
              >
                <option value="">All Types</option>
                <option value="red">Critical (Red)</option>
                <option value="yellow">Warning (Yellow)</option>
                <option value="green">Normal (Green)</option>
              </select>
            </div>

            <PrimaryButton onClick={generateAlerts}>
              Generate New Alerts
            </PrimaryButton>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-card rounded-xl shadow-luxury border border-secondary/10">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Active Alerts</h3>
            <StyledTable headers={tableHeaders} data={tableData} />
          </div>
        </div>

        {/* Alert Details Modal would go here if needed */}
      </div>
    </Layout>
  );
};

export default LeakageAlertsPage;
