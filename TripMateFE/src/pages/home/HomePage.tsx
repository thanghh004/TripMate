import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import Image from '../../components/common/Image';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
import { formatDate, matchSearch } from '../../utils/formatters';
import { AuthContext } from '../../context/AuthContext';
import { TripCardSkeleton } from '../../components/trip/TripCardSkeleton';
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
  ExternalLink,
  SearchX,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [advancedFilters, setAdvancedFilters] = useState<TripFilterCriteria>({
    startCityId: '',
    destinationCityId: '',
    minCost: '',
    maxCost: '',
    categoryId: '',
    startDate: '',
    endDate: '',
  });

  // Đọc từ khóa từ query param URL (?search=...)
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

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

    // 6. Lọc theo Ngày khởi hành (startDate)
    if (advancedFilters.startDate) {
      const filterStart = new Date(advancedFilters.startDate).getTime();
      const tripStart = new Date(trip.startDate).getTime();
      if (!isNaN(filterStart) && !isNaN(tripStart) && tripStart < filterStart) return false;
    }

    // 7. Lọc theo Ngày kết thúc (endDate)
    if (advancedFilters.endDate) {
      const filterEnd = new Date(advancedFilters.endDate).getTime();
      const tripEnd = new Date(trip.endDate).getTime();
      if (!isNaN(filterEnd) && !isNaN(tripEnd) && tripEnd > filterEnd) return false;
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

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-xs font-semibold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <span>Bạn đồng hành</span>
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

            {/* Kẻ ngang & BỘ LỌC TÌM KIẾM CHI TIẾT COMPONENT */}
            <div className="pt-3 border-t border-slate-200/80">
              <TripAdvancedFilter onFilterApply={(newFilters) => setAdvancedFilters(newFilters)} />
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
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center space-y-3">
                {searchQuery ? (
                  <>
                    <SearchX size={44} className="text-coral-400 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Không tìm thấy chuyến đi phù hợp với từ khóa "{searchQuery}"
                    </h3>
                    <p className="text-xs text-slate-500">
                      Thử tìm kiếm theo từ khóa khác hoặc nhấn quay lại danh sách tất cả chuyến đi.
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-5 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
                    >
                      Xem tất cả chuyến đi
                    </button>
                  </>
                ) : (
                  <>
                    <Compass size={44} className="text-slate-300 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">Chưa có chuyến đi nào mở đăng ký</h3>
                    <p className="text-xs text-slate-500">Hãy là người đầu tiên tạo chuyến đi để tìm bạn đồng hành!</p>
                    <button
                      onClick={handleCreateTripClick}
                      className="px-5 py-2.5 bg-coral-500 text-white font-bold text-xs rounded-xl hover:bg-coral-600 transition cursor-pointer"
                    >
                      Tạo chuyến đi mới
                    </button>
                  </>
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

          {/* CỘT PHẢI (3 COLS): DẠT SÁT LỀ PHẢI MÀN HÌNH CHUẨN FACEBOOK */}
          <div className="hidden lg:block lg:col-span-3 space-y-4 text-left sticky top-24 select-none pr-2 sm:pr-4 pl-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Được tài trợ
            </div>

            {/* Ads item 1 */}
            <a
              href="https://images.unsplash.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/60 transition group"
            >
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80"
                alt="Combo Hè 2026"
                className="w-24 h-24 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 group-hover:text-coral-600 transition leading-snug line-clamp-2">
                  Giảm 40% Chuyến Đi Đầu Tiên
                </h4>
                <p className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                  tripmate.vn <ExternalLink size={10} />
                </p>
              </div>
            </a>

            {/* Ads item 2 */}
            <a
              href="https://images.unsplash.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/60 transition group"
            >
              <img
                src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80"
                alt="Bảo Hiểm Phượt"
                className="w-24 h-24 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 group-hover:text-coral-600 transition leading-snug line-clamp-2">
                  Bảo Hiểm An Toàn 100% Cho Phượt Thủ
                </h4>
                <p className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                  baohiemdulich.vn <ExternalLink size={10} />
                </p>
              </div>
            </a>
          </div>

        </div>
      </main>

      <ScrollToTop />
    </div>
  );
};

export default HomePage;
