import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
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
  Send,
  Compass,
  Loader2,
  Globe,
  MoreHorizontal,
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

      {/* Main Container 3 Cột Phong Cách Facebook */}
      <main className="flex-1 pt-24 pb-16 px-3 sm:px-6 max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* CỘT TRÁI (LEFT SIDEBAR - 3 COLS - Profile summary & Shortcuts) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4 text-left">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 sticky top-24">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                {currentUser.avatarUrl ? (
                  <Image src={currentUser.avatarUrl} alt={currentUser.fullName} containerClassName="w-11 h-11 rounded-full border border-slate-200" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-coral-50 text-coral-600 font-bold text-sm flex items-center justify-center border border-coral-200">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-slate-900 truncate">{currentUser.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gradient-to-r from-coral-500/10 to-amber-500/10 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-800">Tham gia TripMate ngay!</p>
                <p className="text-[11px] text-slate-500">Đăng nhập để kết nối bạn đồng hành và tạo chuyến đi của riêng bạn.</p>
                <Button onClick={() => navigate('/login')} className="w-full bg-coral-500 text-white font-bold text-xs py-2 rounded-xl">
                  Đăng nhập
                </Button>
              </div>
            )}

            {/* Menu phím tắt */}
            <div className="space-y-1 font-semibold text-xs text-slate-700">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-coral-50 text-coral-600 font-bold transition cursor-pointer"
              >
                <Compass size={18} /> Newsfeed Chuyến Đi
              </button>

              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate('/my-trips')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                  >
                    <Users size={18} className="text-amber-500" /> Chuyến Đi Của Tôi
                  </button>
                  <button
                    onClick={() => navigate('/create-trip')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                  >
                    <Sparkles size={18} className="text-teal-600" /> + Đăng Chuyến Đi Mới
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CỘT GIỮA (NEWSFEED - 6 COLS - FACEBOOK STYLE TRIP POSTS) */}
        <div className="lg:col-span-6 space-y-5 text-left">

          {/* Khung "Đăng tin chuyến đi mới" phong cách Facebook */}
          {isAuthenticated && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                {currentUser?.avatarUrl ? (
                  <Image src={currentUser.avatarUrl} alt={currentUser.fullName || ''} containerClassName="w-10 h-10 rounded-full border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-600 font-bold text-xs flex items-center justify-center shrink-0 border border-coral-200">
                    {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                <button
                  onClick={() => navigate('/create-trip')}
                  className="w-full text-left bg-slate-100 hover:bg-slate-200/70 text-slate-500 text-xs font-medium px-4 py-2.5 rounded-full transition cursor-pointer"
                >
                  {currentUser?.fullName ? `${currentUser.fullName} ơi, bạn sắp đi đâu thế? Đăng tin tuyển bạn ngay...` : 'Đăng tin tuyển bạn đồng hành...'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-xs font-bold text-slate-600">
                <button onClick={() => navigate('/create-trip')} className="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition cursor-pointer text-coral-600">
                  <Sparkles size={16} /> Lên lịch trình
                </button>
                <button onClick={() => navigate('/create-trip')} className="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition cursor-pointer text-teal-600">
                  <MapPin size={16} /> Chọn địa điểm
                </button>
              </div>
            </div>
          )}

          {/* Danh sách Bài Đăng Chuyến Đi (Facebook Post Feeds) */}
          {isLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-coral-500" />
              <span className="text-xs font-semibold">Đang tải bảng tin chuyến đi...</span>
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
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden font-sans space-y-3.5 pt-4 pb-3"
                >
                  {/* 1. Post Header (Avatar, Host Name, Verified badge, Time & Status) */}
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

                  {/* 2. Post Caption & Title */}
                  <div className="px-4 space-y-2">
                    <h2 className="text-base font-extrabold text-slate-900 leading-snug hover:text-coral-600 transition">
                      {trip.title}
                    </h2>

                    {/* Tag Lộ trình & Loại hình dạng Viên Nang (Pills) */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                        <MapPin size={12} className="text-teal-600" />
                        {trip.startLocation}{trip.startCityName ? ` (${trip.startCityName})` : ''} ➔ {trip.destination}{trip.destinationCityName ? ` (${trip.destinationCityName})` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-coral-700 bg-coral-50 border border-coral-100 px-2.5 py-1 rounded-lg">
                        <Sparkles size={11} className="text-coral-500" />
                        {trip.categoryName || 'Du lịch'}
                      </span>
                    </div>

                    {trip.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-1 font-medium">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  {/* 3. Post Cover Image (Media Block) */}
                  {trip.coverImageUrl && (
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <Image
                        src={trip.coverImageUrl}
                        alt={trip.title}
                        containerClassName="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* 4. Travel Stats Bar (Ngày đi, Số chỗ, Chi phí) */}
                  <div className="mx-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    <div className="border-r border-slate-200/80 pr-1">
                      <span className="text-[10px] text-slate-400 font-medium block">Ngày khởi hành</span>
                      <span className="text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 mt-0.5">
                        <Calendar size={12} className="text-coral-500" />
                        {formatDate(trip.startDate)}
                      </span>
                    </div>

                    <div className="border-r border-slate-200/80 px-1">
                      <span className="text-[10px] text-slate-400 font-medium block">Số thành viên</span>
                      <span className="text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 mt-0.5">
                        <Users size={12} className="text-teal-600" />
                        {trip.currentMembers}/{trip.maxMembers} người
                      </span>
                    </div>

                    <div className="pl-1">
                      <span className="text-[10px] text-slate-400 font-medium block">Chi phí / người</span>
                      <span className="text-coral-600 font-black text-[11px] mt-0.5 block">
                        {trip.estimatedCost ? `${trip.estimatedCost.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                      </span>
                    </div>
                  </div>

                  {/* 5. Post Actions (Like, Comment, Join / Detail Button) */}
                  <div className="px-4 pt-1 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-slate-600">
                    <button
                      type="button"
                      onClick={(e) => toggleLike(trip.id, e)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition cursor-pointer hover:bg-slate-100 ${
                        isLiked ? 'text-rose-600 font-black' : 'text-slate-600'
                      }`}
                    >
                      <Heart size={16} className={isLiked ? 'fill-rose-600 text-rose-600' : ''} />
                      <span>Thích</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trips/${trip.id}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer text-slate-600"
                    >
                      <MessageSquare size={16} />
                      <span>Thảo luận</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trips/${trip.id}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-coral-50 hover:bg-coral-100 text-coral-600 transition cursor-pointer font-black"
                    >
                      <Send size={15} />
                      <span>Xem & Tham gia</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* CỘT PHẢI (RIGHT SIDEBAR - 3 COLS - Widgets & Community Tips) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4 text-left font-sans">
          {/* Widget Mẹo Du Lịch An Toàn */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <ShieldCheck size={16} className="text-emerald-500" /> Du lịch an toàn cùng TripMate
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed font-medium">
              <li className="flex items-start gap-2">
                <span className="text-coral-500 font-bold">•</span>
                Luôn kiểm tra Tích xanh xác minh CCCD của Trưởng đoàn.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral-500 font-bold">•</span>
                Trao đổi kỹ lịch trình và chi phí trước khi chuyển cọc.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral-500 font-bold">•</span>
                Tuân thủ quy định và yêu cầu độ tuổi/sức khỏe chuyến đi.
              </li>
            </ul>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll To Top */}
      <ScrollToTop />
    </div>
  );
};

export default HomePage;
