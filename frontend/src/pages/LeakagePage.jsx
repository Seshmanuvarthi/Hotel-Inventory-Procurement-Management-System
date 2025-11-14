import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const LeakagePage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    groupBy: 'hotel'
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const generateReport = async () => {
    setLoading(true);
    setMessage('');

    try {
      const queryParams = new URLSearchParams();
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);
      queryParams.append('groupBy', filters.groupBy);

      const response = await axiosInstance.get(`/reports/leakage?${queryParams}`);
      setReportData(response.data.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportToCSV = () => {
    if (!reportData.length) return;

    const headers = filters.groupBy === 'hotel'
      ? ['Hotel Name', 'Issued', 'Consumed', 'Leakage', 'Percent Difference']
      : ['Item Name', 'Issued', 'Consumed', 'Leakage', 'Percent Difference'];

    const csvData = [
      headers,
      ...reportData.map(item => [
        filters.groupBy === 'hotel' ? item.hotelName : item.itemName,
        item.issued,
        item.consumed,
        item.leakage,
        item.percentDifference + '%'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leakage-report-${filters.groupBy}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const drillDown = (item) => {
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);

    if (filters.groupBy === 'hotel') {
      params.append('hotelId', item.hotelId);
    } else {
      params.append('itemId', item.itemId);
    }

    navigate(`/reports/issued-vs-consumed?${params}`);
  };

  return (
    <Layout title="Leakage Report" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Leakage Report</h2>
          <p className="text-accent">Identify discrepancies between issued and consumed stock</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {message && (
            <div className="mb-6 text-center p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {message}
            </div>
          )}

          {/* Filters */}
          <div className="bg-card rounded-xl shadow-luxury p-8 border border-secondary/10 mb-6">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Group By</label>
                <select
                  value={filters.groupBy}
                  onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                  className="block w-full px-4 py-3 border border-secondary/30 rounded-lg shadow-sm placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                >
                  <option value="hotel">By Hotel</option>
                  <option value="item">By Item</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  className="block w-full px-4 py-3 border border-secondary/30 rounded-lg shadow-sm placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                  className="block w-full px-4 py-3 border border-secondary/30 rounded-lg shadow-sm placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-center space-x-4">
              <PrimaryButton onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </PrimaryButton>
              {reportData.length > 0 && (
                <SecondaryButton onClick={exportToCSV}>
                  Export CSV
                </SecondaryButton>
              )}
            </div>
          </div>

          {/* Report Results */}
          {reportData.length > 0 && (
            <div className="bg-card rounded-xl shadow-luxury border border-secondary/10 overflow-hidden">
              <div className="px-8 py-6 border-b border-secondary/20">
                <h3 className="text-xl font-semibold text-text-dark">
                  Leakage by {filters.groupBy === 'hotel' ? 'Hotel' : 'Item'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary/20">
                  <thead className="bg-background">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-accent uppercase tracking-wider">
                        {filters.groupBy === 'hotel' ? 'Hotel Name' : 'Item Name'}
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-accent uppercase tracking-wider">
                        Issued
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-accent uppercase tracking-wider">
                        Consumed
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-accent uppercase tracking-wider">
                        Leakage
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-accent uppercase tracking-wider">
                        % Difference
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-accent uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-secondary/20">
                    {reportData.map((item, index) => (
                      <tr key={index} className={item.leakage > 0 ? 'bg-red-50' : 'bg-green-50'}>
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                          {filters.groupBy === 'hotel' ? item.hotelName : item.itemName}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-accent">
                          {item.issued.toFixed(2)}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-accent">
                          {item.consumed.toFixed(2)}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={item.leakage > 0 ? 'text-red-600' : 'text-green-600'}>
                            {item.leakage.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-accent">
                          {item.percentDifference.toFixed(2)}%
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => drillDown(item)}
                            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                          >
                            Drill Down
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportData.length === 0 && !loading && (
            <div className="bg-card rounded-xl shadow-luxury p-12 border border-secondary/10 text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-secondary font-medium mb-2">No leakage data available</p>
              <p className="text-accent">Configure filters and generate a report to identify discrepancies.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeakagePage;
