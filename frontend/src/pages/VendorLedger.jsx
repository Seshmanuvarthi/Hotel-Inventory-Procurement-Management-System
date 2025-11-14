import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const VendorLedger = () => {
  const [vendorName, setVendorName] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!vendorName) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/payments/vendor/${vendorName}`);
      setLedger(response.data);
    } catch (error) {
      console.error('Error fetching vendor ledger:', error);
      setLedger([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Vendor Ledger</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex">
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Enter Vendor Name"
              className="flex-1 p-2 border border-gray-300 rounded-l"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        {ledger.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {ledger.map(item => (
              <div key={item.bill._id} className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Bill: {item.bill.vendorName} - {item.bill.billNumber}</h2>
                <div className="mb-4">
                  <h3 className="font-semibold">Payments:</h3>
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left">Amount Paid</th>
                        <th className="p-2 text-left">Payment Mode</th>
                        <th className="p-2 text-left">Payment Date</th>
                        <th className="p-2 text-left">Paid By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.payments.map(payment => (
                        <tr key={payment._id} className="border-b">
                          <td className="p-2">₹{payment.amountPaid}</td>
                          <td className="p-2">{payment.paymentMode}</td>
                          <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="p-2">{payment.paidBy.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right">
                  <p><strong>Total Paid:</strong> ₹{item.totalPaid}</p>
                  <p><strong>Pending:</strong> ₹{item.pending}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorLedger;
