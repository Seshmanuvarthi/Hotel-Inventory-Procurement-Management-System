import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const DeleteUserPage = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      const filteredUsers = response.data.data.filter(user => user.role === role);
      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleDisable = async (userId) => {
    if (!window.confirm('Are you sure you want to disable this user?')) return;

    try {
      await axiosInstance.patch(`/users/${userId}/disable`);
      setMessage('User disabled successfully!');
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Delete / Disable {role.replace('_', ' ').toUpperCase()}s</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
              <p className="text-gray-600 mb-1">Email: {user.email}</p>
              <p className="text-gray-600 mb-1">Role: {user.role}</p>
              {user.hotelId && (
                <p className="text-gray-600 mb-4">Hotel: {user.hotelId.name || 'N/A'}</p>
              )}
              <button
                onClick={() => handleDisable(user._id)}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Delete / Disable
              </button>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/superadmin-dashboard')}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserPage;
