import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => navigate('/superadmin-add-options')}
            className="bg-green-500 text-white px-8 py-16 rounded-lg shadow-md hover:bg-green-600 text-2xl font-bold"
          >
            Add
          </button>
          <button
            onClick={() => navigate('/superadmin-delete-options')}
            className="bg-red-500 text-white px-8 py-16 rounded-lg shadow-md hover:bg-red-600 text-2xl font-bold"
          >
            Delete / Disable
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
