import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';
import { Building, UserPlus, Eye, EyeOff } from 'lucide-react';

const AddUserOrHotelPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || '';
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    location: '',
    code: '',
    hotelId: ''
  });
  const [hotels, setHotels] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'hotel_manager') {
      fetchHotels();
    }
  }, [type]);

  const fetchHotels = async () => {
    try {
      const response = await axiosInstance.get('/hotels');
      setHotels(response.data.data);
    } catch (err) {
      setError('Failed to fetch hotels');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      if (type === 'hotel') {
        await axiosInstance.post('/hotels', {
          name: formData.name,
          branch: formData.branch,
          location: formData.location,
          code: formData.code
        });
        setMessage('Hotel created successfully!');
      } else {
        await axiosInstance.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: type,
          hotelId: type === 'hotel_manager' ? formData.hotelId : undefined
        });
        setMessage('User created successfully!');
      }
      setFormData({
        name: '',
        email: '',
        password: '',
        branch: '',
        location: '',
        code: '',
        hotelId: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (type === 'hotel') return 'Add New Hotel';
    return `Add ${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  };

  const getIcon = () => {
    return type === 'hotel' ? Building : UserPlus;
  };

  const renderForm = () => {
    if (type === 'hotel') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Hotel Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
              placeholder="Enter hotel name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Branch *
            </label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
              placeholder="Enter branch name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
              placeholder="Enter location"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Code (Optional)
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
              placeholder="Enter hotel code"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dark/60 hover:text-text-dark"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Role
            </label>
            <input
              type="text"
              value={type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              className="w-full px-4 py-3 border border-secondary/20 rounded-lg bg-secondary/10 text-text-dark/80"
              readOnly
            />
          </div>
          {type === 'hotel_manager' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-dark mb-2">
                Assigned Hotel *
              </label>
              <select
                name="hotelId"
                value={formData.hotelId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
                required
              >
                <option value="">Select Hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.name} - {hotel.branch}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Layout title={getTitle()} userRole={user.role}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-primary text-card rounded-xl p-6 shadow-luxury">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-card/20 rounded-full">
              {React.createElement(getIcon(), { className: "w-8 h-8" })}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{getTitle()}</h2>
              <p className="text-card/80">
                {type === 'hotel' ? 'Create a new hotel location' : 'Add a new user to the system'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderForm()}

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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary/10">
              <PrimaryButton
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : (type === 'hotel' ? 'Create Hotel' : 'Create User')}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={() => navigate('/superadmin-add-options')}
                className="flex-1"
              >
                Back to Options
              </SecondaryButton>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddUserOrHotelPage;
