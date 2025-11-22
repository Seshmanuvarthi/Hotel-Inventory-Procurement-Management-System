import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const ProcurementRequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequestDetail();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRequestDetail = async () => {
    try {
      const response = await axiosInstance.get(`/procurement-orders/${id}`);
      setRequest(response.data);
    } catch (error) {
      setMessage('Error fetching procurement request details');
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
            <p className="text-gray-500 mb-8">The procurement request you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/bills')}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Bills
            </button>
        </div>

        {/* Bill Amount Summary */}
        <div className="bg-white shadow rounded-lg p-6 mt-6 max-w-sm mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <span className="font-semibold">Subtotal:</span>
            <span>₹{request.subtotal?.toFixed(2) || '0.00'}</span>

            <span className="font-semibold">GST Total:</span>
            <span>₹{request.gstTotal?.toFixed(2) || '0.00'}</span>

            <span className="font-semibold text-lg text-gray-900">Final Amount:</span>
            <span className="text-lg font-semibold text-gray-900">₹{request.finalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Procurement Request Details</h2>
          <button
            onClick={() => navigate('/bills')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Bills
          </button>
        </div>

        {message && (
          <div className="mb-4 text-center text-sm text-red-600">
            {message}
          </div>
        )}

        {/* Request Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
              <p className="text-lg font-semibold text-gray-900">{request._id.slice(-8)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bill Date</h3>
              <p className="text-lg font-semibold text-gray-900">{request.billDate ? formatDate(request.billDate) : 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Vendor</h3>
              <p className="text-lg font-semibold text-gray-900">{request.vendorName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {request.items && request.items.length > 0 ? (
                  request.items
                    .filter(item => item.mdApprovalStatus === 'approved')
                    .map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.itemId?.name || 'Unknown Item'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.receivedQuantity && item.receivedQuantity > 0 ? item.receivedQuantity : item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{item.pricePerUnit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{item.totalAmount}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No items found in this order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Image Display */}
        {request.billImageUrl && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Image</h3>
            <div className="flex justify-center">
              <img
                src={request.billImageUrl}
                alt="Bill"
                className="max-w-full h-auto max-h-96 rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcurementRequestDetail;
