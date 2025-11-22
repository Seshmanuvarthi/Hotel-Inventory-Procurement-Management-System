import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserListPage from './pages/UserListPage';
import AddOptionsPage from './pages/AddOptionsPage';
import DeleteOptionsPage from './pages/DeleteOptionsPage';
import AddUserOrHotelPage from './pages/AddUserOrHotelPage';
import DeleteUserPage from './pages/DeleteUserPage';
import AddItemPage from './pages/AddItemPage';
import ItemsListPage from './pages/ItemsListPage';
import EditItemPage from './pages/EditItemPage';
import DisableItemPage from './pages/DisableItemPage';
import RecipeDashboard from './pages/RecipeDashboard';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import AddVendorPage from './pages/AddVendorPage';
import UploadBillPage from './pages/UploadBillPage';
import UploadBillListPage from './pages/UploadBillListPage';
import StoreManagerDashboard from './pages/StoreManagerDashboard';
import IssueStockPage from './pages/IssueStockPage';
import StoreStockPage from './pages/StoreStockPage';
import IssueLogPage from './pages/IssueLogPage';
import ProcurementDashboard from './pages/ProcurementDashboard';
import CreateProcurementOrder from './pages/CreateProcurementOrder';
import ProcurementOrdersList from './pages/ProcurementOrdersList';
import ProcurementRequestDetail from './pages/ProcurementRequestDetail';
import MDApprovalDashboard from './pages/MDApprovalDashboard';
import CreateRestaurantStockRequest from './pages/CreateRestaurantStockRequest';
import RestaurantStockRequestsList from './pages/RestaurantStockRequestsList';
import RestaurantStockRequestDetail from './pages/RestaurantStockRequestDetail';
import PendingRestaurantStockRequests from './pages/PendingRestaurantStockRequests';
import HotelDashboard from './pages/HotelDashboard';
import ConsumptionEntry from './pages/ConsumptionEntry';
import OrderEntry from './pages/OrderEntry';
import MDReportsDashboard from './pages/MDReportsDashboard';
import IssuedVsConsumedPage from './pages/IssuedVsConsumedPage';
import ConsumedVsSalesPage from './pages/ConsumedVsSalesPage';
import LeakagePage from './pages/LeakagePage';
import LeakageAlertsPage from './pages/LeakageAlertsPage';
import AccountsDashboard from './pages/AccountsDashboard';
import EnterPaymentPage from './pages/EnterPaymentPage';
import PendingPaymentsPage from './pages/PendingPaymentsPage';
import VendorLedger from './pages/VendorLedger';
import PaymentSummary from './pages/PaymentSummary';
import MDAnalyticsDashboard from './pages/MDAnalyticsDashboard';
import BillsListPage from './pages/BillsListPage';
import CreateOutwardMaterialRequest from './pages/CreateOutwardMaterialRequest';
import OutwardMaterialRequestsList from './pages/OutwardMaterialRequestsList';
import InwardStockLogsPage from './pages/InwardStockLogsPage';
import OutwardStockLogsPage from './pages/OutwardStockLogsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/superadmin-dashboard"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users-list"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <UserListPage />
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
        <Route
          path="/add-item"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'procurement_officer']}>
              <AddItemPage />
            </ProtectedRoute>
          }
        />
        <Route path="/items-list" element={<ItemsListPage />} />
        <Route
          path="/edit-item/:id"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'procurement_officer']}>
              <EditItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disable-item"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'procurement_officer']}>
              <DisableItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipe-dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'procurement_officer']}>
              <RecipeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-recipe"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'procurement_officer']}>
              <AddRecipePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-recipe/:id"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'procurement_officer']}>
              <EditRecipePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-vendor"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'procurement_officer']}>
              <AddVendorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-dashboard"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin', 'md']}>
              <StoreManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issue-stock"
          element={
            <ProtectedRoute allowedRoles={['store_manager']}>
              <IssueStockPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-stock"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin', 'md']}>
              <StoreStockPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issue-log"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin', 'md']}>
              <IssueLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-bill-list"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin']}>
              <UploadBillListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-bill/:id"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin']}>
              <UploadBillPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement-dashboard"
          element={
            <ProtectedRoute allowedRoles={['procurement_officer']}>
              <ProcurementDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-procurement-order"
          element={
            <ProtectedRoute allowedRoles={['procurement_officer']}>
              <CreateProcurementOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement-orders"
          element={
            <ProtectedRoute allowedRoles={['procurement_officer', 'md', 'accounts', 'superadmin']}>
              <ProcurementOrdersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement-orders/:id"
          element={
            <ProtectedRoute allowedRoles={['procurement_officer', 'md', 'accounts', 'superadmin']}>
              <ProcurementRequestDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/md-approvals"
          element={
            <ProtectedRoute allowedRoles={['md', 'superadmin']}>
              <MDApprovalDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel-dashboard"
          element={
            <ProtectedRoute allowedRoles={['hotel_manager']}>
              <HotelDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-outward-material-request"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'md']}>
              <CreateOutwardMaterialRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/outward-material-requests"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'md', 'hotel_manager']}>
              <OutwardMaterialRequestsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/outward-material-request/:id"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'md', 'hotel_manager']}>
              <OutwardMaterialRequestsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inward-stock-logs"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin', 'md']}>
              <InwardStockLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/outward-stock-logs"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin', 'md']}>
              <OutwardStockLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-restaurant-stock-request"
          element={
            <ProtectedRoute allowedRoles={['hotel_manager']}>
              <CreateRestaurantStockRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-stock-requests"
          element={
            <ProtectedRoute allowedRoles={['hotel_manager']}>
              <RestaurantStockRequestsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-stock-request/:id"
          element={
            <ProtectedRoute allowedRoles={['hotel_manager', 'store_manager', 'superadmin']}>
              <RestaurantStockRequestDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-restaurant-stock-requests"
          element={
            <ProtectedRoute allowedRoles={['store_manager', 'superadmin']}>
              <PendingRestaurantStockRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consumption-entry"
          element={
            <ProtectedRoute allowedRoles={['hotel_manager']}>
              <ConsumptionEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-entry"
          element={
            <ProtectedRoute allowedRoles={['hotel_manager']}>
              <OrderEntry />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/md-reports-dashboard"
          element={
            <ProtectedRoute allowedRoles={['md', 'superadmin']}>
              <MDReportsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/issued-vs-consumed"
          element={
            <ProtectedRoute allowedRoles={['md', 'superadmin']}>
              <IssuedVsConsumedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/consumed-vs-sales"
          element={
            <ProtectedRoute allowedRoles={['md', 'superadmin']}>
              <ConsumedVsSalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/leakage"
          element={
            <ProtectedRoute allowedRoles={['md', 'superadmin']}>
              <LeakagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leakage-alerts"
          element={
            <ProtectedRoute allowedRoles={['md', 'superadmin']}>
              <LeakageAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts-dashboard"
          element={
            <ProtectedRoute requiredRole="accounts">
              <AccountsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute allowedRoles={['accounts', 'store_manager', 'superadmin', 'procurement_officer', 'md']}>
              <BillsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enter-payment/:id"
          element={
            <ProtectedRoute requiredRole="accounts">
              <EnterPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-payments"
          element={
            <ProtectedRoute allowedRoles={['accounts', 'md']}>
              <PendingPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-ledger"
          element={
            <ProtectedRoute allowedRoles={['accounts', 'md']}>
              <VendorLedger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-summary"
          element={
            <ProtectedRoute allowedRoles={['accounts', 'md']}>
              <PaymentSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/md-analytics"
          element={
            <ProtectedRoute requiredRole="md">
              <MDAnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<LoginPage />} />
        <Route path="/items-list" element={<ItemsListPage />} />
        <Route
          path="/procurement-request/:id"
          element={
            <ProtectedRoute allowedRoles={['procurement_officer', 'md', 'accounts', 'superadmin']}>
              <ProcurementRequestDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
