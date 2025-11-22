import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import PrimaryButton from '../components/PrimaryButton';
import axiosInstance from '../utils/axiosInstance';

const IssueLogPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchIssueLogs();
  }, []);

  const fetchIssueLogs = async () => {
    try {
      const response = await axiosInstance.get('/store/issue/logs');
      setIssues(response.data);
    } catch (error) {
      setMessage('Error fetching issue logs');
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

  const showDetails = (issue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setShowModal(false);
  };

  const tableHeaders = ['Issue Number', 'Hotel', 'Date Issued', 'Items Count', 'Actions'];
  const tableData = issues.map((issue) => [
    issue.issueNumber,
    issue.hotelId?.name || 'Unknown Hotel',
    formatDate(issue.dateIssued),
    issue.items?.length || 0,
    <PrimaryButton
      key={issue._id}
      onClick={() => showDetails(issue)}
      className="px-3 py-1 text-sm"
    >
      View Details
    </PrimaryButton>
  ]);

  if (loading) {
    return (
      <Layout title="Issue Logs" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading issue logs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const totalIssues = issues.length;
  const totalItemsIssued = issues.reduce((sum, issue) => sum + (issue.items?.length || 0), 0);

  return (
    <Layout title="Issue Logs" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Issue Logs</h2>
          <p className="text-accent">Track all stock issuances and distribution history</p>
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
                <div className="text-3xl font-bold text-primary mb-2">{totalIssues}</div>
                <p className="text-sm text-accent">Total Issues</p>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{totalItemsIssued}</div>
                <p className="text-sm text-accent">Items Issued</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Stock Issuance History</h3>

            {issues.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-xl text-secondary font-medium mb-2">No issue logs found</p>
                <p className="text-accent">Stock issuance records will appear here once items are issued to hotels.</p>
              </div>
            ) : (
              <StyledTable
                headers={tableHeaders}
                data={tableData}
              />
            )}
          </div>
        </div>

        {/* Modal for Issue Details */}
        {showModal && selectedIssue && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-luxury max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-secondary/10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-text-dark">
                    Issue Details - {selectedIssue.issueNumber}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-accent hover:text-text-dark text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-secondary/5 p-3 rounded-lg">
                      <p className="text-sm text-accent font-medium">Hotel</p>
                      <p className="text-text-dark">{selectedIssue.hotelId?.name} - {selectedIssue.hotelId?.location}</p>
                    </div>
                    <div className="bg-secondary/5 p-3 rounded-lg">
                      <p className="text-sm text-accent font-medium">Date Issued</p>
                      <p className="text-text-dark">{formatDate(selectedIssue.dateIssued)}</p>
                    </div>
                    <div className="bg-secondary/5 p-3 rounded-lg">
                      <p className="text-sm text-accent font-medium">Issued By</p>
                      <p className="text-text-dark">{selectedIssue.issuedBy?.name || 'Unknown'}</p>
                    </div>
                    {selectedIssue.approvedBy && (
                      <div className="bg-secondary/5 p-3 rounded-lg">
                        <p className="text-sm text-accent font-medium">Approved By</p>
                        <p className="text-text-dark">{selectedIssue.approvedBy?.name || 'Unknown'}</p>
                      </div>
                    )}
                  </div>
                  {selectedIssue.remarks && (
                    <div className="bg-secondary/5 p-3 rounded-lg">
                      <p className="text-sm text-accent font-medium">Remarks</p>
                      <p className="text-text-dark">{selectedIssue.remarks}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-secondary/20 pt-6">
                  <h4 className="text-lg font-semibold text-text-dark mb-4">Items Issued</h4>
                  <div className="space-y-3">
                    {selectedIssue.items?.map((item, index) => (
                      <div key={index} className="bg-secondary/5 p-4 rounded-lg border border-secondary/10">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-text-dark">
                              {item.itemName || item.itemId?.name || 'Unknown Item'}
                            </p>
                            <p className="text-sm text-accent">
                              Quantity Issued: {item.quantityIssued} {item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-accent">
                              Stock After Issue: {item.previousStockAfterIssue}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Issue Log Guidelines</h3>
            <p className="text-sm text-accent">
              Review stock issuance history to track distribution patterns and maintain accurate inventory records.
              Use the detailed view to verify quantities and ensure proper documentation.
              All stock movements are logged for audit and compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IssueLogPage;
