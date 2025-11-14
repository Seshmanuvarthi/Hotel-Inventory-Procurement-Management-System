import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const IssueStockPage = () => {
  const [hotels, setHotels] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const units = ["kg", "g", "litre", "ml", "piece", "packet", "dozen", "bottle", "can", "box"];

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

  const hotelOptions = hotels.map(hotel => ({
    value: hotel._id,
    label: `${hotel.name} - ${hotel.branch}`
  }));

  const itemOptions = items.map(item => {
    const stockInfo = stockItems.find(s => s.itemId === item._id);
    return {
      value: item._id,
      label: `${item.name} (Available: ${stockInfo?.quantityOnHand || 0} ${item.unit})`
    };
  });

  const unitOptions = units.map(unit => ({
    value: unit,
    label: unit
  }));

  return (
    <Layout title="Issue Stock" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Issue Stock to Hotel</h2>
          <p className="text-accent">Distribute inventory items to hotels and manage stock allocation</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <StyledForm.Select
                label="Select Hotel"
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                options={hotelOptions}
                placeholder="Select a hotel"
                required
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-text-dark">Items to Issue</h3>
                  <PrimaryButton
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2"
                  >
                    + Add Item
                  </PrimaryButton>
                </div>

                {stockItems.map((item, index) => (
                  <div key={index} className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <StyledForm.Select
                        label="Item"
                        value={item.itemId}
                        onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                        options={itemOptions}
                        placeholder="Select item"
                        required
                      />

                      <StyledForm.Input
                        label="Quantity"
                        type="number"
                        step="0.01"
                        value={item.quantityIssued}
                        onChange={(e) => handleItemChange(index, 'quantityIssued', e.target.value)}
                        placeholder="Quantity to issue"
                        required
                      />

                      <StyledForm.Select
                        label="Unit"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        options={unitOptions}
                        placeholder="Select Unit"
                      />

                      {stockItems.length > 1 && (
                        <div className="flex justify-end">
                          <SecondaryButton
                            type="button"
                            onClick={() => removeItem(index)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600"
                          >
                            Remove
                          </SecondaryButton>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {message && (
                <div className={`text-center p-3 rounded-lg ${
                  message.includes('success')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <PrimaryButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Issuing...' : 'Issue Stock'}
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Stock Issuance Guidelines</h3>
            <p className="text-sm text-accent">
              Select the appropriate hotel and verify available stock quantities before issuing.
              Ensure accurate quantities to maintain proper inventory control.
              All stock issuances are tracked for audit and reporting purposes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IssueStockPage;
