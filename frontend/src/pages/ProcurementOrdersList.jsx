import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';

const ProcurementOrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/procurement-orders');
      setOrders(response.data);
    } catch (error) {
      setMessage('Error fetching procurement orders');
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_md_approval': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending MD Approval' },
      'md_approved': { color: 'bg-blue-100 text-blue-800', label: 'MD Approved' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      'pending_payment': { color: 'bg-orange-100 text-orange-800', label: 'Pending Payment' },
      'paid': { color: 'bg-green-100 text-green-800', label: 'Paid' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const canApproveOrder = (order) => {
    return user.role === 'md' || user.role === 'superadmin';
  };

  const canMarkAsPaid = (order) => {
    return (user.role === 'accounts' || user.role === 'superadmin') && order.status === 'pending_payment';
  };

  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to approve this procurement order?')) return;

    try {
      await axiosInstance.patch(`/procurement-orders/${orderId}/approve`);
      setMessage('Order approved successfully');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error approving order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const remarks = prompt('Enter rejection remarks:');
    if (!remarks) return;

    try {
      await axiosInstance.patch(`/procurement-orders/${orderId}/reject`, { remarks });
      setMessage('Order rejected successfully');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error rejecting order');
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    const paymentMode = prompt('Enter payment mode (upi/cash/bank-transfer):');
    if (!['upi', 'cash', 'bank-transfer'].includes(paymentMode)) {
      alert('Invalid payment mode. Please enter upi, cash, or bank-transfer');
      return;
    }

    try {
      await axiosInstance.patch(`/procurement-orders/${orderId}/pay`, { paymentMode });
      setMessage('Payment marked successfully');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error marking payment');
    }
  };

  if (loading) {
    return (
      <Layout title="Procurement Orders" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading procurement orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Procurement Orders" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Procurement Orders</h2>
          <p className="text-accent">Manage procurement orders and approvals</p>
        </div>

        {message && (
          <div className={`text-center text-sm p-3 rounded-md ${message.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {message}
          </div>
        )}

        <div className="bg-card shadow-luxury overflow-hidden rounded-lg border border-secondary/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary/20">
              <thead className="bg-secondary/5">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Bill Number
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Bill Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-secondary/10">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 sm:px-6 py-4 text-center text-text-dark">
                      No procurement orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-secondary/5 transition-colors duration-200">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                        {order._id.slice(-8)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {order.vendorName}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {order.billNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {formatDate(order.billDate)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        <div className="space-y-1">
                          <div>₹{order.finalAmount?.toFixed(2) || '0.00'}</div>
                          {order.calculatedAmount && order.calculatedAmount !== order.finalAmount && (
                            <div className="text-xs text-accent">
                              Calc: ₹{order.calculatedAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {order.requestedBy?.name || 'Unknown'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => navigate(`/procurement-orders/${order._id}`)}
                          className="text-secondary hover:text-secondary/80 transition-colors duration-200"
                        >
                          View
                        </button>
                        {canApproveOrder(order) && order.status === 'pending_md_approval' && (
                          <>
                            <button
                              onClick={() => handleApproveOrder(order._id)}
                              className="text-green-600 hover:text-green-800 transition-colors duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order._id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {canMarkAsPaid(order) && (
                          <button
                            onClick={() => handleMarkAsPaid(order._id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProcurementOrdersList;
