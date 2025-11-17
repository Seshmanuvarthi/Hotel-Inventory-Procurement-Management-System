import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const BillsListPage = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axiosInstance.get('/procurement-orders');
      // Show all orders that have been processed (MD approved and beyond)
      const processedOrders = response.data.filter(order =>
        ['md_approved', 'pending_payment', 'paid'].includes(order.status)
      );
      setBills(processedOrders);
    } catch (error) {
      setMessage('Error fetching bills');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-dark">Previous Orders</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/upload-bill')}
              className="w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-card bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              Upload New Bill
            </button>
            <button
              onClick={() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role === 'superadmin') navigate('/superadmin-dashboard');
                else if (user.role === 'procurement_officer') navigate('/procurement-dashboard');
                else if (user.role === 'accounts') navigate('/accounts-dashboard');
                else if (user.role === 'md') navigate('/md-reports-dashboard');
                else if (user.role === 'store_manager') navigate('/store-dashboard');
                else if (user.role === 'hotel_manager') navigate('/hotel-dashboard');
                else navigate('/login');
              }}
              className="w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-card bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {message}
          </div>
        )}

        <div className="bg-card shadow-luxury overflow-hidden rounded-lg border border-secondary/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary/20">
              <thead className="bg-secondary/5">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Bill ID
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
                    Total Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-secondary/10">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 sm:px-6 py-4 text-center text-text-dark">
                      No bills found
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-secondary/5 transition-colors duration-200">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                        {bill._id.slice(-8)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {bill.vendorName}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {bill.billNumber || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {bill.uploadDate ? formatDate(bill.uploadDate) : formatDate(bill.updatedAt)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        <div className="space-y-1">
                          {bill.calculatedAmount ? (
                            <>
                              <div>₹{bill.calculatedAmount.toFixed(2)}</div>
                              {bill.finalAmount && bill.finalAmount !== bill.calculatedAmount && (
                                <div className="text-xs text-accent">
                                  Vendor: ₹{bill.finalAmount.toFixed(2)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div>₹{bill.finalAmount?.toFixed(2) || '0.00'}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {bill.status === 'md_approved' ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            MD Approved
                          </span>
                        ) : bill.status === 'pending_payment' ? (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            Pending Payment
                          </span>
                        ) : bill.status === 'paid' ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {bill.uploadedBy?.name || 'Unknown'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/procurement-orders/${bill._id}`)}
                          className="text-secondary hover:text-secondary/80 transition-colors duration-200"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsListPage;
