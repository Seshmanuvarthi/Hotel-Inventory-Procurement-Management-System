import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AddOptionsPage from './pages/AddOptionsPage';
import DeleteOptionsPage from './pages/DeleteOptionsPage';
import AddUserOrHotelPage from './pages/AddUserOrHotelPage';
import DeleteUserPage from './pages/DeleteUserPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/superadmin-dashboard"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin-add-options"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <AddOptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin-delete-options"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <DeleteOptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-user-or-hotel"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <AddUserOrHotelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delete-user"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <DeleteUserPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
