import { useNavigate } from 'react-router-dom';

const AddOptionsPage = () => {
  const navigate = useNavigate();

  const options = [
    { label: 'Add MD', type: 'md' },
    { label: 'Add Hotel', type: 'hotel' },
    { label: 'Add Hotel Manager', type: 'hotel_manager' },
    { label: 'Add Procurement Officer', type: 'procurement_officer' },
    { label: 'Add Store Manager', type: 'store_manager' },
    { label: 'Add Accounts User', type: 'accounts' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Add Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option) => (
            <button
              key={option.type}
              onClick={() => navigate(`/add-user-or-hotel?type=${option.type}`)}
              className="bg-blue-500 text-white px-6 py-12 rounded-lg shadow-md hover:bg-blue-600 text-xl font-semibold"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/superadmin-dashboard')}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOptionsPage;
