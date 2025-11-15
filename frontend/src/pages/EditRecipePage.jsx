import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [recipe, setRecipe] = useState({
    dishName: '',
    ingredients: []
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRecipe = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/recipes/${id}`);
      setRecipe({
        dishName: response.data.dishName,
        ingredients: response.data.ingredients || []
      });
    } catch (error) {
      setError('Error fetching recipe');
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/items');
      setItems(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecipe();
    fetchItems();
  }, [fetchRecipe, fetchItems]);

  const handleAddIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { itemId: '', quantity: 0 }]
    }));
  };

  const handleRemoveIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await axiosInstance.patch(`/recipes/${id}`, recipe);
      navigate('/recipe-dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating recipe');
      console.error('Error updating recipe:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edit Recipe" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading recipe...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Recipe" userRole={user.role}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Edit Recipe</h2>
          <p className="text-accent">Update recipe details and ingredients</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-center p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <div className="space-y-6">
              <div>
                <label htmlFor="dishName" className="block text-sm font-medium text-text-dark mb-2">
                  Dish Name *
                </label>
                <input
                  type="text"
                  id="dishName"
                  value={recipe.dishName}
                  onChange={(e) => setRecipe(prev => ({ ...prev, dishName: e.target.value }))}
                  className="w-full px-4 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-text-dark">Ingredients</h3>
                  <SecondaryButton type="button" onClick={handleAddIngredient}>
                    Add Ingredient
                  </SecondaryButton>
                </div>

                {recipe.ingredients.length === 0 ? (
                  <div className="text-center py-8 text-accent">
                    No ingredients added yet. Click "Add Ingredient" to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-secondary/5 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-text-dark mb-1">
                            Item
                          </label>
                          <select
                            value={ingredient.itemId}
                            onChange={(e) => handleIngredientChange(index, 'itemId', e.target.value)}
                            className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            required
                          >
                            <option value="">Select an item</option>
                            {items.map(item => (
                              <option key={item._id} value={item._id}>
                                {item.name} ({item.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-32">
                          <label className="block text-sm font-medium text-text-dark mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <SecondaryButton type="button" onClick={() => navigate('/recipe-dashboard')}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Recipe'}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditRecipePage;
