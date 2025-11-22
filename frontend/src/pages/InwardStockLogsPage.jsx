import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import axiosInstance from '../utils/axiosInstance';

const InwardStockLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchInwardLogs();
  }, []);

  const fetchInwardLogs = async () => {
    try {
      const response = await axiosInstance.get('/store/inward-logs');
      setLogs(response.data);
    } catch (error) {
      setMessage('Error fetching inward stock logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tableHeaders = ['Date', 'Item', 'Quantity', 'Unit', 'Vendor', 'Procurement Order', 'Received By', 'Remarks'];
  const tableData = logs.map((log) => [
    formatDate(log.date),
    log.itemName,
    log.quantity,
    log.unit,
    log.vendor,
    log.procurementOrder,
    log.receivedBy,
    log.remarks || 'N/A'
  ]);

  if (loading) {
    return (
      <Layout title="Inward Stock Logs" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading inward stock logs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const totalItems = logs.length;
  const totalQuantity = logs.reduce((sum, log) => sum + (log.quantity || 0), 0);

  return (
    <Layout title="Inward Stock Logs" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Inward Stock Logs</h2>
          <p className="text-accent">Track all stock receipts from procurements</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {message && (
            <div className="mb-6 text-center p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{totalItems}</div>
                <p className="text-sm text-accent">Total Inward Entries</p>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{totalQuantity}</div>
                <p className="text-sm text-accent">Total Quantity Received</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Stock Receipt History</h3>

            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl text-secondary font-medium mb-2">No inward logs found</p>
                <p className="text-accent">Stock receipt records will appear here once items are received from procurements.</p>
              </div>
            ) : (
              <StyledTable
                headers={tableHeaders}
                data={tableData}
              />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Inward Logs Guidelines</h3>
            <p className="text-sm text-accent">
              Review stock receipt history to track procurement fulfillment and maintain accurate inventory records.
              Use the detailed view to verify quantities and ensure proper documentation.
              All inward movements are logged for audit and compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InwardStockLogsPage;
