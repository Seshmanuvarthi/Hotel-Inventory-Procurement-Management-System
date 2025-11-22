import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';

const CreateOutwardMaterialRequest = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [hotels, setHotels] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [requestItems, setRequestItems] = useState([{
    itemId: '',
    quantityToIssue: '',
    unit: ''
  }]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHotels();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const fetchHotels = async () => {
    try {
      const response = await axiosInstance.get('/hotels');
      setHotels(response.data);
    } catch (error) {
      setMessage('Error fetching hotels');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/items');
      const uniqueCategories = [...new Set(response.data.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      setMessage('Error fetching categories');
    }
  };

  const fetchItems = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axiosInstance.get('/outward-material-requests/items/category', { params });
      setItems(response.data);
    } catch (error) {
      setMessage('Error fetching items');
    }
  };

  const addItem = () => {
    setRequestItems([...requestItems, {
      itemId: '',
      quantityToIssue: '',
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

    if (!selectedHotel) {
      setMessage('Please select a hotel');
      return;
    }

    const validItems = requestItems.filter(item =>
      item.itemId && item.quantityToIssue > 0
    );

    if (validItems.length === 0) {
      setMessage('Please add at least one valid item');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        hotelId: selectedHotel,
        items: validItems,
        remarks
      };

      await axiosInstance.post('/outward-material-requests', payload);
      setMessage('Outward material request created successfully!');
      setSelectedHotel('');
      setSelectedCategory('');
      setRequestItems([{
        itemId: '',
        quantityToIssue: '',
        unit: ''
      }]);
      setRemarks('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating outward material request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Outward Material Request" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Create Outward Material Request</h2>
          <p className="text-accent">Issue stock to a hotel</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark">Select Hotel</label>
                <select
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                  required
                >
                  <option value="">Select hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel._id} value={hotel._id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                >
                  <option value="">All categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
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
                    <label className="block text-sm font-medium text-text-dark">Quantity to Issue</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantityToIssue}
                      onChange={(e) => handleItemChange(index, 'quantityToIssue', e.target.value)}
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

export default CreateOutwardMaterialRequest;
