import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const IssueStockPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHotels();
    fetchItems();
    fetchStoreStock();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axiosInstance.get('/hotels');
      setHotels(response.data.data || []);
    } catch (error) {
      setMessage('Error fetching hotels');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get('/items');
      setItems(response.data);
    } catch (error) {
      setMessage('Error fetching items');
    }
  };

  const fetchStoreStock = async () => {
    try {
      const response = await axiosInstance.get('/store/stock');
      setStockItems(response.data);
    } catch (error) {
      setMessage('Error fetching store stock');
    }
  };

  const addItem = () => {
    setStockItems([...stockItems, { itemId: '', quantityIssued: '', unit: '' }]);
  };

  const removeItem = (index) => {
    const updatedItems = stockItems.filter((_, i) => i !== index);
    setStockItems(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...stockItems];
    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      updatedItems[index] = {
        ...updatedItems[index],
        itemId: value,
        unit: selectedItem ? selectedItem.unit : ''
      };
    } else {
      updatedItems[index][field] = value;
    }
    setStockItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHotel) {
      setMessage('Please select a hotel');
      return;
    }

    const itemsToIssue = stockItems.filter(item => item.itemId && item.quantityIssued > 0);
    if (itemsToIssue.length === 0) {
      setMessage('Please add at least one item to issue');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        hotelId: selectedHotel,
        items: itemsToIssue.map(item => ({
          itemId: item.itemId,
          quantityIssued: parseFloat(item.quantityIssued)
        })),
        requestType: 'manual'
      };

      const response = await axiosInstance.post('/store/issue', payload);
      setMessage(`Stock issued successfully! Issue Number: ${response.data.issueNumber}`);
      setSelectedHotel('');
      setStockItems([]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error issuing stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Issue Stock to Hotel</h2>
          <button
            onClick={() => navigate('/store-dashboard')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="hotel" className="block text-sm font-medium text-gray-700">
              Select Hotel
            </label>
            <select
              id="hotel"
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a hotel</option>
              {hotels.map(hotel => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.name} - {hotel.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items to Issue</h3>
              <button
                type="button"
                onClick={addItem}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                + Add Item
              </button>
            </div>

            {stockItems.map((item, index) => (
              <div key={index} className="flex space-x-4 items-end mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex-1">
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
                        {itemOption.name} (Available: {stockItems.find(s => s.itemId?.itemId === itemOption._id)?.quantityOnHand || 0})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantityIssued}
                    onChange={(e) => handleItemChange(index, 'quantityIssued', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Quantity to issue"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={item.unit}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                    placeholder="Unit"
                  />
                </div>
                {stockItems.length > 1 && (
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

          {message && (
            <div className={`text-center text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Issuing...' : 'Issue Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueStockPage;
