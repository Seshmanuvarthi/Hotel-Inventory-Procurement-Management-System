import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';
import axiosInstance from '../utils/axiosInstance';

const EnterPaymentPage = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Only fetch MD approved procurement orders that are pending payment
        const response = await axiosInstance.get('/procurement-orders');
        const pendingPaymentOrders = response.data.filter(order => order.status === 'pending_payment');
        setBills(pendingPaymentOrders);
      } catch (error) {
        console.error('Error fetching procurement orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const handleBillChange = (e) => {
    const orderId = e.target.value;
    setSelectedBill(orderId);
    const order = bills.find(o => o._id === orderId);
    if (order) {
      setVendorName(order.vendorName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.patch(`/procurement-orders/${selectedBill}/pay`, {
        paymentMode
      });
      alert('Payment marked successfully');
      // Reset form
      setSelectedBill('');
      setVendorName('');
      setPaymentMode('cash');
    } catch (error) {
      alert('Error marking payment: ' + error.response?.data?.message);
    }
    setLoading(false);
  };

  const billOptions = bills.map(order => ({
    value: order._id,
    label: `${order.vendorName} - ${order.billNumber} - ₹${order.finalAmount}`
  }));

  const paymentModeOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank-transfer', label: 'Bank Transfer' }
  ];

  return (
    <Layout title="Enter Payment" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Enter Payment</h2>
          <p className="text-accent">Record vendor payments and maintain financial records</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <StyledForm.Select
                label="Procurement Bill"
                value={selectedBill}
                onChange={handleBillChange}
                options={billOptions}
                placeholder="Select Bill"
                required
              />

              <StyledForm.Input
                label="Vendor Name"
                type="text"
                value={vendorName}
                readOnly
                className="bg-secondary/5"
              />

              <StyledForm.Select
                label="Payment Mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                options={paymentModeOptions}
                required
              />

              <PrimaryButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Mark as Paid'}
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Payment Guidelines</h3>
            <p className="text-sm text-accent">
              Select the procurement order and mark it as paid once payment is completed.
              Choose the appropriate payment mode for record keeping.
              Stock will be automatically added to inventory after marking as paid.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnterPaymentPage;
