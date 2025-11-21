import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const AddItemPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    bottleSize: '',
    gstApplicable: false,
    vendors: [{ vendorName: '', lastPrice: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const categories = ["Grocery", "Vegetables", "Dairy", "Meat", "Spices", "Bar", "Other"];
  const units = ["kg", "g", "litre", "ml", "piece", "packet", "dozen", "bottle", "can", "box"];

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axiosInstance.get('/vendors');
        setVendors(response.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleVendorChange = (index, field, value) => {
    const updatedVendors = [...formData.vendors];
    updatedVendors[index][field] = value;
    setFormData({ ...formData, vendors: updatedVendors });
  };

  const addVendor = () => {
    setFormData({
      ...formData,
      vendors: [...formData.vendors, { vendorName: '', lastPrice: '' }]
    });
  };

  const removeVendor = (index) => {
    if (formData.vendors.length > 1) {
      const updatedVendors = formData.vendors.filter((_, i) => i !== index);
      setFormData({ ...formData, vendors: updatedVendors });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        ...formData,
        vendors: formData.vendors.map(v => ({
          vendorName: v.vendorName,
          lastPrice: parseFloat(v.lastPrice)
        }))
      };

      await axiosInstance.post('/items', payload);
      setMessage('Item created successfully!');
      setFormData({
        name: '',
        category: '',
        unit: '',
        gstApplicable: false,
        vendors: [{ vendorName: '', lastPrice: '' }]
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add New Item" userRole={user.role}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-primary text-card rounded-xl p-6 shadow-luxury">
          <h2 className="text-2xl font-bold mb-2">Add New Item</h2>
          <p className="text-card/80">Create a new item with vendor information</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
                  Item Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-dark mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-text-dark mb-2">
                  Unit *
                </label>
                <select
                  id="unit"
                  name="unit"
                  required
                  className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="">Select Unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="gstApplicable"
                  name="gstApplicable"
                  type="checkbox"
                  className="h-5 w-5 text-primary focus:ring-primary border-secondary/20 rounded"
                  checked={formData.gstApplicable}
                  onChange={handleInputChange}
                />
                <label htmlFor="gstApplicable" className="ml-3 block text-sm font-medium text-text-dark">
                  GST Applicable
                </label>
              </div>
            </div>

            {/* Vendors Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-dark">Vendors *</h3>
              {loadingVendors ? (
                <div className="text-center py-4">Loading vendors...</div>
              ) : (
                <>
                  {formData.vendors.map((vendor, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border border-secondary/20 rounded-lg bg-secondary/5">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Vendor Name
                        </label>
                        <select
                          required
                          className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
                          value={vendor.vendorName}
                          onChange={(e) => handleVendorChange(index, 'vendorName', e.target.value)}
                        >
                          <option value="">Select Vendor</option>
                          {vendors.map(v => (
                            <option key={v._id} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Last Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Last Price"
                          required
                          className="w-full px-4 py-3 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text-dark"
                          value={vendor.lastPrice}
                          onChange={(e) => handleVendorChange(index, 'lastPrice', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        {formData.vendors.length > 1 && (
                          <SecondaryButton
                            type="button"
                            onClick={() => removeVendor(index)}
                            className="px-4 py-3"
                          >
                            Remove
                          </SecondaryButton>
                        )}
                      </div>
                    </div>
                  ))}

                  <PrimaryButton
                    type="button"
                    onClick={addVendor}
                    className="w-full md:w-auto"
                  >
                    + Add Another Vendor
                  </PrimaryButton>
                </>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`text-center p-4 rounded-lg ${message.includes('success') ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary/10">
              <PrimaryButton
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Item'}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={() => navigate('/items-list')}
                className="flex-1"
              >
                Back to Items List
              </SecondaryButton>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddItemPage;
