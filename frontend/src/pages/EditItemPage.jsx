import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchItem();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <Layout title="Edit Item" userRole={user.role}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading item details...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Item" userRole={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-primary text-card rounded-xl p-6 shadow-luxury">
          <h2 className="text-2xl font-bold mb-2">Edit Item</h2>
          <p className="text-card/80">Update item details and vendor information</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-dark">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="gstApplicable"
                    id="gstApplicable"
                    checked={formData.gstApplicable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-secondary/20 rounded"
                  />
                  <label htmlFor="gstApplicable" className="ml-2 block text-sm text-text-dark">
                    GST Applicable
                  </label>
                </div>
              </div>
            </div>

            {/* Vendors Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-dark">Vendors</h3>

              {formData.vendors.map((vendor, index) => (
                <div key={index} className="bg-secondary/5 p-4 rounded-lg border border-secondary/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">
                        Vendor Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter vendor name"
                        required
                        value={vendor.vendorName}
                        onChange={(e) => handleVendorChange(index, 'vendorName', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-text-dark mb-1">
                          Last Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                          value={vendor.lastPrice}
                          onChange={(e) => handleVendorChange(index, 'lastPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                      </div>

                      {formData.vendors.length > 1 && (
                        <SecondaryButton
                          type="button"
                          onClick={() => removeVendor(index)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                          Remove
                        </SecondaryButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <PrimaryButton
                type="button"
                onClick={addVendor}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                + Add Another Vendor
              </PrimaryButton>
            </div>

            {/* Message */}
            {message && (
              <div className={`text-center p-3 rounded-lg ${
                message.includes('success')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <PrimaryButton
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update Item'}
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

export default EditItemPage;
