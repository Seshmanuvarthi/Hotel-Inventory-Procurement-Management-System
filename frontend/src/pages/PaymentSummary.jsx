import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const PaymentSummary = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const response = await axiosInstance.get('/payments/summary', { params });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      setSummary(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Payment Summary</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          >
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
        {summary && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-2">
              <p><strong>Total Procured:</strong> ₹{summary.totalProcured}</p>
              <p><strong>Total Paid:</strong> ₹{summary.totalPaid}</p>
              <p><strong>Total Pending:</strong> ₹{summary.totalPending}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSummary;
