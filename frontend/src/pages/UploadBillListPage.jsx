import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const UploadBillListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/procurement-orders');
      // Filter orders that are approved by MD and not yet bill uploaded
      const eligibleOrders = response.data.filter(order =>
        order.status === 'md_approved' && !order.billUploadedAt
      );

      // Sort by creation date (newest first)
      eligibleOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(eligibleOrders);
    } catch (error) {
      setError('Error fetching orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBill = (orderId) => {
    navigate(`/upload-bill/${orderId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-text-dark">Upload Bills</h2>
          <SecondaryButton onClick={() => navigate('/store-dashboard')}>
            Back to Dashboard
          </SecondaryButton>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No bills to upload</div>
            <p className="text-gray-400 mt-2">Orders must be approved by MD before bills can be uploaded.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-card border border-secondary/20 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark">Order ID</label>
                        <p className="text-sm text-text-secondary">{order._id.slice(-8)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark">Bill Number</label>
                        <p className="text-sm text-text-secondary">{order.billNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark">Vendor</label>
                        <p className="text-sm text-text-secondary">{order.vendorName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark">Status</label>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-dark mb-2">Items</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items
                          .filter(item => item.mdApprovalStatus === 'approved')
                          .map((item, index) => (
                          <div key={index} className="text-xs bg-gray-50 px-2 py-1 rounded">
                            {item.itemId?.name || 'Unknown Item'} (Ordered: {item.quantity} {item.unit})
                            {item.receivedStatus && item.receivedStatus !== 'pending' && (
                              <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                                item.receivedStatus === 'received' ? 'bg-green-100 text-green-800' :
                                item.receivedStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.receivedStatus === 'received' ? 'Complete' :
                                 item.receivedStatus === 'partial' ? `Partial (${item.receivedQuantity})` :
                                 'Not Received'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Subtotal:</span> ₹{order.subtotal?.toFixed(2) || '0.00'}
                      </div>
                      <div>
                        <span className="font-medium">GST:</span> ₹{order.gstTotal?.toFixed(2) || '0.00'}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> ₹{order.finalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <PrimaryButton onClick={() => handleUploadBill(order._id)}>
                      Upload Bill
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UploadBillListPage;
