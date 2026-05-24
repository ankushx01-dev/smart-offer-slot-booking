import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/admin/LoginPage';
import RegisterPage from './pages/admin/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import BusinessPage from './pages/admin/BusinessPage';
import CreateOfferPage from './pages/admin/CreateOfferPage';
import EditOfferPage from './pages/admin/EditOfferPage';
import ManageOffersPage from './pages/admin/ManageOffersPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import OfferListingPage from './pages/public/OfferListingPage';
import OfferDetailPage from './pages/public/OfferDetailPage';
import BookingConfirmationPage from './pages/public/BookingConfirmationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OfferListingPage />} />
        <Route path="/offers/:id" element={<OfferDetailPage />} />
        <Route path="/booking/confirmation/:reference" element={<BookingConfirmationPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/register" element={<RegisterPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="business" element={<BusinessPage />} />
          <Route path="offers" element={<ManageOffersPage />} />
          <Route path="offers/new" element={<CreateOfferPage />} />
          <Route path="offers/:id/edit" element={<EditOfferPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
