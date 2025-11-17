import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const EnterPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosInstance.get(`/procurement-orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.patch(`/procurement-orders/${id}/pay`, {
        paymentMode
      });
      alert('Payment marked successfully');
      navigate('/bills');
    } catch (error) {
      alert('Error marking payment: ' + error.response?.data?.message);
    }
    setLoading(false);
  };

  const paymentModeOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank-transfer', label: 'Bank Transfer' }
  ];

  if (!order) {
    return (
      <Layout title="Enter Payment" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Enter Payment" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Enter Payment</h2>
          <p className="text-accent">Record vendor payment for this procurement order</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <div className="mb-6 p-4 bg-secondary/5 rounded-lg">
              <h3 className="font-semibold text-text-dark mb-2">Order Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-accent">Vendor:</span>
                  <span className="ml-2 font-medium">{order.vendorName}</span>
                </div>
                <div>
                  <span className="text-accent">Bill Number:</span>
                  <span className="ml-2 font-medium">{order.billNumber}</span>
                </div>
                <div>
                  <span className="text-accent">Calculated Amount:</span>
                  <span className="ml-2 font-medium">₹{order.calculatedAmount?.toFixed(2) || order.finalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-accent">Original Amount:</span>
                  <span className="ml-2 font-medium">₹{order.finalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <StyledForm.Select
                label="Payment Mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                options={paymentModeOptions}
                required
              />

              <div className="flex space-x-4">
                <PrimaryButton
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Processing...' : 'Mark as Paid'}
                </PrimaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() => navigate('/bills')}
                  className="flex-1"
                >
                  Cancel
                </SecondaryButton>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Payment Guidelines</h3>
            <p className="text-sm text-accent">
              Review the order details and calculated amounts. Mark as paid once payment is completed.
              Choose the appropriate payment mode for record keeping.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnterPaymentPage;
