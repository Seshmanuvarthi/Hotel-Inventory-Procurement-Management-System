import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dishName: '',
    ingredients: [{ itemId: '', quantityRequired: '', unit: '' }]
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const units = ["kg", "g", "litre", "ml", "piece", "packet", "dozen", "bottle", "can", "box"];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get('/items');
      setItems(response.data);
    } catch (error) {
      setError('Error fetching items');
      console.error('Error fetching items:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { itemId: '', quantityRequired: '', unit: '' }]
    });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.dishName.trim()) {
        throw new Error('Dish name is required');
      }

      if (formData.ingredients.length === 0) {
        throw new Error('At least one ingredient is required');
      }

      // Validate ingredients
      for (let i = 0; i < formData.ingredients.length; i++) {
        const ingredient = formData.ingredients[i];
        if (!ingredient.itemId || !ingredient.quantityRequired || !ingredient.unit) {
          throw new Error(`Ingredient ${i + 1} is incomplete`);
        }
      }

      await axiosInstance.post('/recipes', formData);
      navigate('/recipe-dashboard');
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Recipe" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Add New Recipe</h2>
          <p className="text-accent">Create a new recipe with ingredients and quantities</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 text-center p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-card rounded-xl shadow-luxury p-8 border border-secondary/10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="dishName" className="block text-sm font-medium text-text-dark mb-2">
                  Dish Name *
                </label>
                <input
                  type="text"
                  id="dishName"
                  name="dishName"
                  value={formData.dishName}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-4 py-3 border border-secondary/30 rounded-lg shadow-sm placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                  placeholder="Enter dish name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-6">
                  Ingredients *
                </label>

                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-6 p-6 bg-background rounded-lg border border-secondary/20">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-accent mb-1">Item</label>
                      <select
                        value={ingredient.itemId}
                        onChange={(e) => handleIngredientChange(index, 'itemId', e.target.value)}
                        className="block w-full px-3 py-2 border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                      >
                        <option value="">Select Item</option>
                        {items.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-accent mb-1">Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ingredient.quantityRequired}
                        onChange={(e) => handleIngredientChange(index, 'quantityRequired', e.target.value)}
                        placeholder="Quantity"
                        className="block w-full px-3 py-2 border border-secondary/30 rounded-md shadow-sm placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-accent mb-1">Unit</label>
                      <select
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        className="block w-full px-3 py-2 border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                      >
                        <option value="">Select Unit</option>
                        {units.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.ingredients.length > 1 && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="px-6 py-3 border border-primary/30 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                  >
                    + Add Ingredient
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-secondary/20">
                <SecondaryButton onClick={() => navigate('/recipe-dashboard')}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Recipe'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddRecipePage;
