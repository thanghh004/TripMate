import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import Image from '../../components/common/Image';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
import { formatDate } from '../../utils/formatters';
import { AuthContext } from '../../context/AuthContext';
import {
  Heart,
  MessageCircle,
  MapPin,
  Sparkles,
  Loader2,
  ShieldCheck,
  Compass,
  Image as ImageIcon,
  MoreHorizontal,
  Gift,
  Shield,
  Plane,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPublicTrips = async () => {
      try {
        setIsLoading(true);
        const data = await tripApi.getPublicTrips();
        setTrips(data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách chuyến đi công khai:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicTrips();
  }, []);

  const handleCreateTripClick = () => {
    if (isAuthenticated) {
      navigate('/create-trip');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      {/* Main Content Layout 3 Cột: Banner Trái (3 cols) + Feed Giữa (6 cols) + Banner Phải (3 cols) */}
      <main className="flex-1 pt-24 pb-16 px-4 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI (3 COLS): BANNER DU LỊCH NGHỆ THUẬT A */}
          <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
            {/* Banner 1: Khơi nguồn cảm hứng */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white group cursor-pointer" onClick={() => navigate('/explore')}>
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                  alt="Du lịch Hè 2026"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-coral-500 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full tracking-wider shadow-xs">
                  HOT 2026
                </span>
              </div>
              <div className="p-4 space-y-1.5 text-left">
                <h3 className="text-sm font-black text-slate-900 group-hover:text-coral-500 transition flex items-center gap-1.5">
                  <Plane size={16} className="text-coral-500" /> Hành Trình Mới Hè 2026
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Khám phá những vùng đất thiên nhiên kỳ vĩ cùng đồng đội TripMate!
                </p>
              </div>
            </div>

            {/* Banner 2: Khuyến mãi Ưu đãi */}
            <div className="bg-gradient-to-br from-amber-500 to-coral-600 rounded-3xl p-5 text-white text-left space-y-3 shadow-md relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-15">
                <Gift size={120} />
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs w-max px-3 py-1 rounded-full">
                <Gift size={14} /> Ưu đãi đặc biệt
              </div>
              <h4 className="text-base font-black leading-tight">
                Tạo chuyến đi đầu tiên nhận ngay Badge Host Uy Tín!
              </h4>
              <p className="text-xs text-amber-100 font-medium">
                Kết nối hàng ngàn bạn đồng hành trên toàn quốc dễ dàng.
              </p>
              <button
                onClick={handleCreateTripClick}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-coral-600 font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Đăng tin chuyến đi ngay
              </button>
            </div>
          </div>

          {/* CỘT GIỮA (6 COLS): FEED CHÍNH */}
          <div className="lg:col-span-6 space-y-5 mx-auto w-full max-w-2xl">
            {/* Box Đăng bài phong cách Facebook Feed */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs font-sans text-left space-y-4">
              <div className="flex items-center gap-3">
                {isAuthenticated && user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    containerClassName="w-10 h-10 rounded-full border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-coral-100 text-coral-600 font-black text-base flex items-center justify-center shrink-0">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'}
                  </div>
                )}

                {/* Thanh Input Đăng tin */}
                <button
                  type="button"
                  onClick={handleCreateTripClick}
                  className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-500 font-medium text-xs sm:text-sm px-4 py-3 rounded-full transition cursor-pointer text-left truncate"
                >
                  {isAuthenticated
                    ? `${user?.fullName || 'Bạn'}, bạn muốn đi đâu thế? Tạo chuyến đi ngay...`
                    : 'Bạn muốn đi đâu thế? Đăng nhập để tạo chuyến đi ngay...'}
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-around text-slate-500 text-xs font-semibold">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-default">
                  <Sparkles size={18} className="text-rose-500" />
                  <span>Loại hình</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-default">
                  <MapPin size={18} className="text-emerald-500" />
                  <span>Điểm đến</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-default">
                  <ImageIcon size={18} className="text-amber-500" />
                  <span>Hình ảnh</span>
                </div>
              </div>
            </div>

            {/* DANH SÁCH BÀI VIẾT FEED */}
            {isLoading ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Loader2 size={36} className="animate-spin text-coral-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Đang nạp bảng tin chuyến đi mới nhất...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
                <Compass size={44} className="text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Chưa có chuyến đi nào mở đăng ký</h3>
                <p className="text-xs text-slate-500">Hãy là người đầu tiên tạo chuyến đi để tìm bạn đồng hành!</p>
                <button
                  onClick={handleCreateTripClick}
                  className="px-5 py-2.5 bg-coral-500 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-coral-600 transition cursor-pointer"
                >
                  Tạo chuyến đi mới
                </button>
              </div>
            ) : (
              trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden text-left hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  {/* Header bài viết: Host Info + Post Time */}
                  <div className="p-4 sm:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {trip.organizerAvatarUrl ? (
                        <Image
                          src={trip.organizerAvatarUrl}
                          alt={trip.organizerName}
                          containerClassName="w-10 h-10 rounded-full border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-coral-100 text-coral-600 font-bold text-sm flex items-center justify-center shrink-0">
                          {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                        </div>
                      )}

                      <div className="text-xs leading-tight">
                        <div className="font-bold text-slate-900 group-hover:text-coral-500 transition flex items-center gap-1">
                          {trip.organizerName}
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium pt-0.5 flex items-center gap-1">
                          <span>{formatDate(trip.createdAt)}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-semibold">🌐 Mọi người</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
                        Đang nhận đăng ký
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Tiêu đề & Thông tin cơ bản */}
                  <div className="px-4 sm:px-5 pb-3 space-y-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-coral-500 transition leading-snug">
                      {trip.title}
                    </h2>

                    {/* HÀNG THÔNG TIN: LỘ TRÌNH + LOẠI HÌNH + SỐ TIỀN HIỂN THỊ CHÍNH XÁC (💰 100.000 VNĐ) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      {/* Lộ trình */}
                      <span className="inline-flex items-center gap-1.5 text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
                        <MapPin size={13} className="text-teal-600 shrink-0" />
                        <span>{trip.startCityName || trip.startLocation} ➔ {trip.destinationCityName || trip.destination}</span>
                      </span>

                      {/* Loại hình */}
                      <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
                        <Sparkles size={13} className="text-amber-500 shrink-0" />
                        <span>{trip.categoryName || 'Du lịch'}</span>
                      </span>

                      {/* SỐ TIỀN HIỂN THỊ CÙNG HÀNG VỚI NGHỈ DƯỠNG (Định dạng chính xác: 💰 100.000 VNĐ) */}
                      <span className="inline-flex items-center gap-1 text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-bold">
                        <span>💰 {trip.estimatedCost ? `${trip.estimatedCost.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}</span>
                      </span>
                    </div>

                    {/* Mô tả trích đoạn */}
                    {trip.description && (
                      <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2 pt-1">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  {/* Ảnh Bìa Bài Viết */}
                  {trip.coverImageUrl && (
                    <div className="w-full aspect-video bg-slate-100 overflow-hidden relative">
                      <Image
                        src={trip.coverImageUrl}
                        alt={trip.title}
                        containerClassName="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Footer tương tác: Tym, Comment & Dòng chữ Xem Chi Tiết */}
                  <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-1.5 text-slate-600 hover:text-rose-500 font-semibold text-xs transition">
                          <Heart size={18} />
                          <span>0</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-slate-600 hover:text-coral-500 font-semibold text-xs transition">
                          <MessageCircle size={18} />
                          <span>0</span>
                        </button>
                      </div>
                    </div>

                    {/* Centered Footer Text */}
                    <div className="text-center pt-1 border-t border-slate-100/60">
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-coral-500 transition">
                        Nhấn vào bài viết để xem chi tiết
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CỘT PHẢI (3 COLS): BANNER DU LỊCH NGHỆ THUẬT B */}
          <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
            {/* Banner 1: Cam kết An toàn */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs text-left space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-wider">
                <Shield size={18} /> Cam Kết An Toàn 100%
              </div>
              <h4 className="text-xs font-extrabold text-slate-800 leading-relaxed">
                Tất cả Trưởng đoàn (Host) đều được xác minh danh tính qua CCCD kỹ lưỡng.
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                TripMate giúp bạn hoàn toàn an tâm trong suốt chuyến đi cùng những người bạn đồng hành mới.
              </p>
            </div>

            {/* Banner 2: Hình ảnh điểm đến đẹp */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white group cursor-pointer" onClick={() => navigate('/explore')}>
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80"
                  alt="Vịnh Hạ Long"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white font-black text-xs flex items-center gap-1">
                  <MapPin size={14} className="text-coral-400" /> Vịnh Hạ Long, Quảng Ninh
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomePage;
