import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';

const CreateRestaurantStockRequest = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [items, setItems] = useState([]);
  const [requestItems, setRequestItems] = useState([{
    itemId: '',
    requestedQuantity: '',
    unit: ''
  }]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get('/items');
      setItems(response.data);
    } catch (error) {
      setMessage('Error fetching items');
    }
  };

  const addItem = () => {
    setRequestItems([...requestItems, {
      itemId: '',
      requestedQuantity: '',
      unit: ''
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

    setRequestItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = requestItems.filter(item =>
      item.itemId && item.requestedQuantity > 0
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
        remarks
      };

      await axiosInstance.post('/restaurant-stock-requests', payload);
      setMessage('Restaurant stock request created successfully!');
      setRequestItems([{
        itemId: '',
        requestedQuantity: '',
        unit: ''
      }]);
      setRemarks('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating restaurant stock request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Restaurant Stock Request" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Create Restaurant Stock Request</h2>
          <p className="text-accent">Request items from the central store</p>
        </div>

        <div className="max-w-4xl mx-auto">

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end mb-4 p-4 border border-secondary/20 rounded-md bg-card">
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
                  <label className="block text-sm font-medium text-text-dark">Requested Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.requestedQuantity}
                    onChange={(e) => handleItemChange(index, 'requestedQuantity', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                    placeholder="Quantity"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-dark">Unit</label>
                  <input
                    type="text"
                    value={item.unit}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm bg-secondary/5 text-text-dark"
                  />
                </div>
                {requestItems.length > 1 && (
                  <div className="w-full sm:col-span-2 lg:col-span-3 flex justify-end">
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
    </Layout>
  );
};

export default CreateRestaurantStockRequest;
