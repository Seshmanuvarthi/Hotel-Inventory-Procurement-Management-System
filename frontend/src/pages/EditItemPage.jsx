import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const EditItemPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    gstApplicable: false,
    vendors: [{ vendorName: '', lastPrice: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');

  const categories = ["Grocery", "Vegetables", "Dairy", "Meat", "Spices", "Other"];
  const units = ["kg", "litre", "piece", "packet", "gram"];

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axiosInstance.get(`/items/${id}`);
      const item = response.data;
      setFormData({
        name: item.name,
        category: item.category,
        unit: item.unit,
        gstApplicable: item.gstApplicable,
        vendors: item.vendors.map(v => ({
          vendorName: v.vendorName,
          lastPrice: v.lastPrice.toString()
        }))
      });
    } catch (error) {
      setMessage('Error fetching item');
    } finally {
      setFetchLoading(false);
    }
  };

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

      await axiosInstance.put(`/items/${id}`, payload);
      setMessage('Item updated successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating item');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Edit Item</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Item Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Item Name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="category" className="sr-only">Category</label>
              <select
                id="category"
                name="category"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
              <label htmlFor="unit" className="sr-only">Unit</label>
              <select
                id="unit"
                name="unit"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={formData.gstApplicable}
                onChange={handleInputChange}
              />
              <label htmlFor="gstApplicable" className="ml-2 block text-sm text-gray-900">
                GST Applicable
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vendors</h3>
            {formData.vendors.map((vendor, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={vendor.vendorName}
                  onChange={(e) => handleVendorChange(index, 'vendorName', e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Last Price"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={vendor.lastPrice}
                  onChange={(e) => handleVendorChange(index, 'lastPrice', e.target.value)}
                />
                {formData.vendors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVendor(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addVendor}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              + Add Another Vendor
            </button>
          </div>

          {message && (
            <div className={`text-center text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Item'}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => navigate('/items')}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Items List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemPage;
