import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';

const RestaurantStockRequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequestDetail();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRequestDetail = async () => {
    try {
      const response = await axiosInstance.get(`/restaurant-stock-requests/${id}`);
      setRequest(response.data);
    } catch (error) {
      setMessage('Error fetching restaurant stock request details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'partially_issued':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getItemStatusColor = (status) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'partially_issued':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Request Not Found</h2>
            <p className="text-gray-500 mb-8">The restaurant stock request you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/restaurant-stock-requests')}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Restaurant Stock Request Details" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Restaurant Stock Request Details</h2>
          <p className="text-accent">View detailed information about the stock request</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/restaurant-stock-requests')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-card bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Back to Requests
          </button>
        </div>

        <div className="max-w-7xl mx-auto">

        {message && (
          <div className="mb-4 text-center text-sm text-red-600">
            {message}
          </div>
        )}

        {/* Request Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Request ID</h3>
              <p className="text-lg font-semibold text-gray-900">{request._id.slice(-8)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Request Date</h3>
              <p className="text-lg font-semibold text-gray-900">{formatDate(request.requestDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Restaurant</h3>
              <p className="text-lg font-semibold text-gray-900">{request.restaurantId?.name || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.overallStatus)}`}>
                {request.overallStatus}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Requested By</h3>
            <p className="text-lg font-semibold text-gray-900">{request.requestedBy?.name || 'Unknown'}</p>
          </div>
          {request.fulfilledBy && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">Fulfilled By</h3>
              <p className="text-lg font-semibold text-gray-900">{request.fulfilledBy.name}</p>
            </div>
          )}
          {request.remarks && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">Remarks</h3>
              <p className="text-gray-700">{request.remarks}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Requested Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {request.items && request.items.length > 0 ? (
                  request.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemId?.name || 'Unknown Item'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.requestedQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.issuedQuantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getItemStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No items found in this request
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default RestaurantStockRequestDetail;
