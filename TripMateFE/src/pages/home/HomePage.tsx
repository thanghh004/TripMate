import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import Image from '../../components/common/Image';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
import { TripStatus } from '../../types/trip';
import { formatDate } from '../../utils/formatters';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
  Users,
  Heart,
  MessageSquare,
  Compass,
  Loader2,
  Globe,
  MoreHorizontal,
  ImagePlus,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const currentUser = authContext?.user;
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedTripIds, setLikedTripIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchPublicTrips = async () => {
      try {
        setIsLoading(true);
        const data = await tripApi.getPublicTrips();
        setTrips(data || []);
      } catch (err) {
        console.error('Không thể tải danh sách chuyến đi công khai:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicTrips();
  }, []);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTripIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      {/* Header / Navbar */}
      <Header />

      {/* Main Content Feed - Tăng kích thước rộng rãi hơn (max-w-3xl) */}
      <main className="flex-1 pt-28 pb-16 px-4 max-w-3xl mx-auto w-full space-y-6 text-left">

        {/* Khung "Đăng tin chuyến đi" NGUYÊN BẢN PHONG CÁCH FACEBOOK 100% NHƯ ẢNH MẪU */}
        {isAuthenticated && (
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            {currentUser?.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt={currentUser.fullName || ''} containerClassName="w-10 h-10 rounded-full border border-slate-200 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-600 font-bold text-xs flex items-center justify-center shrink-0 border border-coral-200">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/create-trip')}
              className="flex-1 text-left bg-slate-100/80 hover:bg-slate-200/60 text-slate-500 text-xs font-medium px-4 py-2.5 rounded-full transition cursor-pointer truncate"
            >
              {currentUser?.fullName ? `${currentUser.fullName} ơi, bạn muốn đi đâu thế? Tạo chuyến đi ngay...` : 'Tạo chuyến đi ngay...'}
            </button>

            {/* 3 Icon Phía Bên Phải NGUYÊN BẢN FACEBOOK */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/create-trip')}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition cursor-pointer"
                title="Lên lịch trình mới"
              >
                <Sparkles size={20} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/create-trip')}
                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition cursor-pointer"
                title="Chọn địa điểm đến"
              >
                <MapPin size={20} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/create-trip')}
                className="p-2 text-amber-500 hover:bg-amber-50 rounded-full transition cursor-pointer"
                title="Thêm ảnh chuyến đi"
              >
                <ImagePlus size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Danh sách Feeds Bài viết Chuyến đi */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <span className="text-xs font-semibold">Đang tải bảng tin chuyến đi...</span>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <Compass size={36} className="mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Chưa có chuyến đi nào được duyệt</h3>
            <p className="text-xs text-slate-500">Hãy là người đầu tiên tạo chuyến đi mới nhé!</p>
          </div>
        ) : (
          trips.map((trip) => {
            const isLiked = likedTripIds.includes(trip.id);
            return (
              <article
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden font-sans space-y-3.5 pt-4 pb-3"
              >
                {/* 1. Header Post (Avatar, Host Name, Verified badge, Time & Status) */}
                <div className="px-4.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {trip.organizerAvatarUrl ? (
                      <Image src={trip.organizerAvatarUrl} alt={trip.organizerName} containerClassName="w-10 h-10 rounded-full border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-600 font-black text-sm flex items-center justify-center shrink-0 border border-coral-200">
                        {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                      </div>
                    )}

                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{trip.organizerName}</span>
                        <span title="Host đã xác minh danh tính">
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <span>{formatDate(trip.createdAt)}</span>
                        <span>•</span>
                        <Globe size={11} className="text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {trip.status === TripStatus.Full ? (
                      <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                        Đã đủ chỗ
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                        Đang nhận đăng ký
                      </span>
                    )}
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* 2. Post Title & Route Badges */}
                <div className="px-4.5 space-y-2.5">
                  <h2 className="text-lg font-black text-slate-900 leading-snug hover:text-coral-600 transition">
                    {trip.title}
                  </h2>

                  {/* Badges Lộ Trình & Loại Hình - Chỉnh viền và nền dịu nhẹ mượt mà */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50/90 border border-teal-200/80 px-3 py-1 rounded-full">
                      <MapPin size={13} className="text-teal-600" />
                      {trip.startLocation}{trip.startCityName ? ` (${trip.startCityName})` : ''} ➔ {trip.destination}{trip.destinationCityName ? ` (${trip.destinationCityName})` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-coral-700 bg-orange-50/80 border border-orange-200/80 px-3 py-1 rounded-full">
                      <Sparkles size={12} className="text-coral-500" />
                      {trip.categoryName || 'Du lịch'}
                    </span>
                  </div>

                  {trip.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 pt-0.5 font-medium">
                      {trip.description}
                    </p>
                  )}
                </div>

                {/* 3. Dải Thông Tin Chuyến Đi Đầy Đặn (Ngày đi, Số chỗ, Chi phí) */}
                <div className="mx-4.5 p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-coral-500 shrink-0" />
                    <span>Lịch trình: <strong className="text-slate-900 font-bold">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-teal-600 shrink-0" />
                    <span>Thành viên: <strong className="text-slate-900 font-bold">{trip.currentMembers}/{trip.maxMembers} người</strong></span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">Chi phí:</span>
                    <span className="text-coral-600 font-black text-sm">
                      {trip.estimatedCost ? `${trip.estimatedCost.toLocaleString('vi-VN')}đ / người` : 'Miễn phí'}
                    </span>
                  </div>
                </div>

                {/* 4. Post Cover Image */}
                {trip.coverImageUrl && (
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <Image
                      src={trip.coverImageUrl}
                      alt={trip.title}
                      containerClassName="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                )}

                {/* 5. Action Bar CĂN TRÁI (Heart + Count, Comment + Count) */}
                <div className="px-4.5 pt-2 flex items-center justify-start gap-4 border-t border-slate-100 text-xs font-bold">
                  {/* Icon Trái Tim + Số lượt thích */}
                  <button
                    type="button"
                    onClick={(e) => toggleLike(trip.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer hover:bg-rose-50 ${
                      isLiked ? 'text-rose-600 font-black' : 'text-slate-600 hover:text-rose-600'
                    }`}
                    title="Thích bài viết"
                  >
                    <Heart size={18} className={isLiked ? 'fill-rose-600 text-rose-600' : ''} />
                    <span className="text-xs">{isLiked ? 1 : 0}</span>
                  </button>

                  {/* Icon Bình Luận + Số bình luận */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/trips/${trip.id}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-coral-600 hover:bg-coral-50 transition cursor-pointer"
                    title="Bình luận & Thảo luận"
                  >
                    <MessageSquare size={18} />
                    <span className="text-xs">0</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll To Top */}
      <ScrollToTop />
    </div>
  );
};

export default HomePage;
