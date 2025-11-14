import React, { useState } from 'react';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import StyledTable from '../components/StyledTable';
import PrimaryButton from '../components/PrimaryButton';
import axiosInstance from '../utils/axiosInstance';

const VendorLedger = () => {
  const [vendorName, setVendorName] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Layout title="Vendor Ledger" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Vendor Ledger</h2>
          <p className="text-accent">View detailed payment history and outstanding balances for vendors</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <StyledForm.Input
                  label="Vendor Name"
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter vendor name to search"
                />
              </div>
              <div className="flex items-end">
                <PrimaryButton
                  onClick={handleSearch}
                  disabled={loading || !vendorName.trim()}
                >
                  {loading ? 'Searching...' : 'Search'}
                </PrimaryButton>
              </div>
            </div>
          </div>

          {ledger.length > 0 && (
            <div className="space-y-6">
              {ledger.map(item => (
                <div key={item.bill._id} className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
                  <h3 className="text-xl font-semibold text-text-dark mb-4">
                    Bill: {item.bill.vendorName} - {item.bill.billNumber}
                  </h3>

                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-text-dark mb-3">Payment History</h4>
                    <StyledTable
                      headers={['Amount Paid', 'Payment Mode', 'Payment Date', 'Paid By']}
                      data={item.payments.map(payment => [
                        `₹${payment.amountPaid}`,
                        payment.paymentMode,
                        new Date(payment.paymentDate).toLocaleDateString(),
                        payment.paidBy.name
                      ])}
                    />
                  </div>

                  <div className="flex justify-end gap-6 pt-4 border-t border-secondary/20">
                    <div className="text-right">
                      <p className="text-sm text-secondary font-medium">Total Paid</p>
                      <p className="text-xl font-bold text-secondary">₹{item.totalPaid}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-warning font-medium">Pending</p>
                      <p className="text-xl font-bold text-warning">₹{item.pending}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ledger.length === 0 && vendorName && !loading && (
            <div className="bg-card rounded-xl shadow-luxury p-8 border border-secondary/10 text-center">
              <p className="text-accent">No ledger data found for this vendor.</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Vendor Ledger Guidelines</h3>
            <p className="text-sm text-accent">
              Search for vendors by name to view their complete payment history and outstanding balances.
              Use this information for financial planning and vendor relationship management.
              All payment records are maintained for audit and compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorLedger;
