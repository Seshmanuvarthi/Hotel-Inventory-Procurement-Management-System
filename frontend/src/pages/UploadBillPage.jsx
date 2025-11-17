import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const UploadBillPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // procurementOrderId
  const [order, setOrder] = useState(null);
  const [billData, setBillData] = useState({
    receivedItems: [],
    billDate: '',
    remarks: '',
    billImage: null
  });
  const [itemStatuses, setItemStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setMessage('Procurement order ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/procurement-orders/${id}`);
        setOrder(response.data);

        // Initialize item statuses - all approved items start as pending
        const initialStatuses = {};
        response.data.items.forEach((item, index) => {
          if (item.mdApprovalStatus === 'approved') {
            initialStatuses[index] = {
              status: 'pending',
              quantity: item.quantity
            };
          }
        });
        setItemStatuses(initialStatuses);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setMessage('Error fetching order details: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);
  

  const handleItemStatusChange = (index, status) => {
    setItemStatuses(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        status
      }
    }));
  };

  const handleQuantityChange = (index, quantity) => {
    setItemStatuses(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        quantity: parseFloat(quantity) || 0
      }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillData(prev => ({ ...prev, billImage: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!billData.billDate) {
      setMessage('Please select bill date');
      return;
    }

    // Check if at least one item has been processed
    const processedItems = Object.values(itemStatuses).filter(item =>
      item.status !== 'pending'
    );

    if (processedItems.length === 0) {
      setMessage('Please update the status for at least one item');
      return;
    }

    setSubmitLoading(true);
    setMessage('');

    try {
      const formData = new FormData();

      // Prepare received items data
      const receivedItemsData = Object.entries(itemStatuses).map(([index, data]) => ({
        index: parseInt(index),
        status: data.status,
        quantity: data.quantity
      }));

      formData.append('receivedItems', JSON.stringify(receivedItemsData));
      formData.append('billDate', billData.billDate);
      formData.append('remarks', billData.remarks);

      if (billData.billImage) {
        formData.append('billImage', billData.billImage);
      }

      await axiosInstance.post(`/procurement-orders/${id}/upload-bill`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Bill uploaded successfully!');
      setTimeout(() => {
        navigate('/store-dashboard');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error uploading bill');
    } finally {
      setSubmitLoading(false);
    }
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

  if (!order) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-xl text-red-600">Order not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-text-dark">Upload Bill</h2>
          <SecondaryButton onClick={() => navigate('/store-dashboard')}>
            Back to Dashboard
          </SecondaryButton>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Procurement Order Details</h3>
          <p className="text-sm text-blue-700">
            <strong>Order ID:</strong> {order._id.slice(-8)} | <strong>Status:</strong> {order.status} | <strong>Bill Number:</strong> {order.billNumber || 'N/A'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="billDate" className="block text-sm font-medium text-text-dark mb-1">
                Bill Date *
              </label>
              <input
                type="date"
                id="billDate"
                value={billData.billDate}
                onChange={(e) => setBillData(prev => ({ ...prev, billDate: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="billImage" className="block text-sm font-medium text-text-dark mb-1">
                Bill Image
              </label>
              <input
                type="file"
                id="billImage"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-text-dark mb-4">Items Received</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 border border-secondary/20 rounded-lg bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark">Item</label>
                      <p className="text-sm text-text-secondary">{item.itemId?.name || 'Unknown Item'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark">Ordered Qty</label>
                      <p className="text-sm text-text-secondary">{item.quantity} {item.unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark">Price per Unit</label>
                      <p className="text-sm text-text-secondary">₹{item.pricePerUnit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark">MD Approval</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.mdApprovalStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.mdApprovalStatus}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Received Status</label>
                      {item.mdApprovalStatus === 'approved' ? (
                        <div className="space-y-2">
                          <select
                            value={itemStatuses[index]?.status || 'pending'}
                            onChange={(e) => handleItemStatusChange(index, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-secondary/20 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            required
                          >
                            <option value="pending">Select Status</option>
                            <option value="received">Received Complete</option>
                            <option value="partial">Received Partial</option>
                            <option value="not_received">Not Received</option>
                          </select>
                          {(itemStatuses[index]?.status === 'received' || itemStatuses[index]?.status === 'partial') && (
                            <input
                              type="number"
                              placeholder="Received Qty"
                              value={itemStatuses[index]?.quantity || ''}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-secondary/20 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary"
                              min="0"
                              step="0.01"
                              required
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not Approved</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-text-dark mb-1">
              Remarks
            </label>
            <textarea
              id="remarks"
              value={billData.remarks}
              onChange={(e) => setBillData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Optional remarks"
            />
          </div>

          {message && (
            <div className={`text-center text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <SecondaryButton type="button" onClick={() => navigate('/store-dashboard')}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={submitLoading}>
              {submitLoading ? 'Uploading...' : 'Upload Bill'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UploadBillPage;
