import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const EnterPaymentPage = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentDate, setPaymentDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axiosInstance.get('/procurement/bills');
        setBills(response.data);
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };
    fetchBills();
  }, []);

  const handleBillChange = (e) => {
    const billId = e.target.value;
    setSelectedBill(billId);
    const bill = bills.find(b => b._id === billId);
    if (bill) {
      setVendorName(bill.vendorName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/payments', {
        procurementBillId: selectedBill,
        amountPaid: parseFloat(amountPaid),
        paymentMode,
        paymentDate,
        remarks
      });
      alert('Payment entered successfully');
      // Reset form
      setSelectedBill('');
      setVendorName('');
      setAmountPaid('');
      setPaymentMode('cash');
      setPaymentDate('');
      setRemarks('');
    } catch (error) {
      alert('Error entering payment: ' + error.response?.data?.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Enter Payment</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Procurement Bill</label>
            <select
              value={selectedBill}
              onChange={handleBillChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Bill</option>
              {bills.map(bill => (
                <option key={bill._id} value={bill._id}>
                  {bill.vendorName} - {bill.billNumber} - ₹{bill.finalAmount}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Vendor Name</label>
            <input
              type="text"
              value={vendorName}
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Amount Paid</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank-transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          >
            {loading ? 'Submitting...' : 'Enter Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterPaymentPage;
