import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AppContext';

const OrderEntry = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([{
    orderId: `order-${Date.now()}`,
    items: [{
      dishName: '',
      quantity: '',
      pricePerMl: '',
      amount: 0,
      unit: 'plates'
    }]
  }]);
  const [dishOptions, setDishOptions] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDishOptions = async () => {
      try {
        const [recipesRes, itemsRes] = await Promise.all([
          axiosInstance.get('/recipes'),
          axiosInstance.get('/items')
        ]);

        const recipeOptions = recipesRes.data.map(recipe => ({
          value: recipe.dishName,
          label: `${recipe.dishName} (Food)`,
          unit: 'plates'
        }));

        const barOptions = itemsRes.data
          .filter(item => item.category === 'Bar')
          .map(item => ({
            value: item.name,
            label: `${item.name} (Bar)`,
            unit: 'bottles'
          }));

        setDishOptions([...recipeOptions, ...barOptions]);
      } catch (error) {
        console.error('Error fetching dish options:', error);
      }
    };

    fetchDishOptions();
  }, []);

  const addOrder = () => {
    setOrders([...orders, {
      orderId: `order-${Date.now() + orders.length}`,
      items: [{
        dishName: '',
        quantity: '',
        pricePerUnit: '',
        amount: 0,
        unit: 'bottles'
      }]
    }]);
  };

  const removeOrder = (orderIndex) => {
    if (orders.length > 1) {
      const updatedOrders = orders.filter((_, i) => i !== orderIndex);
      setOrders(updatedOrders);
      calculateTotal(updatedOrders);
    }
  };

  const addItem = (orderIndex) => {
    const updatedOrders = [...orders];
    updatedOrders[orderIndex].items.push({
      dishName: '',
      quantity: '',
      pricePerUnit: '',
      amount: 0,
      unit: 'plates'
    });
    setOrders(updatedOrders);
  };

  const removeItem = (orderIndex, itemIndex) => {
    const updatedOrders = [...orders];
    if (updatedOrders[orderIndex].items.length > 1) {
      updatedOrders[orderIndex].items = updatedOrders[orderIndex].items.filter((_, i) => i !== itemIndex);
      setOrders(updatedOrders);
      calculateTotal(updatedOrders);
    }
  };

  const handleItemChange = (orderIndex, itemIndex, field, value) => {
    const updatedOrders = [...orders];
    const item = updatedOrders[orderIndex].items[itemIndex];
    item[field] = value;

    if (field === 'dishName') {
      const selectedOption = dishOptions.find(option => option.value === value);
      if (selectedOption) {
        item.unit = selectedOption.unit;
      }
    }

    // Auto-calculate amount
    if (field === 'quantity' || field === 'pricePerUnit' || field === 'unit') {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.pricePerUnit) || 0;
      item.amount = quantity * price;
    }

    setOrders(updatedOrders);
    calculateTotal(updatedOrders);
  };

  const calculateTotal = (ordersData) => {
    const total = ordersData.reduce((sum, order) =>
      sum + order.items.reduce((orderSum, item) => orderSum + (item.amount || 0), 0), 0);
    setTotalOrderAmount(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.hotelId) {
      setMessage('Hotel ID not found. Please login again.');
      return;
    }

    const validOrders = orders.filter(order =>
      order.items.some(item => item.dishName && item.quantity > 0 && item.pricePerMl > 0)
    ).map(order => ({
      ...order,
      items: order.items.filter(item => item.dishName && item.quantity > 0 && item.pricePerMl > 0)
    }));

    if (validOrders.length === 0 || validOrders.every(order => order.items.length === 0)) {
      setMessage('Please add at least one valid order item');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        hotelId: user.hotelId,
        orders: validOrders,
        date,
        remarks
      };

      await axiosInstance.post('/orders', payload);
      setMessage('Order entry created successfully!');

      // Reset form
      setOrders([{
        orderId: `order-${Date.now()}`,
        items: [{
          dishName: '',
          quantity: '',
          pricePerUnit: '',
          amount: 0,
          unit: 'plates'
        }]
      }]);
      setRemarks('');
      setTotalOrderAmount(0);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating order entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Order Entry" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Daily Order Entry</h2>
          <p className="text-accent">Record daily orders with item/dish names, quantities, and pricing for accurate tracking</p>
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

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-text-dark">Orders</h3>
                  <PrimaryButton
                    type="button"
                    onClick={addOrder}
                    className="px-4 py-2"
                  >
                    + Add Order
                  </PrimaryButton>
                </div>

                {orders.map((order, orderIndex) => (
                  <div key={order.orderId} className="bg-secondary/5 p-6 rounded-lg border border-secondary/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-text-dark">Order {orderIndex + 1}</h4>
                      {orders.length > 1 && (
                        <SecondaryButton
                          type="button"
                          onClick={() => removeOrder(orderIndex)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600"
                        >
                          Remove Order
                        </SecondaryButton>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-md font-medium text-text-dark">Items</h5>
                        <PrimaryButton
                          type="button"
                          onClick={() => addItem(orderIndex)}
                          className="px-3 py-2 text-sm"
                        >
                          + Add Item
                        </PrimaryButton>
                      </div>

                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="bg-card p-4 rounded-lg border border-secondary/10">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <StyledForm.Select
                              label="Item/Dish Name"
                              value={item.dishName}
                              onChange={(e) => handleItemChange(orderIndex, itemIndex, 'dishName', e.target.value)}
                              options={dishOptions}
                              placeholder="Select Item or Dish"
                              required
                            />

                            <StyledForm.Input
                              label={`Quantity (${item.unit})`}
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(orderIndex, itemIndex, 'quantity', e.target.value)}
                              placeholder="Quantity"
                              required
                            />

                            {item.unit === 'bottles' || item.unit === 'ml' ? (
                              <StyledForm.Select
                                label="Unit"
                                value={item.unit}
                                onChange={(e) => handleItemChange(orderIndex, itemIndex, 'unit', e.target.value)}
                                options={[
                                  { value: 'bottles', label: 'Bottles' },
                                  { value: 'ml', label: 'ml' }
                                ]}
                                required
                              />
                            ) : null}

                            <StyledForm.Input
                              label={`Price per ${item.unit}`}
                              type="number"
                              step="0.01"
                              value={item.pricePerUnit}
                              onChange={(e) => handleItemChange(orderIndex, itemIndex, 'pricePerUnit', e.target.value)}
                              placeholder={`Price per ${item.unit}`}
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

                            {order.items.length > 1 && (
                              <div className="flex justify-end md:col-span-1">
                                <SecondaryButton
                                  type="button"
                                  onClick={() => removeItem(orderIndex, itemIndex)}
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
                  </div>
                ))}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">Total Order Amount:</span>
                  <span className="text-2xl font-bold text-primary">₹{totalOrderAmount.toFixed(2)}</span>
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
                {loading ? 'Submitting...' : 'Submit Order Entry'}
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Order Entry Guidelines</h3>
            <p className="text-sm text-accent">
              Record all orders accurately with correct quantities and prices for precise tracking.
              Select dishes from available recipes or bar items. Quantities are in plates for food, bottles or ml for bar items.
              Ensure prices match the menu and quantities reflect actual orders.
              Add multiple orders per day if needed (e.g., breakfast, lunch, dinner).
              Add remarks for any special instructions or adjustments.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderEntry;
