import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import axiosInstance from '../utils/axiosInstance';

const AddVendorPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    gstNumber: '',
    panNumber: '',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: ''
    },
    paymentTerms: '30_days'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axiosInstance.post('/vendors', formData);
      setMessage('Vendor created successfully!');
      setTimeout(() => {
        navigate('/super-admin-dashboard');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating vendor');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      label: 'Vendor Name',
      name: 'name',
      type: 'text',
      required: true,
      placeholder: 'Enter vendor name'
    },
    {
      label: 'Contact Person',
      name: 'contactPerson',
      type: 'text',
      placeholder: 'Enter contact person name'
    },
    {
      label: 'Phone',
      name: 'phone',
      type: 'tel',
      placeholder: 'Enter phone number'
    },
    {
      label: 'Email',
      name: 'email',
      type: 'email',
      placeholder: 'Enter email address'
    },
    {
      label: 'GST Number',
      name: 'gstNumber',
      type: 'text',
      placeholder: 'Enter GST number'
    },
    {
      label: 'PAN Number',
      name: 'panNumber',
      type: 'text',
      placeholder: 'Enter PAN number'
    },
    {
      label: 'Payment Terms',
      name: 'paymentTerms',
      type: 'select',
      options: [
        { value: 'immediate', label: 'Immediate' },
        { value: '15_days', label: '15 Days' },
        { value: '30_days', label: '30 Days' },
        { value: '45_days', label: '45 Days' },
        { value: '60_days', label: '60 Days' }
      ]
    }
  ];

  const addressFields = [
    {
      label: 'Street',
      name: 'address.street',
      type: 'text',
      placeholder: 'Enter street address'
    },
    {
      label: 'City',
      name: 'address.city',
      type: 'text',
      placeholder: 'Enter city'
    },
    {
      label: 'State',
      name: 'address.state',
      type: 'text',
      placeholder: 'Enter state'
    },
    {
      label: 'Pincode',
      name: 'address.pincode',
      type: 'text',
      placeholder: 'Enter pincode'
    },
    {
      label: 'Country',
      name: 'address.country',
      type: 'text',
      placeholder: 'Enter country'
    }
  ];

  const bankFields = [
    {
      label: 'Account Number',
      name: 'bankDetails.accountNumber',
      type: 'text',
      placeholder: 'Enter account number'
    },
    {
      label: 'Bank Name',
      name: 'bankDetails.bankName',
      type: 'text',
      placeholder: 'Enter bank name'
    },
    {
      label: 'IFSC Code',
      name: 'bankDetails.ifscCode',
      type: 'text',
      placeholder: 'Enter IFSC code'
    },
    {
      label: 'Account Holder Name',
      name: 'bankDetails.accountHolderName',
      type: 'text',
      placeholder: 'Enter account holder name'
    }
  ];

  return (
    <Layout title="Add Vendor" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Add New Vendor</h2>
          <p className="text-accent">Create a new vendor profile for procurement management</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {message && (
            <div className={`mb-6 text-center p-3 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <h3 className="text-xl font-semibold text-text-dark mb-6">Basic Information</h3>
              <StyledForm fields={formFields} formData={formData} onChange={handleInputChange} />
            </div>

            {/* Address Information */}
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <h3 className="text-xl font-semibold text-text-dark mb-6">Address Information</h3>
              <StyledForm fields={addressFields} formData={formData} onChange={handleInputChange} />
            </div>

            {/* Bank Details */}
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <h3 className="text-xl font-semibold text-text-dark mb-6">Bank Details</h3>
              <StyledForm fields={bankFields} formData={formData} onChange={handleInputChange} />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/super-admin-dashboard')}
                className="px-6 py-3 border border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Creating...' : 'Create Vendor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddVendorPage;
