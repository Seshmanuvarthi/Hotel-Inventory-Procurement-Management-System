import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StyledTable from '../components/StyledTable';
import axiosInstance from '../utils/axiosInstance';
import { Trash2, UserX, AlertTriangle, Search } from 'lucide-react';

const DeleteUserPage = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchHotels();
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      const filteredUsers = response.data.data.filter(user => user.role === role);
      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await axiosInstance.get('/hotels');
      setHotels(response.data.data);
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    }
  };

  const getHotelName = (hotelId) => {
    const hotel = hotels.find(h => h._id === hotelId);
    return hotel ? `${hotel.name} - ${hotel.branch}` : 'N/A';
  };

  const handleDisable = async (userId) => {
    if (!window.confirm('Are you sure you want to disable this user? This action cannot be undone.')) return;

    try {
      await axiosInstance.patch(`/users/${userId}/disable`);
      setMessage('User disabled successfully!');
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableHeaders = ['Name', 'Email', 'Hotel', 'Status', 'Actions'];

  const tableData = filteredUsers.map(user => [
    user?.name || 'N/A',
    user?.email || 'N/A',
    user?.hotelId ? getHotelName(user.hotelId) : 'N/A',
    user?.isActive ? 'Active' : 'Disabled',
    <PrimaryButton
      key={user?._id}
      onClick={() => handleDisable(user?._id)}
      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
    >
      <Trash2 className="w-4 h-4 mr-1" />
      Disable
    </PrimaryButton>
  ]);

  if (loading) {
    return (
      <Layout title={`Delete / Disable ${role?.replace('_', ' ').toUpperCase()}s`} userRole={user.role}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Delete / Disable ${role?.replace('_', ' ').toUpperCase()}s`} userRole={user.role}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-red-600 text-white rounded-xl p-6 shadow-luxury">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <UserX className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Delete / Disable {role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}s
              </h2>
              <p className="text-white/80">Manage and disable user accounts</p>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 text-sm">
              <strong>Warning:</strong> Disabling a user will prevent them from accessing the system. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
            <div className="text-sm text-text-dark/60 flex items-center">
              Total Users: {users.length} | Filtered: {filteredUsers.length}
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200 text-green-600">
            {message}
          </div>
        )}
        {error && (
          <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        <StyledTable
          headers={tableHeaders}
          data={tableData}
          className="cursor-pointer"
        />

        {/* Back Button */}
        <div className="flex justify-center">
          <SecondaryButton
            onClick={() => navigate('/superadmin-delete-options')}
            className="px-8"
          >
            Back to Delete Options
          </SecondaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default DeleteUserPage;
