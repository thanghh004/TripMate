import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import Image from '../../components/common/Image';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
import { formatDate, matchSearch } from '../../utils/formatters';
import { AuthContext } from '../../context/AuthContext';
import { TripCardSkeleton } from '../../components/skeleton/TripCardSkeleton';
import { TripAdvancedFilter } from '../../components/trip/TripAdvancedFilter';
import type { TripFilterCriteria } from '../../components/trip/TripAdvancedFilter';
import { ScrollToTop } from '../../components/common/ScrollToTop';
import {
  Heart,
  MessageCircle,
  MapPin,
  Sparkles,
  ShieldCheck,
  Compass,
  ImagePlus,
  MoreHorizontal,
  Bookmark,
  Clock,
  Users,
  Film,
  ShoppingBag,
  ChevronDown,
  Sparkle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Đọc bộ lọc nâng cao từ URL SearchParams để giữ nguyên khi quay lại
  const [advancedFilters, setAdvancedFilters] = useState<TripFilterCriteria>(() => ({
    startCityId: searchParams.get('startCityId') || '',
    destinationCityId: searchParams.get('destinationCityId') || '',
    minCost: searchParams.get('minCost') || '',
    maxCost: searchParams.get('maxCost') || '',
    categoryId: searchParams.get('categoryId') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  }));

  // Đọc từ khóa tìm kiếm ô Header
  const searchQuery = searchParams.get('search') || '';

  // Handler cập nhật bộ lọc vừa lưu state vừa lưu URL SearchParams
  const handleFilterApply = (newFilters: TripFilterCriteria) => {
    setAdvancedFilters(newFilters);
    const params = new URLSearchParams(searchParams);
    
    // Cập nhật từng field lọc lên URL
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params, { replace: true });
  };

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

  // Lọc chuyến đi dựa trên từ khóa tìm kiếm (Header) & Bộ lọc chi tiết (Left Sidebar)
  const filteredTrips = trips.filter((trip: Trip) => {
    // 1. Lọc theo ô Tìm kiếm Header
    if (searchQuery.trim()) {
      const matchHeaderSearch =
        matchSearch(trip.title, searchQuery) ||
        matchSearch(trip.startLocation, searchQuery) ||
        matchSearch(trip.startCityName, searchQuery) ||
        matchSearch(trip.destination, searchQuery) ||
        matchSearch(trip.destinationCityName, searchQuery) ||
        matchSearch(trip.categoryName, searchQuery) ||
        matchSearch(trip.organizerName, searchQuery);

      if (!matchHeaderSearch) return false;
    }

    // 2. Lọc theo Điểm đi (startCityId)
    if (advancedFilters.startCityId && trip.startCityId !== advancedFilters.startCityId) {
      return false;
    }

    // 3. Lọc theo Điểm đến (destinationCityId)
    if (advancedFilters.destinationCityId && trip.destinationCityId !== advancedFilters.destinationCityId) {
      return false;
    }

    // 4. Lọc theo Khoảng chi phí Min - Max
    if (advancedFilters.minCost && trip.estimatedCost !== undefined) {
      const min = Number(advancedFilters.minCost);
      if (!isNaN(min) && trip.estimatedCost < min) return false;
    }
    if (advancedFilters.maxCost && trip.estimatedCost !== undefined) {
      const max = Number(advancedFilters.maxCost);
      if (!isNaN(max) && trip.estimatedCost > max) return false;
    }

    // 5. Lọc theo Loại hình chuyến đi (categoryId)
    if (advancedFilters.categoryId && trip.categoryId !== advancedFilters.categoryId) {
      return false;
    }

    // 6. Lọc theo Ngày khởi hành (startDate): So sánh dạng chuỗi YYYY-MM-DD chính xác không lỗi múi giờ
    if (advancedFilters.startDate) {
      const filterDateStr = advancedFilters.startDate;
      const tripDateStr = trip.startDate ? trip.startDate.split('T')[0] : '';
      if (tripDateStr && tripDateStr < filterDateStr) return false;
    }

    // 7. Lọc theo Ngày kết thúc (endDate)
    if (advancedFilters.endDate) {
      const filterEndStr = advancedFilters.endDate;
      const tripEndStr = trip.endDate ? trip.endDate.split('T')[0] : '';
      if (tripEndStr && tripEndStr > filterEndStr) return false;
    }

    return true;
  });

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

      {/* Main Content Layout 3 Cột Dạt Sát 2 Lề Trái/Phải Chuẩn Facebook - DỊCH XUỐNG DƯỚI RỘNG RÃI */}
      <main className="flex-1 pt-24 pb-16 px-2 sm:px-4 w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          
          {/* CỘT TRÁI (3 COLS): DẠT SÁT LỀ TRÁI MÀN HÌNH */}
          <div className="hidden lg:block lg:col-span-3 space-y-1 text-left sticky top-24 select-none pl-2 sm:pl-4 pr-1">
            {/* User Profile item */}
            <div
              onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            >
              {isAuthenticated && user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName || 'User'}
                  containerClassName="w-9 h-9 rounded-full border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-600 font-bold text-sm flex items-center justify-center shrink-0">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
              <span className="text-xs font-bold text-slate-900 truncate">
                {isAuthenticated ? user?.fullName : 'Đăng nhập / Đăng ký'}
              </span>
            </div>

            {/* Menu Items */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkle size={18} />
              </div>
              <span>TripMate AI</span>
            </div>

            <div
              onClick={() => navigate('/joined-trips')}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <span>Chuyến đi đã tham gia</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <Bookmark size={18} />
              </div>
              <span>Đã lưu</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <span>Kỷ niệm chuyến đi</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Compass size={18} />
              </div>
              <span>Cộng đồng phượt</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Film size={18} />
              </div>
              <span>Video trải nghiệm</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <ShoppingBag size={18} />
              </div>
              <span>Chợ đồ phượt</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <ChevronDown size={18} />
              </div>
              <span>Xem thêm</span>
            </div>

            {/* Kẻ ngang & Lối tắt */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5">
                Lối tắt của bạn
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-medium text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  Sapa
                </div>
                <span className="truncate">Săn mây Sa Pa - Mù Cang Chải</span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-medium text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-coral-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  ĐL
                </div>
                <span className="truncate">Đà Lạt - Thành phố ngàn hoa</span>
              </div>
            </div>
          </div>

          {/* CỘT GIỮA (6 COLS): FEED CHÍNH MÔ PHỎNG FACEBOOK */}
          <div className="lg:col-span-6 space-y-3.5 mx-auto w-full max-w-2xl">
            {/* Box Đăng bài */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 text-left">
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

                <button
                  type="button"
                  onClick={handleCreateTripClick}
                  className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-500 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-full transition cursor-pointer text-left truncate"
                >
                  {isAuthenticated
                    ? `${user?.fullName || 'Bạn'}, bạn muốn đi đâu thế? Tạo chuyến đi ngay...`
                    : 'Bạn muốn đi đâu thế? Đăng nhập để tạo chuyến đi ngay...'}
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <div
                    title="Loại hình chuyến đi"
                    className="p-2 rounded-full hover:bg-rose-50 text-rose-500 transition cursor-default"
                  >
                    <Sparkles size={19} />
                  </div>
                  <div
                    title="Địa điểm đến"
                    className="p-2 rounded-full hover:bg-emerald-50 text-emerald-500 transition cursor-default"
                  >
                    <MapPin size={19} />
                  </div>
                  <div
                    title="Hình ảnh"
                    className="p-2 rounded-full hover:bg-amber-50 text-amber-500 transition cursor-default"
                  >
                    <ImagePlus size={19} />
                  </div>
                </div>
              </div>
            </div>

            {/* DANH SÁCH BÀI VIẾT: SKELETON LOADING SHIMMER PHONG CÁCH FACEBOOK */}
            {isLoading ? (
              <div className="space-y-3.5">
                <TripCardSkeleton />
                <TripCardSkeleton />
                <TripCardSkeleton />
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-5 select-none">
                {/* Illustration Hình Bản Đồ & Pin Khổng Lồ Phong Cách Travel (Giống Ảnh Mẫu 2) */}
                <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                  {/* Nền Tròn Vàng Nhạt Soft Glow */}
                  <div className="absolute inset-0 rounded-full bg-amber-100/60 scale-95" />

                  {/* Khung Thẻ Bản Đồ Với Nét Đứt & Pin Đỏ */}
                  <div className="relative z-10 w-36 h-28 bg-white rounded-2xl border-2 border-slate-800 shadow-sm flex flex-col justify-between p-3">
                    {/* Các vạch ngăn cách bản đồ */}
                    <div className="w-full flex justify-between h-full border-x-2 border-dashed border-slate-200 px-3">
                      <div className="w-full h-full border-r-2 border-dashed border-slate-200" />
                    </div>

                    {/* Lộ Trình Nối Nét Đứt Màu Cam */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 25 70 Q 50 30 75 45" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
                    </svg>

                    {/* Map Pin Đỏ Chân Thật */}
                    <div className="absolute top-4 left-6 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                      <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md border-2 border-white">
                        ?
                      </div>
                      <div className="w-1.5 h-1.5 bg-rose-700 rotate-45 -mt-1 rounded-xs" />
                    </div>

                    {/* Tag Chữ 404 NOT FOUND */}
                    <div className="absolute top-3 right-3 text-right leading-none">
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">NO TRIPS</span>
                      <span className="text-xl font-black text-slate-900 tracking-tight block">404</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">NOT FOUND</span>
                    </div>
                  </div>
                </div>

                {/* Typography Tiêu Đề & Mô Tả Tinh Tế */}
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {searchQuery ? 'No Trips Match Your Search' : 'No Open Trips Available'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {searchQuery
                      ? `Không tìm thấy chuyến đi nào khớp với từ khóa "${searchQuery}".`
                      : 'Hiện tại chưa có chuyến đi nào mở đăng ký trên hệ thống.'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    (Hãy thử thay đổi bộ lọc tìm kiếm hoặc tạo chuyến đi mới để tìm bạn đồng hành ngay)
                  </p>
                </div>

                {/* Button Bo Tròn Viên Thuốc (Chỉ hiện khi tìm kiếm) */}
                {searchQuery && (
                  <div className="pt-1">
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      Xem tất cả chuyến đi
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredTrips.map((trip: Trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden text-left cursor-pointer"
                >
                  {/* Header bài viết */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {trip.organizerAvatarUrl ? (
                        <Image
                          src={trip.organizerAvatarUrl}
                          alt={trip.organizerName}
                          containerClassName="w-9 h-9 rounded-full border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-600 font-bold text-sm flex items-center justify-center shrink-0">
                          {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                        </div>
                      )}

                      <div className="text-xs leading-tight">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          {trip.organizerName}
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                          {formatDate(trip.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer">
                      <MoreHorizontal size={17} />
                    </div>
                  </div>

                  {/* Tiêu đề & Mô tả */}
                  <div className="px-3.5 sm:px-4 pb-3 space-y-1.5">
                    <h2 className="text-base font-semibold text-slate-900 leading-snug">
                      {trip.title}
                    </h2>

                    {trip.description && (
                      <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2">
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
                        containerClassName="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="p-3.5 bg-white border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-1.5 text-slate-600 hover:text-rose-500 font-semibold text-xs transition">
                          <Heart size={17} />
                          <span>0</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-slate-600 hover:text-coral-500 font-semibold text-xs transition">
                          <MessageCircle size={17} />
                          <span>0</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-center pt-1 border-t border-slate-100/60">
                      <span className="text-[10px] font-normal text-slate-400">
                        Nhấn vào bài viết để xem chi tiết
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CỘT PHẢI (3 COLS): BỘ LỌC TÌM CHUYẾN ĐI CHI TIẾT DẠT SÁT LỀ PHẢI */}
          <div className="hidden lg:block lg:col-span-3 text-left sticky top-24 select-none pr-2 sm:pr-4 pl-1">
            <TripAdvancedFilter
              initialFilters={advancedFilters}
              onFilterApply={handleFilterApply}
            />
          </div>

        </div>
      </main>

      <ScrollToTop />
    </div>
  );
};

export default HomePage;
