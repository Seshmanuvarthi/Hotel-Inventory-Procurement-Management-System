import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const PendingRestaurantStockRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [fulfillModal, setFulfillModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [itemsToIssue, setItemsToIssue] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/restaurant-stock-requests/pending');
      setRequests(response.data);
    } catch (error) {
      setMessage('Error fetching pending restaurant stock requests');
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

  const handleFulfillClick = (request) => {
    setSelectedRequest(request);
    setItemsToIssue(request.items.map(item => ({
      itemId: item.itemId._id,
      quantity: Math.min(item.requestedQuantity - item.issuedQuantity, item.requestedQuantity)
    })));
    setFulfillModal(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectModal(true);
  };

  const handleFulfillSubmit = async (e) => {
    e.preventDefault();

    const validItems = itemsToIssue.filter(item => item.quantity > 0);
    if (validItems.length === 0) {
      setMessage('Please specify quantities to issue');
      return;
    }

    try {
      await axiosInstance.patch(`/restaurant-stock-requests/${selectedRequest._id}/fulfill`, {
        itemsToIssue: validItems
      });

      setMessage('Request fulfilled successfully');
      setFulfillModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error fulfilling request');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.patch(`/restaurant-stock-requests/${selectedRequest._id}/reject`, {
        remarks
      });

      setMessage('Request rejected successfully');
      setRejectModal(false);
      setSelectedRequest(null);
      setRemarks('');
      fetchRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error rejecting request');
    }
  };

  const updateItemQuantity = (index, quantity) => {
    const updated = [...itemsToIssue];
    updated[index].quantity = parseFloat(quantity) || 0;
    setItemsToIssue(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Pending Restaurant Stock Requests</h2>
          <button
            onClick={() => navigate('/store-dashboard')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`mb-4 text-center text-sm p-3 rounded-md ${message.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {message}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No pending restaurant stock requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.restaurantId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.requestDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.requestedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.overallStatus)}`}>
                        {request.overallStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/restaurant-stock-request/${request._id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleFulfillClick(request)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Fulfill
                      </button>
                      <button
                        onClick={() => handleRejectClick(request)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fulfill Modal */}
      {fulfillModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fulfill Stock Request</h3>
              <form onSubmit={handleFulfillSubmit}>
                <div className="space-y-4">
                  {selectedRequest.items.map((item, index) => (
                    <div key={item._id} className="border rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{item.itemId?.name}</span>
                        <span className="text-sm text-gray-500">
                          Requested: {item.requestedQuantity} {item.unit} |
                          Already Issued: {item.issuedQuantity} {item.unit}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quantity to Issue
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={itemsToIssue[index]?.quantity || 0}
                          onChange={(e) => updateItemQuantity(index, e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          max={item.requestedQuantity - item.issuedQuantity}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setFulfillModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Fulfill Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Stock Request</h3>
              <form onSubmit={handleRejectSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Reason for rejection"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setRejectModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRestaurantStockRequests;
