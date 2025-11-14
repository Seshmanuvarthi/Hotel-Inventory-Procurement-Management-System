import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const UploadBillPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // procurementRequestId
  const [request, setRequest] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [billData, setBillData] = useState({
    vendorName: '',
    billNumber: '',
    billDate: '',
    gstPercentage: 5,
    billFileUrl: '',
    remarks: '',
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setMessage('Procurement request ID is required');
        setLoading(false);
        setLoadingVendors(false);
        return;
      }

      try {
        // Fetch vendors
        const vendorsResponse = await axiosInstance.get('/vendors');
        setVendors(vendorsResponse.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoadingVendors(false);
      }

      try {
        console.log('Fetching request details for ID:', id);
        const response = await axiosInstance.get(`/procurement/${id}`);
        console.log('Response received:', response.data);

        if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
          throw new Error('Invalid response structure: missing or invalid items array');
        }

        setRequest(response.data);

        const prefilledItems = response.data.items.map(item => {
          if (!item.itemId || !item.itemId._id) {
            throw new Error('Invalid item structure: missing itemId');
          }
          return {
            itemId: item.itemId._id,
            quantity: item.quantity || 0,
            unit: item.unit || '',
            pricePerUnit: item.pricePerUnit || 0,
            gstApplicable: item.gstApplicable || false,
            gstAmount: 0,
            totalAmount: (item.quantity || 0) * (item.pricePerUnit || 0)
          };
        });

        setBillData(prev => ({
          ...prev,
          vendorName: response.data.items[0]?.vendorName || '',
          items: prefilledItems
        }));
      } catch (error) {
        console.error('Error fetching request details:', error);
        setMessage('Error fetching request details: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billData.items];
    updatedItems[index][field] = value;

    // Recalculate GST and totalAmount
    if (field === 'pricePerUnit' || field === 'gstApplicable') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const pricePerUnit = parseFloat(updatedItems[index].pricePerUnit) || 0;
      const gstPercentage = parseFloat(billData.gstPercentage) || 0;

      if (updatedItems[index].gstApplicable) {
        updatedItems[index].gstAmount = quantity * pricePerUnit * (gstPercentage / 100);
      } else {
        updatedItems[index].gstAmount = 0;
      }

      updatedItems[index].totalAmount = quantity * pricePerUnit + updatedItems[index].gstAmount;
    }

    setBillData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleGSTPercentageChange = (value) => {
    const gstPercentage = parseFloat(value) || 0;
    setBillData(prev => ({ ...prev, gstPercentage }));

    // Recalculate all GST amounts
    const updatedItems = billData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const pricePerUnit = parseFloat(item.pricePerUnit) || 0;

      if (item.gstApplicable) {
        item.gstAmount = quantity * pricePerUnit * (gstPercentage / 100);
      } else {
        item.gstAmount = 0;
      }

      item.totalAmount = quantity * pricePerUnit + item.gstAmount;
      return item;
    });

    setBillData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!billData.vendorName || !billData.billDate || !billData.billFileUrl) {
      setMessage('Please fill all required fields');
      return;
    }

    setSubmitLoading(true);
    setMessage('');

    try {
      const payload = {
        ...billData,
        billDate: new Date(billData.billDate).toISOString()
      };

      await axiosInstance.post(`/procurement/${id}/bill`, payload);
      setMessage('Bill uploaded successfully!');
      setTimeout(() => {
        navigate('/bills');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error uploading bill');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Request not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Upload Bill</h2>
          <button
            onClick={() => navigate('/bills')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Bills
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Procurement Request Details</h3>
          <p className="text-sm text-blue-700">
            <strong>Request ID:</strong> {request._id.slice(-8)} | <strong>Status:</strong> {request.status} | <strong>Requested By:</strong> {request.requestedBy?.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">
                Vendor Name *
              </label>
              {loadingVendors ? (
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500">
                  Loading vendors...
                </div>
              ) : (
                <select
                  id="vendorName"
                  value={billData.vendorName}
                  onChange={(e) => setBillData(prev => ({ ...prev, vendorName: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor._id} value={vendor.name}>{vendor.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label htmlFor="billNumber" className="block text-sm font-medium text-gray-700">
                Bill Number
              </label>
              <input
                type="text"
                id="billNumber"
                value={billData.billNumber}
                onChange={(e) => setBillData(prev => ({ ...prev, billNumber: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="billDate" className="block text-sm font-medium text-gray-700">
                Bill Date *
              </label>
              <input
                type="date"
                id="billDate"
                value={billData.billDate}
                onChange={(e) => setBillData(prev => ({ ...prev, billDate: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-700">
                GST Percentage *
              </label>
              <input
                type="number"
                step="0.01"
                id="gstPercentage"
                value={billData.gstPercentage}
                onChange={(e) => handleGSTPercentageChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="5"
                required
              />
            </div>
            <div>
              <label htmlFor="billFileUrl" className="block text-sm font-medium text-gray-700">
                Bill File URL *
              </label>
              <input
                type="url"
                id="billFileUrl"
                value={billData.billFileUrl}
                onChange={(e) => setBillData(prev => ({ ...prev, billFileUrl: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/bill.pdf"
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
            <div className="space-y-4">
              {billData.items.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Item</label>
                      <input
                        type="text"
                        value={request.items[index]?.itemId?.name || 'Unknown Item'}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price per Unit</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.pricePerUnit}
                        onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST Applicable</label>
                      <input
                        type="checkbox"
                        checked={item.gstApplicable}
                        onChange={(e) => handleItemChange(index, 'gstApplicable', e.target.checked)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.gstAmount.toFixed(2)}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.totalAmount.toFixed(2)}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              id="remarks"
              value={billData.remarks}
              onChange={(e) => setBillData(prev => ({ ...prev, remarks: e.target.value }))}
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
              disabled={submitLoading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitLoading ? 'Uploading...' : 'Upload Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadBillPage;
