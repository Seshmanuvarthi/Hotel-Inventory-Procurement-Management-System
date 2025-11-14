import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const UploadBillPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // procurementRequestId
  const [request, setRequest] = useState(null);
  const [billData, setBillData] = useState({
    vendorName: '',
    billNumber: '',
    billDate: '',
    billFileUrl: '',
    remarks: '',
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
  
    const fetchRequestDetails = async () => {
      try {
        const response = await axiosInstance.get(`/procurement/${id}`);
        setRequest(response.data);
  
        const prefilledItems = response.data.items.map(item => ({
          itemId: item.itemId._id,
          quantity: item.quantity,
          unit: item.unit,
          pricePerUnit: item.pricePerUnit,
          gstApplicable: item.gstApplicable,
          gstAmount: 0,
          totalAmount: item.quantity * item.pricePerUnit
        }));
  
        setBillData(prev => ({
          ...prev,
          vendorName: response.data.items[0]?.vendorName || '',
          items: prefilledItems
        }));
      } catch (error) {
        setMessage('Error fetching request details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchRequestDetails();
  }, [id]);
  

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billData.items];
    updatedItems[index][field] = value;

    // Recalculate totalAmount
    if (field === 'pricePerUnit' || field === 'gstAmount') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const pricePerUnit = parseFloat(updatedItems[index].pricePerUnit) || 0;
      const gstAmount = parseFloat(updatedItems[index].gstAmount) || 0;
      updatedItems[index].totalAmount = quantity * pricePerUnit + gstAmount;
    }

    setBillData(prev => ({
      ...prev,
      items: updatedItems
    }));
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
              <input
                type="text"
                id="vendorName"
                value={billData.vendorName}
                onChange={(e) => setBillData(prev => ({ ...prev, vendorName: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
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
                        readOnly
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
                        value={item.gstAmount}
                        onChange={(e) => handleItemChange(index, 'gstAmount', parseFloat(e.target.value) || 0)}
                        disabled={!item.gstApplicable}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
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
