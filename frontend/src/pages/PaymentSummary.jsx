import React, { useState } from 'react';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';
import axiosInstance from '../utils/axiosInstance';

const PaymentSummary = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    <Layout title="Payment Summary" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Payment Summary</h2>
          <p className="text-accent">Generate financial reports and payment analytics</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <StyledForm.Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <StyledForm.Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <PrimaryButton
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Summary'}
            </PrimaryButton>
          </div>

          {summary && (
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10 mt-6">
              <h3 className="text-xl font-semibold text-text-dark mb-4">Summary Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary font-medium">Total Procured</p>
                  <p className="text-2xl font-bold text-primary">₹{summary.totalProcured}</p>
                </div>
                <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                  <p className="text-sm text-secondary font-medium">Total Paid</p>
                  <p className="text-2xl font-bold text-secondary">₹{summary.totalPaid}</p>
                </div>
                <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                  <p className="text-sm text-warning font-medium">Total Pending</p>
                  <p className="text-2xl font-bold text-warning">₹{summary.totalPending}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Payment Summary Guidelines</h3>
            <p className="text-sm text-accent">
              Generate accurate payment summaries by selecting appropriate date ranges.
              Use this report for financial analysis and audit purposes.
              Ensure all payment data is up-to-date before generating reports.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSummary;
