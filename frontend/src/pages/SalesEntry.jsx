import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SalesEntry = () => {
  const navigate = useNavigate();
  const [salesItems, setSalesItems] = useState([{
    dishName: '',
    quantitySold: '',
    pricePerUnit: '',
    amount: 0
  }]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addItem = () => {
    setSalesItems([...salesItems, {
      dishName: '',
      quantitySold: '',
      pricePerUnit: '',
      amount: 0
    }]);
  };

  const removeItem = (index) => {
    if (salesItems.length > 1) {
      const updatedItems = salesItems.filter((_, i) => i !== index);
      setSalesItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...salesItems];
    updatedItems[index][field] = value;

    // Auto-calculate amount
    if (field === 'quantitySold' || field === 'pricePerUnit') {
      const quantity = parseFloat(updatedItems[index].quantitySold) || 0;
      const price = parseFloat(updatedItems[index].pricePerUnit) || 0;
      updatedItems[index].amount = quantity * price;
    }

    setSalesItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    setTotalSalesAmount(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.hotelId) {
      setMessage('Hotel ID not found. Please login again.');
      return;
    }

    const validItems = salesItems.filter(item =>
      item.dishName && item.quantitySold > 0 && item.pricePerUnit > 0
    );

    if (validItems.length === 0) {
      setMessage('Please add at least one valid sales item');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        hotelId: user.hotelId,
        sales: validItems,
        date,
        remarks
      };

      await axiosInstance.post('/sales', payload);
      setMessage('Sales entry created successfully!');

      // Reset form
      setSalesItems([{
        dishName: '',
        quantitySold: '',
        pricePerUnit: '',
        amount: 0
      }]);
      setRemarks('');
      setTotalSalesAmount(0);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating sales entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Daily Sales Entry</h2>
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
              <h3 className="text-lg font-medium text-gray-900">Sales Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                + Add Dish
              </button>
            </div>

            {salesItems.map((item, index) => (
              <div key={index} className="flex flex-wrap gap-4 items-end mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">Dish Name</label>
                  <input
                    type="text"
                    value={item.dishName}
                    onChange={(e) => handleItemChange(index, 'dishName', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Dish Name"
                    required
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">Quantity Sold</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantitySold}
                    onChange={(e) => handleItemChange(index, 'quantitySold', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Quantity"
                    required
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">Price per Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.pricePerUnit}
                    onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Price per Unit"
                    required
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount.toFixed(2)}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                  />
                </div>
                {salesItems.length > 1 && (
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

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Sales Amount:</span>
              <span className="text-lg font-bold text-gray-900">₹{totalSalesAmount.toFixed(2)}</span>
            </div>
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
              {loading ? 'Submitting...' : 'Submit Sales'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesEntry;
