import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
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
      <Layout title="Procurement Order Details" userRole={JSON.parse(localStorage.getItem('user') || '{}').role}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading procurement order details...</div>
        </div>
      </Layout>
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout title="Procurement Order Details" userRole={user.role}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-primary text-card rounded-xl p-6 shadow-luxury">
          <h2 className="text-2xl font-bold mb-2">Procurement Order Details</h2>
          <p className="text-card/80">View detailed information about this procurement order</p>
        </div>

        {message && (
          <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {message}
          </div>
        )}

        {/* Order Header */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-accent uppercase tracking-wide mb-2">Order ID</h3>
              <p className="text-lg font-semibold text-text-dark">{request._id.slice(-8)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-accent uppercase tracking-wide mb-2">Bill Date</h3>
              <p className="text-lg font-semibold text-text-dark">{request.billDate ? formatDate(request.billDate) : 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-accent uppercase tracking-wide mb-2">Vendor</h3>
              <p className="text-lg font-semibold text-text-dark">{request.vendorName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-accent uppercase tracking-wide mb-2">Status</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-xl shadow-luxury border border-secondary/10 p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Order Items</h3>
          {request.items && request.items.length > 0 ? (
            <StyledTable
              headers={['Item Name', 'Quantity', 'Unit', 'Price/Unit', 'Total']}
              data={request.items
                .filter(item => item.mdApprovalStatus === 'approved')
                .map((item, index) => [
                  item.itemId?.name || 'Unknown Item',
                  item.receivedQuantity && item.receivedQuantity > 0 ? item.receivedQuantity : item.quantity,
                  item.unit,
                  `₹${item.pricePerUnit}`,
                  `₹${item.totalAmount}`
                ])}
            />
          ) : (
            <div className="text-center py-8 text-text-dark/60">
              No items found in this order
            </div>
          )}
        </div>

        {/* Bill Image Display */}
        {request.billImageUrl && (
          <div className="bg-card rounded-xl shadow-luxury border border-secondary/10 p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Bill Image</h3>
            <div className="flex justify-center">
              <img
                src={request.billImageUrl}
                alt="Bill"
                className="max-w-full h-auto max-h-96 rounded-lg shadow-luxury"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary/10">
          <SecondaryButton
            onClick={() => navigate('/bills')}
            className="flex-1"
          >
            Back to Bills
          </SecondaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default ProcurementRequestDetail;
