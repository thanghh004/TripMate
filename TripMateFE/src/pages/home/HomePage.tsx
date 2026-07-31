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
  ArrowRight,
  Loader2,
  Compass,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      {/* Header / Navbar */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1400px] mx-auto w-full space-y-16">
        <div className="text-center relative z-10 space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-coral-600 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles size={14} className="text-amber-500" />
            Nền tảng Tìm bạn đồng hành & Du lịch nhóm số 1
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
            Khám phá thế giới cùng <br />
            <span className="bg-gradient-to-r from-coral-500 via-amber-500 to-teal-600 bg-clip-text text-transparent">
              Những bạn đồng hành lý tưởng
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            TripMate kết nối bạn với những người cùng đam mê xê dịch. Tìm kiếm các hành trình hấp dẫn đã được kiểm duyệt và tham gia ngay hôm nay.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-coral-500 to-amber-500 text-white rounded-2xl shadow-xl shadow-coral-500/20 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Bắt đầu hành trình ngay
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 text-sm border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-xs cursor-pointer"
              >
                Đăng nhập tài khoản
              </Button>
            </div>
          )}
        </div>

        {/* Section: Danh sách Chuyến Đi Đã Duyệt Nổi Bật */}
        <div className="space-y-8 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Compass size={24} className="text-coral-500" />
                Hành trình nổi bật đang mở đăng ký
              </h2>
              <p className="text-xs text-slate-500 font-medium pt-1">
                Các chuyến đi đã được Admin phê duyệt an toàn và sẵn sàng cho bạn tham gia.
              </p>
            </div>

            {isAuthenticated && (
              <Button
                onClick={() => navigate('/create-trip')}
                className="bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles size={15} /> + Tạo chuyến mới
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="bg-white p-16 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 size={36} className="animate-spin text-coral-500" />
              <span className="text-sm font-semibold">Đang nạp các chuyến đi nổi bật...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
              <Compass size={40} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">Chưa có chuyến đi nào được duyệt</h3>
              <p className="text-xs text-slate-500">Hãy quay lại sau hoặc là người đầu tiên tạo chuyến đi mới nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group"
                >
                  {/* Image Cover Top */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {trip.coverImageUrl ? (
                      <Image
                        src={trip.coverImageUrl}
                        alt={trip.title}
                        containerClassName="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                        Chưa có ảnh bìa
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {trip.status === TripStatus.Full ? (
                        <span className="text-[10px] font-black text-blue-800 bg-blue-100/95 backdrop-blur-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                          Đã đủ chỗ
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/95 backdrop-blur-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                          Đang mở nhận chỗ
                        </span>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[10px] font-bold text-slate-800 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs">
                        {trip.categoryName || 'Du lịch'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-coral-600 transition-colors line-clamp-1">
                        {trip.title}
                      </h3>

                      {/* Organizer info */}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        {trip.organizerAvatarUrl ? (
                          <Image src={trip.organizerAvatarUrl} alt={trip.organizerName} containerClassName="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-coral-100 text-coral-600 font-bold text-[10px] flex items-center justify-center">
                            {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                          </div>
                        )}
                        <span className="font-semibold text-slate-700 truncate">{trip.organizerName}</span>
                        <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                      </div>

                      {/* Route */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium space-y-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={14} className="text-teal-600 shrink-0" />
                          <span className="truncate">Đi: {trip.startLocation}{trip.startCityName ? ` (${trip.startCityName})` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={14} className="text-coral-500 shrink-0" />
                          <span className="truncate">Đến: {trip.destination}{trip.destinationCityName ? ` (${trip.destinationCityName})` : ''}</span>
                        </div>
                      </div>

                      {/* Dates & Members */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {formatDate(trip.startDate)}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <Users size={13} className="text-coral-500" />
                          {trip.currentMembers}/{trip.maxMembers} người
                        </span>
                      </div>
                    </div>

                    {/* Bottom Footer Price & Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Chi phí ước tính</span>
                        <span className="text-sm font-black text-coral-600">
                          {trip.estimatedCost ? `${trip.estimatedCost.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-coral-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Chi tiết <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
