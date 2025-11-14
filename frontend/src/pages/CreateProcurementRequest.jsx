import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const CreateProcurementRequest = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requestItems, setRequestItems] = useState([{
    itemId: '',
    vendorName: '',
    quantity: '',
    unit: '',
    pricePerUnit: '',
    gstApplicable: false,
    totalAmount: 0
  }]);
  const [source, setSource] = useState('manual');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingVendors, setLoadingVendors] = useState(true);
  const units = ["kg", "g", "litre", "ml", "piece", "packet", "dozen", "bottle", "can", "box"];

  useEffect(() => {
    fetchItems();
    fetchVendors();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get('/items');
      setItems(response.data);
    } catch (error) {
      setMessage('Error fetching items');
    }
  };

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

  const addItem = () => {
    setRequestItems([...requestItems, {
      itemId: '',
      vendorName: '',
      quantity: '',
      unit: '',
      pricePerUnit: '',
      gstApplicable: false,
      totalAmount: 0
    }]);
  };

  const removeItem = (index) => {
    if (requestItems.length > 1) {
      const updatedItems = requestItems.filter((_, i) => i !== index);
      setRequestItems(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...requestItems];
    updatedItems[index][field] = value;

    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        updatedItems[index].unit = selectedItem.unit;
      }
    }

    // Auto-calculate totalAmount
    if (field === 'quantity' || field === 'pricePerUnit') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const pricePerUnit = parseFloat(updatedItems[index].pricePerUnit) || 0;
      updatedItems[index].totalAmount = quantity * pricePerUnit;
    }

    setRequestItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = requestItems.filter(item =>
      item.itemId && item.vendorName && item.quantity > 0 && item.pricePerUnit > 0
    );

    if (validItems.length === 0) {
      setMessage('Please add at least one valid item');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        items: validItems,
        source,
        remarks
      };

      await axiosInstance.post('/procurement/request', payload);
      setMessage('Procurement request created successfully!');
      setRequestItems([{
        itemId: '',
        vendorName: '',
        quantity: '',
        unit: '',
        pricePerUnit: '',
        gstApplicable: false,
        totalAmount: 0
      }]);
      setRemarks('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating procurement request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-dark">Create Procurement Request</h2>
          <button
            onClick={() => navigate('/procurement-dashboard')}
            className="w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-card bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-w-xs">
            <label htmlFor="source" className="block text-sm font-medium text-text-dark">
              Source
            </label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
            >
              <option value="manual">Manual</option>
              <option value="xlsx-upload">XLSX Upload</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                + Add Item
              </button>
            </div>

            {requestItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end mb-4 p-4 border border-secondary/20 rounded-md bg-card">
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">Item</label>
                  <select
                    value={item.itemId}
                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                    required
                  >
                    <option value="">Select item</option>
                    {items.map(itemOption => (
                      <option key={itemOption._id} value={itemOption._id}>
                        {itemOption.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">Vendor Name</label>
                  {loadingVendors ? (
                    <div className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm bg-secondary/5 text-text-dark">
                      Loading vendors...
                    </div>
                  ) : (
                    <select
                      value={item.vendorName}
                      onChange={(e) => handleItemChange(index, 'vendorName', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor._id} value={vendor.name}>{vendor.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                    placeholder="Quantity"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">Unit</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">Price per Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.pricePerUnit}
                    onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                    placeholder="Price per Unit"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">GST Applicable</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={item.gstApplicable}
                      onChange={(e) => handleItemChange(index, 'gstApplicable', e.target.checked)}
                      className="h-4 w-4 text-secondary focus:ring-secondary border-secondary/20 rounded"
                    />
                    <span className="ml-2 text-sm text-text-dark">Yes</span>
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.totalAmount.toFixed(2)}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm bg-secondary/5 text-text-dark"
                  />
                </div>
                {requestItems.length > 1 && (
                  <div className="w-full sm:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      Remove Item
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-text-dark">
              Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
              placeholder="Optional remarks"
            />
          </div>

          {message && (
            <div className={`text-center text-sm p-3 rounded-md ${message.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-card bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProcurementRequest;
