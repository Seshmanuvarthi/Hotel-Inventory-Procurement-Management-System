import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const ConsumptionEntry = () => {
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const units = ["kg", "g", "litre", "ml", "piece", "packet", "dozen", "bottle", "can", "box"];

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

  const itemOptions = items.map(item => ({
    value: item._id,
    label: item.name
  }));

  const unitOptions = units.map(unit => ({
    value: unit,
    label: unit
  }));

  return (
    <Layout title="Consumption Entry" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Daily Consumption Entry</h2>
          <p className="text-accent">Record daily ingredient consumption for accurate inventory tracking</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <StyledForm.Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-text-dark">Items Consumed</h3>
                  <PrimaryButton
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2"
                  >
                    + Add Item
                  </PrimaryButton>
                </div>

                {consumptionItems.map((item, index) => (
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
                        label="Quantity Consumed"
                        type="number"
                        step="0.01"
                        value={item.quantityConsumed}
                        onChange={(e) => handleItemChange(index, 'quantityConsumed', e.target.value)}
                        placeholder="Quantity"
                        required
                      />

                      <StyledForm.Select
                        label="Unit"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        options={unitOptions}
                        placeholder="Select Unit"
                      />

                      {consumptionItems.length > 1 && (
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

              <StyledForm.Textarea
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks"
                rows={3}
              />

              {message && (
                <div className={`text-center p-3 rounded-lg ${
                  message.includes('success')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : message.includes('Warning')
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              {balances.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-primary mb-3">Stock Balances</h4>
                  <div className="space-y-2">
                    {balances.map((balance, index) => (
                      <div key={index} className="flex justify-between items-center bg-card p-3 rounded border border-secondary/10">
                        <span className="font-medium text-text-dark">
                          {balance.itemId?.name || 'Unknown Item'}
                        </span>
                        <div className="text-sm text-accent">
                          <span className="mr-4">Opening: {balance.openingBalance?.toFixed(2)}</span>
                          <span>Closing: {balance.closingBalance?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PrimaryButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Submitting...' : 'Submit Consumption'}
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Consumption Entry Guidelines</h3>
            <p className="text-sm text-accent">
              Record all ingredient consumption accurately for precise inventory management.
              Ensure quantities match actual usage to maintain accurate stock levels.
              Add remarks for any special circumstances or adjustments.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsumptionEntry;
