import { useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';
import Button from './components/common/Button';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProfilePage from './pages/user/ProfilePage';
import CreateTripPage from './pages/trip/CreateTripPage';
import MyTripsPage from './pages/trip/MyTripsPage';
import NotFoundPage from './pages/error/NotFoundPage';
import ForbiddenPage from './pages/error/ForbiddenPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import HostVerificationPage from './pages/admin/HostVerificationPage';
import UserManagementPage from './pages/admin/user-manager';
import TripManagementPage from './pages/admin/TripManagementPage';
import CountryManagementPage from './pages/admin/country-manager';
import CityManagementPage from './pages/admin/city-manager';
import CategoryManagementPage from './pages/admin/category-manager';
import { MapPin, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import './App.css';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

function Home() {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <Header />

      {/* 2. Hero Section */}
      <main className="flex-1 min-h-screen pt-32 pb-20 px-6 relative overflow-hidden flex items-center justify-center">
        {/* Decorative Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-coral-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-coral-600 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles size={14} className="text-amber-500" />
            Nền tảng Tìm bạn đồng hành & Du lịch nhóm số 1
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
            Khám phá thế giới cùng <br />
            <span className="bg-gradient-to-r from-coral-500 via-amber-500 to-teal-600 bg-clip-text text-transparent">
              Những bạn đồng hành lý tưởng
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            TripMate kết nối bạn với những người cùng đam mê xê dịch. Tạo chuyến đi, ghép nhóm dễ dàng và tận hưởng những hành trình tuyệt vời.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-gradient-to-r from-coral-500 to-amber-500 text-white rounded-2xl shadow-xl shadow-coral-500/30 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Bắt đầu hành trình ngay
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 text-base border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-sm cursor-pointer"
              >
                Đăng nhập tài khoản
              </Button>
            </div>
          )}

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 space-y-3 hover:border-coral-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-coral-50 flex items-center justify-center text-coral-500">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Đa dạng hành trình</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Từ leo núi, cắm trại đến nghỉ dưỡng dã ngoại, tìm chuyến đi phù hợp chỉ trong vài giây.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 space-y-3 hover:border-amber-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác thực an toàn</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Mã OTP Email & Đăng nhập Google xác minh danh tính thành viên minh bạch.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 space-y-3 hover:border-teal-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ghép nhóm tức thì</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Dễ dàng tham gia các nhóm chuyến đi có sẵn hoặc tự đứng ra làm Trưởng đoàn (Organizer).</p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 5. Reusable Scroll To Top Button */}
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/create-trip" element={<CreateTripPage />} />
      <Route path="/trips/create" element={<CreateTripPage />} />
      <Route path="/my-trips" element={<MyTripsPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/host-verifications" element={<HostVerificationPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/trips" element={<TripManagementPage />} />
      <Route path="/admin/countries" element={<CountryManagementPage />} />
      <Route path="/admin/cities" element={<CityManagementPage />} />
      <Route path="/admin/categories" element={<CategoryManagementPage />} />
      {/* Error & Fallback Routes */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
