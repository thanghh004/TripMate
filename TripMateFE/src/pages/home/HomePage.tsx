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
  ShieldCheck,
  Sparkles,
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

      {/* Main Content Feed - Tăng kích thước (max-w-3xl) & khoảng cách hẹp lại (space-y-4) */}
      <main className="flex-1 pt-26 pb-16 px-4 max-w-3xl mx-auto w-full space-y-4 text-left">

        {/* Khung "Đăng tin chuyến đi" TO HƠN, NGUYÊN BẢN FACEBOOK, KHOẢNG CÁCH GẦN LẠI BÀI VIẾT */}
        {isAuthenticated && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            {currentUser?.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt={currentUser.fullName || ''} containerClassName="w-11 h-11 rounded-full border border-slate-200 shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-coral-50 text-coral-600 font-bold text-sm flex items-center justify-center shrink-0 border border-coral-200">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/create-trip')}
              className="flex-1 text-left bg-slate-100/90 hover:bg-slate-200/60 text-slate-600 text-sm font-medium px-5 py-3 rounded-full transition cursor-pointer truncate"
            >
              {currentUser?.fullName ? `${currentUser.fullName} ơi, bạn muốn đi đâu thế? Tạo chuyến đi ngay...` : 'Tạo chuyến đi ngay...'}
            </button>

            {/* 3 Icon Trang Trí Bên Phải (Chỉ để đẹp, Click KHÔNG xảy ra gì) */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 pointer-events-none select-none">
              <span className="p-2 text-rose-500">
                <Sparkles size={20} />
              </span>
              <span className="p-2 text-emerald-500">
                <MapPin size={20} />
              </span>
              <span className="p-2 text-amber-500">
                <ImagePlus size={20} />
              </span>
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

                {/* 2. Post Title & Badges Lộ Trình / Loại Hình */}
                <div className="px-4.5 space-y-2.5">
                  <h2 className="text-lg font-black text-slate-900 leading-snug hover:text-coral-600 transition">
                    {trip.title}
                  </h2>

                  {/* Badges Lộ Trình & Loại Hình */}
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

                {/* 3. Post Cover Image */}
                {trip.coverImageUrl && (
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <Image
                      src={trip.coverImageUrl}
                      alt={trip.title}
                      containerClassName="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                )}

                {/* 4. Action Bar (Icons Trái Tim & Bình Luận) + Dòng Chữ Ở Dưới */}
                <div className="px-4.5 pt-2 border-t border-slate-100 space-y-2">
                  {/* Hàng 1: Icon Trái Tim & Bình Luận Căn Trái */}
                  <div className="flex items-center justify-start gap-4 text-xs font-bold">
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

                  {/* Hàng 2: Dòng Chữ Ở Nằm Bên Dưới Icon Và Ở CHÍNH GIỮA CARD */}
                  <div className="text-center text-[11px] font-semibold text-slate-400 pt-0.5 pb-1 hover:text-coral-500 transition">
                    Nhấn vào bài viết để xem chi tiết
                  </div>
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
