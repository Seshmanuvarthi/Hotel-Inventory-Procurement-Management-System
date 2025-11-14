import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import axiosInstance from '../utils/axiosInstance';

const PendingPaymentsPage = () => {
  const navigate = useNavigate();
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        // Get MD approved procurement orders that are pending payment
        const response = await axiosInstance.get('/procurement-orders');
        const pendingOrders = response.data.filter(order => order.status === 'pending_payment');

        const formattedPendingPayments = pendingOrders.map(order => ({
          _id: order._id,
          vendorName: order.vendorName,
          billNumber: order.billNumber,
          finalAmount: order.finalAmount,
          totalPaid: 0, // Since payment is pending, total paid is 0
          pending: order.finalAmount,
          billDate: order.billDate,
          requestedBy: order.requestedBy?.name || 'Unknown'
        }));

        setPendingBills(formattedPendingPayments);
      } catch (error) {
        console.error('Error fetching pending payments:', error);
      }
      setLoading(false);
    };
    fetchPendingPayments();
  }, []);

  const tableHeaders = ['Vendor', 'Bill Number', 'Final Amount', 'Total Paid', 'Pending', 'Action'];
  const tableData = pendingBills.map(bill => [
    bill.vendorName,
    bill.billNumber,
    `₹${bill.finalAmount}`,
    `₹${bill.totalPaid}`,
    `₹${bill.pending}`,
    <button
      onClick={() => navigate(`/enter-payment/${bill._id}`)}
      className="text-green-600 hover:text-green-900 underline"
    >
      Make Payment
    </button>
  ]);

  if (loading) {
    return (
      <Layout title="Pending Payments" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading pending payments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Pending Payments" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Pending Payments</h2>
          <p className="text-accent">Track outstanding vendor payments and manage financial obligations</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Outstanding Payments Overview</h3>

            {pendingBills.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-xl text-secondary font-medium mb-2">All payments are up to date!</p>
                <p className="text-accent">No pending payments found.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex gap-4">
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700 font-medium">Pending Payments</p>
                    <p className="text-lg font-bold text-orange-800">
                      {pendingBills.length}
                    </p>
                  </div>
                </div>
                <StyledTable
                  headers={tableHeaders}
                  data={tableData}
                />
              </div>
            )}

            {pendingBills.length > 0 && (
              <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-warning font-medium">Total Outstanding Amount</p>
                    <p className="text-2xl font-bold text-warning">
                      ₹{pendingBills.reduce((sum, bill) => sum + bill.pending, 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-accent">Total pending items</p>
                    <p className="text-xl font-semibold text-text-dark">{pendingBills.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Pending Payments Guidelines</h3>
            <p className="text-sm text-accent">
              Review outstanding payments regularly to maintain good vendor relationships.
              Prioritize payments based on due dates and vendor terms.
              Use this dashboard to track payment progress and ensure timely settlements.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PendingPaymentsPage;
