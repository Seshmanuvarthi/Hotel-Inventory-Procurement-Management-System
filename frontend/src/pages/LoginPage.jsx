import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on user role
      const userRole = response.data.user.role;
      switch (userRole) {
        case 'superadmin':
          navigate('/superadmin-dashboard');
          break;
        case 'procurement_officer':
          navigate('/procurement-dashboard');
          break;
        case 'store_manager':
          navigate('/store-dashboard');
          break;
        case 'hotel_manager':
          navigate('/hotel-dashboard');
          break;
        case 'accounts':
          navigate('/accounts-dashboard');
          break;
        case 'md':
          navigate('/md-approvals');
          break;
        default:
          navigate('/superadmin-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-luxury w-full max-w-sm sm:max-w-md border border-secondary/10">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-text-dark">Login to Hotel ERP</h2>
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-secondary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-secondary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-card py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
