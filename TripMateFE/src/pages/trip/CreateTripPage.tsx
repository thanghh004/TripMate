import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import { tripApi } from '../../api/tripApi';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  PlusCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const CreateTripPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();

  const [title, setTitle] = useState('Khám phá Hà Giang 3 ngày 2 đêm cùng TripMate');
  const [description, setDescription] = useState('Chuyến đi trải nghiệm văn hóa địa phương và săn mây tại Đồng Văn.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái kết quả phản hồi kiểm tra phân quyền từ Backend
  const [backendError, setBackendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gọi API Backend kiểm tra phân quyền thời gian thực khi bấm Tạo chuyến đi
  const handleCreateTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBackendError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      // Gửi request tạo chuyến đi sang API Backend: POST /api/trips
      const response = await tripApi.createTrip({ title, description });
      if (response.status === 200) {
        setSuccessMessage(response.message || 'Tạo chuyến đi mới thành công!');
      }
    } catch (err: any) {
      // Backend (Application Layer) ném BusinessRuleException và trả về lỗi 400
      const errorMsg =
        err.response?.data?.message ||
        'Tài khoản của bạn không có đủ thẩm quyền để tạo chuyến đi mới.';
      setBackendError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-28 pb-16 space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
          <span className="text-xs font-extrabold text-coral-600 bg-coral-50 px-3 py-1 rounded-full border border-coral-200">
            TripMate Host Verification System
          </span>
        </div>

        {/* Màn hình khởi tạo chuyến đi Demo */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-left space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PlusCircle size={26} className="text-coral-500" />
              Tạo chuyến đi mới (Backend Permission Test)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Khi bạn bấm **Tạo chuyến đi**, hệ thống sẽ gửi API `POST /api/trips` lên Backend. CSDL Backend (Application Layer) sẽ trực tiếp kiểm tra trạng thái duyệt Host (`HostVerificationStatus`) của bạn.
            </p>
          </div>

          {/* Banner Thông báo Lỗi phân quyền từ Backend */}
          {backendError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in">
              <ShieldAlert size={24} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold">Từ chối thao tác từ Backend (Phân quyền bảo mật)</p>
                <p className="text-xs text-rose-700 font-medium leading-relaxed">{backendError}</p>
                <div className="pt-2">
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-800 underline hover:text-rose-950"
                  >
                    Chuyển đến trang Hồ sơ cá nhân để kiểm tra CCCD & gửi yêu cầu duyệt &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Banner Thông báo Thành công từ Backend */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in fade-in">
              <ShieldCheck size={24} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold">Xác thực thành công!</p>
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Form Tạo Chuyến Đi Demo */}
          <form onSubmit={handleCreateTripSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Tiêu đề chuyến đi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
                placeholder="Nhập tiêu đề chuyến đi..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Mô tả chi tiết
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition resize-none"
                placeholder="Mô tả chuyến đi..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <AlertCircle size={15} /> Kiểm tra phân quyền trực tiếp qua MediatR Handler Backend.
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Trở về
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Đang kiểm tra...
                    </>
                  ) : (
                    'Tạo chuyến đi (Gửi API Backend)'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
};

export default CreateTripPage;
