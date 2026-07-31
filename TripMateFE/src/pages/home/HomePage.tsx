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
  ArrowUpRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
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

      {/* Main Content Feed - Căn giữa đẹp mắt (max-w-2xl) */}
      <main className="flex-1 pt-28 pb-16 px-4 max-w-2xl mx-auto w-full space-y-5 text-left">

        {/* Header Tiêu đề Trang Feed */}
        <div className="flex items-center justify-between bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-coral-50 flex items-center justify-center text-coral-500">
              <Compass size={20} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                Bảng tin Chuyến đi
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Hành trình nổi bật đã phê duyệt và sẵn sàng cho bạn tham gia.
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => navigate('/create-trip')}
              className="bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Sparkles size={14} /> + Đăng chuyến đi
            </button>
          )}
        </div>

        {/* Danh sách Feeds Bài viết Chuyến đi */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <span className="text-xs font-semibold">Đang nạp bảng tin chuyến đi...</span>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <Compass size={36} className="mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Chưa có chuyến đi nào được duyệt</h3>
            <p className="text-xs text-slate-500">Hãy đăng tin chuyến đi đầu tiên của bạn ngay hôm nay!</p>
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
                <div className="px-4 flex items-center justify-between">
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

                {/* 2. Post Title, Route Badges & Key Details */}
                <div className="px-4 space-y-2.5">
                  <h2 className="text-base font-extrabold text-slate-900 leading-snug hover:text-coral-600 transition">
                    {trip.title}
                  </h2>

                  {/* Badges Lộ Trình & Loại Hình */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                      <MapPin size={12} className="text-teal-600" />
                      {trip.startLocation}{trip.startCityName ? ` (${trip.startCityName})` : ''} ➔ {trip.destination}{trip.destinationCityName ? ` (${trip.destinationCityName})` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-coral-700 bg-coral-50 border border-coral-100 px-2.5 py-1 rounded-lg">
                      <Sparkles size={11} className="text-coral-500" />
                      {trip.categoryName || 'Du lịch'}
                    </span>
                  </div>

                  {/* Thông tin Thời gian & Chi phí hiển thị thanh thoát */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Calendar size={13} className="text-coral-500" />
                      Khởi hành: <strong className="text-slate-900 font-bold">{formatDate(trip.startDate)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Users size={13} className="text-teal-600" />
                      Thành viên: <strong className="text-slate-900 font-bold">{trip.currentMembers}/{trip.maxMembers}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-coral-600 font-black">
                      {trip.estimatedCost ? `${trip.estimatedCost.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                    </span>
                  </div>

                  {trip.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-0.5 font-medium">
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

                {/* 4. Action Bar DỒN HẾT VỀ PHÍA BÊN PHẢI (Heart + Count, Comment + Count, View Detail) */}
                <div className="px-4 pt-2.5 flex items-center justify-between border-t border-slate-100 text-xs font-bold">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Nhấn vào bài viết để xem chi tiết
                  </div>

                  {/* Cụm 3 Icon Dồn Hết Về Bên Phải */}
                  <div className="flex items-center gap-4">
                    {/* Icon Trái Tim + Số lượt thích */}
                    <button
                      type="button"
                      onClick={(e) => toggleLike(trip.id, e)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer hover:bg-rose-50 ${
                        isLiked ? 'text-rose-600 font-black' : 'text-slate-600 hover:text-rose-600'
                      }`}
                      title="Thích bài viết"
                    >
                      <Heart size={16} className={isLiked ? 'fill-rose-600 text-rose-600' : ''} />
                      <span className="text-xs">{isLiked ? 1 : 0}</span>
                    </button>

                    {/* Icon Bình Luận + Số bình luận */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trips/${trip.id}`);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-600 hover:text-coral-600 hover:bg-coral-50 transition cursor-pointer"
                      title="Bình luận & Thảo luận"
                    >
                      <MessageSquare size={16} />
                      <span className="text-xs">0</span>
                    </button>

                    {/* Icon Xem & Tham Gia Nút Nhỏ Gọn */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trips/${trip.id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-coral-50 hover:bg-coral-100 text-coral-600 transition cursor-pointer font-black text-xs"
                      title="Xem chi tiết & Đăng ký tham gia"
                    >
                      <span>Xem & Tham gia</span>
                      <ArrowUpRight size={15} />
                    </button>
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
