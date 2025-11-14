import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import axiosInstance from '../utils/axiosInstance';

const RecipeDashboard = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axiosInstance.get('/recipes');
      setRecipes(response.data);
    } catch (error) {
      setError('Error fetching recipes');
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await axiosInstance.delete(`/recipes/${id}`);
      setRecipes(recipes.filter(recipe => recipe._id !== id));
    } catch (error) {
      setError('Error deleting recipe');
      console.error('Error deleting recipe:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="Recipe Management" userRole={user.role}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent">Loading recipes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Recipe Management" userRole={user.role}>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Recipe Management</h2>
          <p className="text-accent">Manage your restaurant recipes and ingredients</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 text-center p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div></div>
            <div className="flex space-x-4">
              <PrimaryButton onClick={() => navigate('/add-recipe')}>
                Add Recipe
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate('/superadmin-dashboard')}>
                Back to Dashboard
              </SecondaryButton>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-luxury p-6 border border-secondary/10">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Recipes</h3>

            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-xl text-secondary font-medium mb-2">No recipes found</p>
                <p className="text-accent">Create your first recipe to get started.</p>
              </div>
            ) : (
              <ul className="divide-y divide-secondary/20">
                {recipes.map((recipe) => (
                  <li key={recipe._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-text-dark">{recipe.dishName}</h3>
                        <p className="text-sm text-accent">
                          Created by: {recipe.createdBy?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-accent">
                          Ingredients: {recipe.ingredients?.length || 0}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <SecondaryButton onClick={() => navigate(`/edit-recipe/${recipe._id}`)}>
                          Edit
                        </SecondaryButton>
                        <button
                          onClick={() => handleDelete(recipe._id)}
                          className="py-2 px-4 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipeDashboard;
