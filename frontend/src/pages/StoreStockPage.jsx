import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StyledTable from '../components/StyledTable';
import axiosInstance from '../utils/axiosInstance';

const StoreStockPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStoreStock();
  }, []);

  const fetchStoreStock = async () => {
    try {
      const response = await axiosInstance.get('/store/stock');
      setStocks(response.data);
    } catch (error) {
      setMessage('Error fetching store stock');
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (stock) => {
    if (!stock.minimumStockLevel) return false;
    const reorderLevel = (stock.reorderLevelPercent / 100) * stock.minimumStockLevel;
    return stock.quantityOnHand <= reorderLevel;
  };

  const tableHeaders = ['Item Name', 'Quantity On Hand', 'Minimum Stock Level', 'Reorder Level %', 'Status'];
  const tableData = stocks.map((stock) => [
    stock.itemId?.name || 'Unknown Item',
    `${stock.quantityOnHand} ${stock.itemId?.unit || ''}`,
    stock.minimumStockLevel || 'Not set',
    `${stock.reorderLevelPercent}%`,
    isLowStock(stock) ? 'Low Stock' : 'In Stock'
  ]);

  if (loading) {
    return (
      <Layout title="Store Stock" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading store stock...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const lowStockCount = stocks.filter(stock => isLowStock(stock)).length;
  const totalItems = stocks.length;

  return (
    <Layout title="Store Stock" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Store Stock</h2>
          <p className="text-accent">Monitor central store inventory levels and stock status</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {message && (
            <div className="mb-6 text-center p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{totalItems}</div>
                <p className="text-sm text-accent">Total Items</p>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{totalItems - lowStockCount}</div>
                <p className="text-sm text-accent">In Stock</p>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-luxury p-6 border border-warning/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-2">{lowStockCount}</div>
                <p className="text-sm text-accent">Low Stock</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Inventory Overview</h3>

            {stocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl text-secondary font-medium mb-2">No stock data available</p>
                <p className="text-accent">Stock information will appear here once items are added.</p>
              </div>
            ) : (
              <StyledTable
                headers={tableHeaders}
                data={tableData}
              />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-secondary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Stock Management Guidelines</h3>
            <p className="text-sm text-accent">
              Monitor stock levels regularly and reorder items when they reach the reorder level.
              Items marked as "Low Stock" require immediate attention for procurement.
              Maintain accurate minimum stock levels to ensure smooth operations.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StoreStockPage;
