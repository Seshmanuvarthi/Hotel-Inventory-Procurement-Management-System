import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StyledTable from '../components/StyledTable';
import StyledForm from '../components/StyledForm';
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react';

const MDApprovalDashboard = () => {
  // const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [approvedItems, setApprovedItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await axiosInstance.get('/procurement-orders');
      const pendingRequests = response.data.filter(req => req.status === 'pending_md_approval');
      setRequests(pendingRequests);
    } catch (error) {
      setMessage('Error fetching pending requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      await axiosInstance.patch(`/procurement-orders/${requestId}/approve`, {
        approvedItems,
        rejectedItems,
        remarks
      });
      setMessage('Request approved successfully!');
      setSelectedRequest(null);
      setRemarks('');
      setApprovedItems([]);
      setRejectedItems([]);
      fetchPendingRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error approving request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(true);
    try {
      await axiosInstance.patch(`/procurement-orders/${requestId}/reject`, { remarks });
      setMessage('Request rejected successfully!');
      setSelectedRequest(null);
      setRemarks('');
      setApprovedItems([]);
      setRejectedItems([]);
      fetchPendingRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error rejecting request');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setRemarks('');
    setApprovedItems([]);
    setRejectedItems([]);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setRemarks('');
    setApprovedItems([]);
    setRejectedItems([]);
  };

  const getTotalAmount = (items) => {
    return items?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;
  };

  const tableHeaders = ['Request ID', 'Date', 'Requested By', 'Items', 'Total Amount', 'Actions'];
  const tableData = requests.map((request) => [
    request._id.slice(-8),
    formatDate(request.requestDate),
    request.requestedBy?.name || 'Unknown',
    request.items?.length || 0,
    `₹${getTotalAmount(request.items).toLocaleString()}`,
    <div className="flex space-x-2">
      <PrimaryButton
        onClick={() => openModal(request)}
        className="text-xs px-3 py-1"
      >
        Review
      </PrimaryButton>
    </div>
  ]);

  if (loading) {
    return (
      <Layout title="MD Approval Dashboard" userRole={user.role}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="MD Approval Dashboard" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Procurement Approvals</h2>
          <p className="text-accent">Review and approve procurement requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <DashboardCard
            title="Pending Requests"
            value={requests.length}
            icon={Clock}
            color="warning"
            subtitle="Awaiting approval"
          />
          <DashboardCard
            title="Total Value"
            value={`₹${requests.reduce((sum, req) => sum + getTotalAmount(req.items), 0).toLocaleString()}`}
            icon={FileText}
            color="secondary"
            subtitle="Pending approvals"
          />
          <DashboardCard
            title="Action Required"
            value="Review Now"
            icon={AlertTriangle}
            color="primary"
            subtitle="Process requests"
          />
        </div>

        {message && (
          <div className={`text-center p-4 rounded-lg border ${
            message.includes('success')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Pending Approval Requests</h3>
          <StyledTable
            headers={tableHeaders}
            data={tableData}
            className="w-full"
          />
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Approval Guidelines</h3>
            <p className="text-sm text-accent">
              Carefully review all procurement requests. Ensure vendor pricing is competitive and quantities are reasonable.
              Add remarks for any special considerations during approval or rejection.
            </p>
          </div>
        </div>

        {/* Modal for Approval/Rejection */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl shadow-luxury max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-secondary/10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-text-dark">
                    Review Request - {selectedRequest._id.slice(-8)}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-text-dark/60 hover:text-text-dark transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-dark">Requested By</p>
                      <p className="text-accent">{selectedRequest.requestedBy?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-dark">Date</p>
                      <p className="text-accent">{formatDate(selectedRequest.requestDate)}</p>
                    </div>
                  </div>
                  {selectedRequest.remarks && (
                    <div>
                      <p className="text-sm font-medium text-text-dark">Request Remarks</p>
                      <p className="text-accent">{selectedRequest.remarks}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-text-dark mb-4">Items Requested</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedRequest.items?.map((item, index) => (
                      <div key={index} className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-text-dark">
                              {item.itemId?.name || 'Unknown Item'}
                            </p>
                            <div className="text-sm text-accent space-y-1 mt-1">
                              <p>Vendor: {item.vendorName}</p>
                              <p>Quantity: {item.quantity} {item.unit}</p>
                              <p>Price: ₹{item.pricePerUnit} per {item.unit}</p>
                            </div>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => {
                                  setApprovedItems(prev => [...prev, index]);
                                  setRejectedItems(prev => prev.filter(i => i !== index));
                                }}
                                className={`px-3 py-1 text-xs rounded ${
                                  approvedItems.includes(index)
                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                    : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
                                }`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectedItems(prev => [...prev, index]);
                                  setApprovedItems(prev => prev.filter(i => i !== index));
                                }}
                                className={`px-3 py-1 text-xs rounded ${
                                  rejectedItems.includes(index)
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                                }`}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">
                              ₹{item.totalAmount?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-secondary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-text-dark">Total Amount:</span>
                      <span className="text-xl font-bold text-primary">
                        ₹{getTotalAmount(selectedRequest.items).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <StyledForm.Textarea
                    label="Remarks (Optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks for approval/rejection"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <PrimaryButton
                    onClick={() => handleApprove(selectedRequest._id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading ? 'Processing...' : 'Approve'}</span>
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={() => handleReject(selectedRequest._id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{actionLoading ? 'Processing...' : 'Reject'}</span>
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MDApprovalDashboard;
