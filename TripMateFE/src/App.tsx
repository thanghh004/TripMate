import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import HomePage from './pages/home/HomePage';
import ProfilePage from './pages/user/ProfilePage';
import CreateTripPage from './pages/trip/CreateTripPage';
import TripDetailPage from './pages/trip/TripDetailPage';
import MyTripsPage from './pages/trip/MyTripsPage';
import JoinedTripsPage from './pages/trip/JoinedTripsPage';
import EditTripPage from './pages/trip/EditTripPage';
import NotFoundPage from './pages/error/NotFoundPage';
import ForbiddenPage from './pages/error/ForbiddenPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import HostVerificationPage from './pages/admin/HostVerificationPage';
import UserManagementPage from './pages/admin/user-manager';
import TripManagementPage from './pages/admin/TripManagementPage';
import AdminTripDetailPage from './pages/admin/AdminTripDetailPage';
import CountryManagementPage from './pages/admin/country-manager';
import CityManagementPage from './pages/admin/city-manager';
import CategoryManagementPage from './pages/admin/category-manager';
import { UserOnlyRoute } from './components/auth/UserOnlyRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* User Only Routes */}
      <Route element={<UserOnlyRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/trips/create" element={<CreateTripPage />} />
        <Route path="/trips/:id" element={<TripDetailPage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
        <Route path="/trips/:id/edit" element={<EditTripPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/joined-trips" element={<JoinedTripsPage />} />
        <Route path="/trips/joined" element={<JoinedTripsPage />} />
      </Route>

      {/* Admin Only Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/host-verifications" element={<HostVerificationPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/trips" element={<TripManagementPage />} />
        <Route path="/admin/trips/:id" element={<AdminTripDetailPage />} />
        <Route path="/admin/countries" element={<CountryManagementPage />} />
        <Route path="/admin/cities" element={<CityManagementPage />} />
        <Route path="/admin/categories" element={<CategoryManagementPage />} />
      </Route>

      {/* Error & Fallback Routes */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
