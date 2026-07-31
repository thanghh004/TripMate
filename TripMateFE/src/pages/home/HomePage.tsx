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
  ImagePlus,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 max-w-2xl mx-auto w-full space-y-6">
        {/* Box Đăng bài phong cách Facebook: CÙNG HÀNG VỚI INPUT, ICON KHÔNG CÓ CHỮ */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs text-left">
          <div className="flex items-center gap-3">
            {/* Avatar */}
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

            {/* Thanh Input dài */}
            <button
              type="button"
              onClick={handleCreateTripClick}
              className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-500 font-medium text-xs sm:text-sm px-4 py-3 rounded-full transition cursor-pointer text-left truncate"
            >
              {isAuthenticated
                ? `${user?.fullName || 'Bạn'}, bạn muốn đi đâu thế? Tạo chuyến đi ngay...`
                : 'Bạn muốn đi đâu thế? Đăng nhập để tạo chuyến đi ngay...'}
            </button>

            {/* 3 Icon nằm CÙNG HÀNG bên phải KHÔNG CÓ CHỮ */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCreateTripClick}
                title="Loại hình chuyến đi"
                className="p-2 rounded-full hover:bg-rose-50 text-rose-500 transition cursor-pointer"
              >
                <Sparkles size={20} />
              </button>
              <button
                type="button"
                onClick={handleCreateTripClick}
                title="Địa điểm đến"
                className="p-2 rounded-full hover:bg-emerald-50 text-emerald-500 transition cursor-pointer"
              >
                <MapPin size={20} />
              </button>
              <button
                type="button"
                onClick={handleCreateTripClick}
                title="Hình ảnh"
                className="p-2 rounded-full hover:bg-amber-50 text-amber-500 transition cursor-pointer"
              >
                <ImagePlus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* DANH SÁCH BÀI VIẾT NGUYÊN BẢN */}
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
              {/* Header bài viết */}
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
                    <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                      {formatDate(trip.createdAt)}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
                  Đang nhận đăng ký
                </span>
              </div>

              {/* Tiêu đề & Tag */}
              <div className="px-4 sm:px-5 pb-3 space-y-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-coral-500 transition leading-snug">
                  {trip.title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
                    <MapPin size={13} className="text-teal-600 shrink-0" />
                    <span>{trip.startCityName || trip.startLocation} ➔ {trip.destinationCityName || trip.destination}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
                    <Sparkles size={13} className="text-amber-500 shrink-0" />
                    <span>{trip.categoryName || 'Du lịch'}</span>
                  </span>
                </div>

                {trip.description && (
                  <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2 pt-1">
                    {trip.description}
                  </p>
                )}
              </div>

              {/* Ảnh Bìa */}
              {trip.coverImageUrl && (
                <div className="w-full aspect-video bg-slate-100 overflow-hidden relative">
                  <Image
                    src={trip.coverImageUrl}
                    alt={trip.title}
                    containerClassName="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Footer */}
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

                <div className="text-center pt-1 border-t border-slate-100/60">
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-coral-500 transition">
                    Nhấn vào bài viết để xem chi tiết
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default HomePage;
