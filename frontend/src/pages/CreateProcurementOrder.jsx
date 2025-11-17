import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';
import StyledForm from '../components/StyledForm';
import PrimaryButton from '../components/PrimaryButton';

const CreateProcurementOrder = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    vendorName: '',
    billNumber: '',
    billDate: '',
    items: [{
      itemId: '',
      quantity: '',
      unit: '',
      pricePerUnit: '',
      gstPercentage: 5,
      gstAmount: 0,
      totalAmount: 0
    }],
    remarks: ''
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    gstTotal: 0,
    finalAmount: 0
  });

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
    }
  };

  const calculateTotals = (items) => {
    let subtotal = 0;
    let gstTotal = 0;

    items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const pricePerUnit = parseFloat(item.pricePerUnit) || 0;
      const gstPercentage = parseFloat(item.gstPercentage) || 0;

      const amountBeforeGST = quantity * pricePerUnit;
      subtotal += amountBeforeGST;

      const gstAmount = amountBeforeGST * (gstPercentage / 100);
      gstTotal += gstAmount;

      item.gstAmount = gstAmount;
      item.totalAmount = amountBeforeGST + gstAmount;
    });

    const finalAmount = subtotal + gstTotal;

    setTotals({
      subtotal: subtotal.toFixed(2),
      gstTotal: gstTotal.toFixed(2),
      finalAmount: finalAmount.toFixed(2)
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        updatedItems[index].unit = selectedItem.unit;
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    calculateTotals(updatedItems);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        itemId: '',
        quantity: '',
        unit: '',
        pricePerUnit: '',
        gstPercentage: 5,
        gstAmount: 0,
        totalAmount: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      calculateTotals(updatedItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = formData.items.filter(item =>
      item.itemId && item.quantity > 0 && item.pricePerUnit > 0
    );

    if (validItems.length === 0) {
      setMessage('Please add at least one valid item');
      return;
    }

    if (!formData.vendorName || !formData.billDate) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        vendorName: formData.vendorName,
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        items: validItems,
        remarks: formData.remarks
      };

      await axiosInstance.post('/procurement-orders', payload);
      setMessage('Procurement order created successfully!');
      navigate('/procurement-dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating procurement order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Procurement Order" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Create Procurement Order</h2>
          <p className="text-accent">Create a complete digital bill for MD approval</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bill Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Vendor Name</label>
                  <select
                    value={formData.vendorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                    required
                  >
                    <option value="">Select vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor.name}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <StyledForm.Input
                  label="Bill Number (Optional)"
                  type="text"
                  value={formData.billNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
                  placeholder="Enter bill number if available"
                />

                <StyledForm.Input
                  label="Bill Date"
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, billDate: e.target.value }))}
                  required
                />
              </div>

              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-text-dark">Items</h3>
                  <PrimaryButton
                    type="button"
                    onClick={addItem}
                    className="text-sm"
                  >
                    + Add Item
                  </PrimaryButton>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4 p-4 border border-secondary/20 rounded-md bg-secondary/5">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Item</label>
                      <select
                        value={item.itemId}
                        onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
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

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                        placeholder="Quantity"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                      >
                        <option value="">Select Unit</option>
                        {units.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Price per Unit</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.pricePerUnit}
                        onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                        placeholder="Price per Unit"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">GST %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.gstPercentage}
                        onChange={(e) => handleItemChange(index, 'gstPercentage', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-text-dark"
                        placeholder="GST %"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">GST Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.gstAmount.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm bg-secondary/5 text-text-dark"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Total Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.totalAmount.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-secondary/20 rounded-md shadow-sm bg-secondary/5 text-text-dark"
                      />
                    </div>

                    {formData.items.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-text-dark">Subtotal</label>
                  <div className="text-lg font-semibold text-text-dark">₹{totals.subtotal}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark">GST Total</label>
                  <div className="text-lg font-semibold text-text-dark">₹{totals.gstTotal}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark">Final Amount</label>
                  <div className="text-xl font-bold text-primary">₹{totals.finalAmount}</div>
                </div>
              </div>

              {/* Remarks */}
              <StyledForm.Textarea
                label="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Optional remarks"
                rows={3}
              />

              {message && (
                <div className={`text-center text-sm p-3 rounded-md ${message.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  {message}
                </div>
              )}

              <div className="flex justify-center">
                <PrimaryButton
                  type="submit"
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? 'Creating...' : 'Create Procurement Order'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProcurementOrder;
