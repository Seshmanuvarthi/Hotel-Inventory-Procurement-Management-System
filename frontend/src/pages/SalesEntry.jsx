import { useState } from 'react';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const SalesEntry = () => {
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    <Layout title="Sales Entry" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Daily Sales Entry</h2>
          <p className="text-accent">Record daily dish sales and revenue for accurate financial tracking</p>
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
                  <h3 className="text-xl font-semibold text-text-dark">Sales Items</h3>
                  <PrimaryButton
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2"
                  >
                    + Add Dish
                  </PrimaryButton>
                </div>

                {salesItems.map((item, index) => (
                  <div key={index} className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <StyledForm.Input
                        label="Dish Name"
                        type="text"
                        value={item.dishName}
                        onChange={(e) => handleItemChange(index, 'dishName', e.target.value)}
                        placeholder="Dish Name"
                        required
                      />

                      <StyledForm.Input
                        label="Quantity Sold"
                        type="number"
                        step="0.01"
                        value={item.quantitySold}
                        onChange={(e) => handleItemChange(index, 'quantitySold', e.target.value)}
                        placeholder="Quantity"
                        required
                      />

                      <StyledForm.Input
                        label="Price per Unit"
                        type="number"
                        step="0.01"
                        value={item.pricePerUnit}
                        onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
                        placeholder="Price per Unit"
                        required
                      />

                      <StyledForm.Input
                        label="Amount"
                        type="number"
                        step="0.01"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-secondary/10"
                      />

                      {salesItems.length > 1 && (
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

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">Total Sales Amount:</span>
                  <span className="text-2xl font-bold text-primary">₹{totalSalesAmount.toFixed(2)}</span>
                </div>
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
                {loading ? 'Submitting...' : 'Submit Sales'}
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Sales Entry Guidelines</h3>
            <p className="text-sm text-accent">
              Record all dish sales accurately with correct quantities and prices for precise revenue tracking.
              Ensure prices match the menu and quantities reflect actual sales.
              Add remarks for any special promotions or adjustments.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesEntry;
