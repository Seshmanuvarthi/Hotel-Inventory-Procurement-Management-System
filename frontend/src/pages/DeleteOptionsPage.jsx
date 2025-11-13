import { useNavigate } from 'react-router-dom';

const DeleteOptionsPage = () => {
  const navigate = useNavigate();

  const options = [
    { label: 'Delete MD', role: 'md' },
    { label: 'Delete Hotel Manager', role: 'hotel_manager' },
    { label: 'Delete Procurement Officer', role: 'procurement_officer' },
    { label: 'Delete Store Manager', role: 'store_manager' },
    { label: 'Delete Accounts User', role: 'accounts' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Delete / Disable Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option) => (
            <button
              key={option.role}
              onClick={() => navigate(`/delete-user?role=${option.role}`)}
              className="bg-red-500 text-white px-6 py-12 rounded-lg shadow-md hover:bg-red-600 text-xl font-semibold"
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

export default DeleteOptionsPage;
