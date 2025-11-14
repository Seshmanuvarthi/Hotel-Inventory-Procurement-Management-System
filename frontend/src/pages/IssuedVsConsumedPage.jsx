import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const IssuedVsConsumedPage = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Issued vs Consumed Report</h2>
          <button
            onClick={() => navigate('/md-reports-dashboard')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Reports
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hotel</label>
              <select
                value={filters.hotelId}
                onChange={(e) => handleFilterChange('hotelId', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Item</label>
              <select
                value={filters.itemId}
                onChange={(e) => handleFilterChange('itemId', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Items</option>
                {items.map(item => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            {reportData && (
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-4 text-center text-sm text-red-600">
            {message}
          </div>
        )}

        {/* Report Results */}
        {reportData && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reportData.issued.toFixed(2)}</div>
                <div className="text-sm text-blue-600">Total Issued</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reportData.consumed.toFixed(2)}</div>
                <div className="text-sm text-green-600">Total Consumed</div>
              </div>
              <div className={`p-4 rounded-lg ${reportData.leakage >= 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className={`text-2xl font-bold ${reportData.leakage >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {reportData.leakage.toFixed(2)}
                </div>
                <div className={`text-sm ${reportData.leakage >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Leakage (Issued - Consumed)
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Report Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Hotel:</span> {reportData.hotelId ? reportData.hotelName || 'Unknown' : 'All Hotels'}
                </div>
                <div>
                  <span className="font-medium">Item:</span> {reportData.itemId ? items.find(i => i._id === reportData.itemId)?.name || 'Unknown' : 'All Items'}
                </div>
                <div>
                  <span className="font-medium">Date Range:</span> {reportData.dateRange?.from || 'N/A'} to {reportData.dateRange?.to || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuedVsConsumedPage;
