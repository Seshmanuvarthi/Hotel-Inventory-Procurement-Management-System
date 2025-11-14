import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const IssuedVsConsumedPage = () => {
  const [filters, setFilters] = useState({
    hotelId: '',
    itemId: '',
    from: '',
    to: ''
  });
  const [reportData, setReportData] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchHotels();
    fetchItems();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axiosInstance.get('/hotels');
      setHotels(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get('/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = async () => {
    setLoading(true);
    setMessage('');

    try {
      const queryParams = new URLSearchParams();
      if (filters.hotelId) queryParams.append('hotelId', filters.hotelId);
      if (filters.itemId) queryParams.append('itemId', filters.itemId);
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);

      const response = await axiosInstance.get(`/reports/issued-vs-consumed?${queryParams}`);
      setReportData(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Issued', reportData.issued],
      ['Consumed', reportData.consumed],
      ['Leakage', reportData.leakage],
      ['Hotel ID', reportData.hotelId || 'All'],
      ['Item ID', reportData.itemId || 'All'],
      ['Date From', reportData.dateRange?.from || ''],
      ['Date To', reportData.dateRange?.to || '']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'issued-vs-consumed-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Issued vs Consumed Report" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Issued vs Consumed Report</h2>
          <p className="text-accent">Compare stock issued to hotels with actual consumption</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Hotel</label>
                <select
                  value={filters.hotelId}
                  onChange={(e) => handleFilterChange('hotelId', e.target.value)}
                  className="block w-full px-4 py-3 border border-secondary/30 rounded-lg shadow-sm placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                >
                  <option value="">All Hotels</option>
                  {hotels.map(hotel => (
                    <option key={hotel._id} value={hotel._id}>{hotel.name} - {hotel.branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Item</label>
                <select
                  value={filters.itemId}
                  onChange={(e) => handleFilterChange('itemId', e.target.value)}
                  className="block w-full px-4 py-3 border border-secondary/30 rounded-lg shadow-sm placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                >
                  <option value="">All Items</option>
                  {items.map(item => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
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
              {reportData && (
                <SecondaryButton onClick={exportToCSV}>
                  Export CSV
                </SecondaryButton>
              )}
            </div>
          </div>

          {/* Report Results */}
          {reportData && (
            <div className="bg-card rounded-xl shadow-luxury p-8 border border-secondary/10">
              <h3 className="text-xl font-semibold text-text-dark mb-8">Report Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.issued.toFixed(2)}</div>
                  <div className="text-sm text-blue-600 font-medium">Total Issued</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">{reportData.consumed.toFixed(2)}</div>
                  <div className="text-sm text-green-600 font-medium">Total Consumed</div>
                </div>
                <div className={`p-6 rounded-lg border ${reportData.leakage >= 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-3xl font-bold mb-2 ${reportData.leakage >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {reportData.leakage.toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${reportData.leakage >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    Leakage (Issued - Consumed)
                  </div>
                </div>
              </div>

              <div className="border-t border-secondary/20 pt-6">
                <h4 className="text-lg font-medium text-text-dark mb-4">Report Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-background p-4 rounded-lg">
                    <span className="font-medium text-text-dark">Hotel:</span>
                    <span className="ml-2 text-accent">
                      {reportData.hotelId ? reportData.hotelName || 'Unknown' : 'All Hotels'}
                    </span>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <span className="font-medium text-text-dark">Item:</span>
                    <span className="ml-2 text-accent">
                      {reportData.itemId ? items.find(i => i._id === reportData.itemId)?.name || 'Unknown' : 'All Items'}
                    </span>
                  </div>
                  <div className="bg-background p-4 rounded-lg md:col-span-2">
                    <span className="font-medium text-text-dark">Date Range:</span>
                    <span className="ml-2 text-accent">
                      {reportData.dateRange?.from || 'N/A'} to {reportData.dateRange?.to || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!reportData && !loading && (
            <div className="bg-card rounded-xl shadow-luxury p-12 border border-secondary/10 text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-secondary font-medium mb-2">No report data</p>
              <p className="text-accent">Configure filters and generate a report to view results.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IssuedVsConsumedPage;
