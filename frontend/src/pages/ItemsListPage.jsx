import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';
import { Search, Edit, Trash2 } from 'lucide-react';

const ItemsListPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ["all", "Grocery", "Vegetables", "Dairy", "Meat", "Spices", "Other"];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get('/items');
      setItems(response.data);
    } catch (error) {
      setMessage('Error fetching items');
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to disable this item?')) return;

    try {
      await axiosInstance.patch(`/items/${itemId}/disable`);
      fetchItems(); // Refresh the list
    } catch (err) {
      alert('Failed to disable item');
      console.error('Error disabling item:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const tableHeaders = ['Name', 'Category', 'Unit', 'GST', 'Vendors', 'Actions'];

  const tableData = filteredItems.map(item => [
    item?.name || 'N/A',
    item?.category || 'N/A',
    item?.unit || 'N/A',
    item?.gstApplicable ? 'Yes' : 'No',
    item?.vendors?.length || 0,
    <div key={item?._id || Math.random()} className="flex space-x-2">
      <SecondaryButton
        onClick={() => navigate(`/edit-item/${item?._id}`)}
        className="px-2 py-1 text-xs"
      >
        <Edit className="w-4 h-4" />
      </SecondaryButton>
      <SecondaryButton
        onClick={() => handleDisableItem(item?._id)}
        className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </SecondaryButton>
    </div>
  ]);

  if (loading) {
    return (
      <Layout title="Items List" userRole={user.role}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading items...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Items List" userRole={user.role}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-primary text-card rounded-xl p-6 shadow-luxury">
          <h2 className="text-2xl font-bold mb-2">Items Management</h2>
          <p className="text-card/80">View and manage all items in the system</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Item Button */}
            <PrimaryButton
              onClick={() => navigate('/add-item')}
              className="whitespace-nowrap"
            >
              + Add Item
            </PrimaryButton>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-text-dark/60">
            <span>Total Items: {items.length}</span>
            <span>Filtered: {filteredItems.length}</span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {message}
          </div>
        )}

        {/* Table */}
        <StyledTable
          headers={tableHeaders}
          data={tableData}
          className="cursor-pointer"
        />
      </div>
    </Layout>
  );
};

export default ItemsListPage;
