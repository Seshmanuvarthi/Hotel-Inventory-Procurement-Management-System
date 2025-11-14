import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const PendingPaymentsPage = () => {
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const response = await axiosInstance.get('/payments/pending');
        setPendingBills(response.data);
      } catch (error) {
        console.error('Error fetching pending payments:', error);
      }
      setLoading(false);
    };
    fetchPendingPayments();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Pending Payments</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {pendingBills.length === 0 ? (
            <p className="text-gray-600">No pending payments.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Vendor</th>
                  <th className="p-2 text-left">Bill Number</th>
                  <th className="p-2 text-left">Final Amount</th>
                  <th className="p-2 text-left">Total Paid</th>
                  <th className="p-2 text-left">Pending</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills.map(bill => (
                  <tr key={bill._id} className="border-b">
                    <td className="p-2">{bill.vendorName}</td>
                    <td className="p-2">{bill.billNumber}</td>
                    <td className="p-2">₹{bill.finalAmount}</td>
                    <td className="p-2">₹{bill.totalPaid}</td>
                    <td className="p-2">₹{bill.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingPaymentsPage;
