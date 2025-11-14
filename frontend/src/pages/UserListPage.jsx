import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';
import { Search, Eye, EyeOff, Trash2 } from 'lucide-react';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [hotelFilter, setHotelFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const roles = ['all', 'superadmin', 'md', 'procurement_officer', 'store_manager', 'hotel_manager', 'accounts'];

  useEffect(() => {
    fetchUsers();
    fetchHotels();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      const userData = response.data?.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await axiosInstance.get('/hotels');
      const hotelData = response.data?.data || [];
      setHotels(Array.isArray(hotelData) ? hotelData : []);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setHotels([]);
    }
  };

  const getHotelName = (hotelId) => {
    if (!hotelId) return 'N/A';
    const hotel = hotels.find(h => h && h._id === hotelId);
    return hotel ? `${hotel.name} (${hotel.branch})` : 'N/A';
  };

  const handleDisableUser = async (userId) => {
    if (!window.confirm('Are you sure you want to disable this user?')) return;

    try {
      await axiosInstance.patch(`/users/${userId}/disable`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert('Failed to disable user');
      console.error('Error disabling user:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axiosInstance.patch(`/users/${userId}/change-role`, { role: newRole });
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert('Failed to change user role');
      console.error('Error changing role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await axiosInstance.delete(`/users/${userId}`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesHotel = hotelFilter === 'all' || user.hotelId === hotelFilter;
    return matchesSearch && matchesRole && matchesHotel;
  });

  const tableHeaders = ['Name', 'Email', 'Role', 'Hotel', 'Status', 'Created At', 'Actions'];

  const tableData = filteredUsers.map(user => [
    user?.name || 'N/A',
    user?.email || 'N/A',
    user?.role ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A',
    getHotelName(user?.hotelId),
    user?.isActive ? 'Active' : 'Disabled',
    user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    <div key={user?._id || Math.random()} className="flex space-x-2">
      <SecondaryButton
        onClick={() => handleDisableUser(user?._id)}
        className="px-2 py-1 text-xs"
        disabled={!user?.isActive}
      >
        {user?.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </SecondaryButton>
      <select
        onChange={(e) => handleChangeRole(user?._id, e.target.value)}
        value={user?.role || ''}
        className="px-2 py-1 text-xs border rounded"
      >
        {roles.slice(1).map(role => (
          <option key={role} value={role}>
            {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </option>
        ))}
      </select>
      <SecondaryButton
        onClick={() => handleDeleteUser(user?._id)}
        className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </SecondaryButton>
    </div>
  ]);

  if (loading) {
    return (
      <Layout title="User List" userRole={user.role}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="User List" userRole={user.role}>
        <div className="text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="User List" userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-primary text-card rounded-xl p-6 shadow-luxury">
          <h2 className="text-2xl font-bold mb-2">User Management</h2>
          <p className="text-card/80">View and manage all users in the system</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Search */}
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

            {/* Role Filter */}
            <div className="min-w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Hotel Filter */}
            <div className="min-w-48">
              <select
                value={hotelFilter}
                onChange={(e) => setHotelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="all">All Hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.name} - {hotel.branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-text-dark/60">
            <span>Total Users: {users.length}</span>
            <span>Filtered: {filteredUsers.length}</span>
            <span>Active: {filteredUsers.filter(u => u.isActive).length}</span>
          </div>
        </div>

        {/* Table */}
        <StyledTable
          headers={tableHeaders}
          data={tableData}
          onRowClick={(row, index) => setExpandedRow(expandedRow === index ? null : index)}
          className="cursor-pointer"
        />

        {/* Expanded Row Details */}
        {expandedRow !== null && filteredUsers[expandedRow] && (
          <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>User ID:</strong> {filteredUsers[expandedRow]._id || 'N/A'}
              </div>
              <div>
                <strong>Updated At:</strong> {filteredUsers[expandedRow].updatedAt ? new Date(filteredUsers[expandedRow].updatedAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserListPage;
