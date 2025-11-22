import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

const OutwardMaterialRequestsList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/outward-material-requests');
      setRequests(response.data);
    } catch (error) {
      setMessage('Error fetching outward material requests');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (id) => {
    if (!window.confirm('Are you sure you want to issue this outward material request?')) {
      return;
    }

    try {
      await axiosInstance.put(`/outward-material-requests/${id}/issue`);
      setMessage('Outward material request issued successfully');
      fetchRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error issuing outward material request');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      issued: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      header: 'Hotel',
      accessor: 'hotelId.name'
    },
    {
      header: 'Date',
      accessor: 'requestDate',
      cell: (value) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Items',
      accessor: 'items',
      cell: (value) => value.length
    },
    {
      header: 'Status',
      accessor: 'overallStatus',
      cell: (value) => getStatusBadge(value)
    },
    {
      header: 'Remarks',
      accessor: 'remarks'
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          {row.overallStatus === 'pending' && user.role !== 'hotel_manager' && (
            <PrimaryButton
              onClick={() => handleIssue(value)}
              className="text-xs px-3 py-1"
            >
              Issue
            </PrimaryButton>
          )}
          <SecondaryButton
            onClick={() => navigate(`/outward-material-request/${value}`)}
            className="text-xs px-3 py-1"
          >
            View
          </SecondaryButton>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="Outward Material Requests" userRole={user.role}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Outward Material Requests" userRole={user.role}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-text-dark mb-2">Outward Material Requests</h2>
            <p className="text-accent">Manage outward material requests</p>
          </div>
          <PrimaryButton
            onClick={() => navigate('/create-outward-material-request')}
          >
            Create New Request
          </PrimaryButton>
        </div>

        {message && (
          <div className={`text-center text-sm p-3 rounded-md ${message.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {message}
          </div>
        )}

        <div className="bg-card rounded-xl shadow-luxury p-6">
          <StyledTable
            columns={columns}
            data={requests}
            emptyMessage="No outward material requests found"
          />
        </div>
      </div>
    </Layout>
  );
};

export default OutwardMaterialRequestsList;
