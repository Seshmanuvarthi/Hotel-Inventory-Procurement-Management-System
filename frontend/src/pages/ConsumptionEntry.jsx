import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const ConsumptionEntry = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [consumptionItems, setConsumptionItems] = useState([{
    itemId: '',
    quantityConsumed: '',
    unit: ''
  }]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [balances, setBalances] = useState([]);

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
    setConsumptionItems([...consumptionItems, {
      itemId: '',
      quantityConsumed: '',
      unit: ''
    }]);
  };

  const removeItem = (index) => {
    if (consumptionItems.length > 1) {
      const updatedItems = consumptionItems.filter((_, i) => i !== index);
      setConsumptionItems(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...consumptionItems];
    updatedItems[index][field] = value;

    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        updatedItems[index].unit = selectedItem.unit;
      }
    }

    setConsumptionItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.hotelId) {
      setMessage('Hotel ID not found. Please login again.');
      return;
    }

    const validItems = consumptionItems.filter(item =>
      item.itemId && item.quantityConsumed > 0
    );

    if (validItems.length === 0) {
      setMessage('Please add at least one valid item');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        hotelId: user.hotelId,
        items: validItems,
        date,
        remarks
      };

      const response = await axiosInstance.post('/consumption', payload);
      setMessage('Consumption entry created successfully!');

      // Show balances from response
      if (response.data.consumption && response.data.consumption.items) {
        setBalances(response.data.consumption.items);
      }

      if (response.data.overConsumption) {
        setMessage('Warning: Over consumption detected (closing balance went negative)');
      }

      // Reset form
      setConsumptionItems([{
        itemId: '',
        quantityConsumed: '',
        unit: ''
      }]);
      setRemarks('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating consumption entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Daily Consumption Entry</h2>
          <button
            onClick={() => navigate('/hotel-dashboard')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items Consumed</h3>
              <button
                type="button"
                onClick={addItem}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                + Add Item
              </button>
            </div>

            {consumptionItems.map((item, index) => (
              <div key={index} className="flex flex-wrap gap-4 items-end mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">Item</label>
                  <select
                    value={item.itemId}
                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">Quantity Consumed</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantityConsumed}
                    onChange={(e) => handleItemChange(index, 'quantityConsumed', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Quantity"
                    required
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={item.unit}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                    placeholder="Unit"
                  />
                </div>
                {consumptionItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional remarks"
            />
          </div>

          {message && (
            <div className={`text-center text-sm ${message.includes('success') ? 'text-green-600' : message.includes('Warning') ? 'text-yellow-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          {balances.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-lg font-medium text-blue-900 mb-2">Stock Balances</h4>
              <div className="space-y-2">
                {balances.map((balance, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">
                      {balance.itemId?.name || 'Unknown Item'}
                    </span>
                    <span className="text-sm text-blue-700">
                      Opening: {balance.openingBalance?.toFixed(2)} | Closing: {balance.closingBalance?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Consumption'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumptionEntry;
