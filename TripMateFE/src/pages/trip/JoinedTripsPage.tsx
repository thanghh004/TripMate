import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import SearchInput, { matchSearchText } from '../../components/common/SearchInput';
import { Select, type SelectOption } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
import { TripMemberStatus } from '../../types/trip';
import { formatDate } from '../../utils/formatters';
import {
  MapPin,
  Calendar,
  Compass,
  Tag,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { MyTripRowSkeleton } from '../../components/skeleton/MyTripRowSkeleton';

const JOINED_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Đã duyệt tham gia', value: String(TripMemberStatus.Approved) },
  { label: 'Đang chờ duyệt', value: String(TripMemberStatus.Pending) },
  { label: 'Bị từ chối', value: String(TripMemberStatus.Rejected) },
  { label: 'Đã hủy đăng ký', value: String(TripMemberStatus.Cancelled) },
];

export const JoinedTripsPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Mặc định 10 bản ghi/trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchJoinedTrips = async () => {
    try {
      setIsLoading(true);
      const data = await tripApi.getJoinedTrips();
      setTrips(data || []);
    } catch (err: any) {
      toast.error('Không thể tải danh sách chuyến đi đã tham gia.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authContext && !authContext.isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      fetchJoinedTrips();
    }
  }, [isAuthenticated, authContext, navigate]);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      matchSearchText(trip.title, searchQuery) ||
      matchSearchText(trip.startCityName || trip.startLocation || '', searchQuery) ||
      matchSearchText(trip.destinationCityName || trip.destination || '', searchQuery) ||
      matchSearchText(trip.organizerName || '', searchQuery) ||
      matchSearchText(trip.categoryName || '', searchQuery);

    const currentUserId = authContext?.user?.userId;
    const myMember = trip.members?.find((m) => m.userId === currentUserId);
    const effectiveMemberStatus = trip.myMemberStatus !== undefined ? trip.myMemberStatus : myMember?.status;

    const matchesStatus =
      statusFilter === 'ALL' ||
      String(effectiveMemberStatus) === statusFilter;

    const matchesDate =
      !dateFilter ||
      (trip.startDate && trip.startDate.substring(0, 10) === dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredTrips.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTrips = filteredTrips.slice(startIndex, startIndex + pageSize);

  // Helper hiển thị Badge trạng thái tham gia
  const renderMemberStatusBadge = (trip: Trip) => {
    const currentUserId = authContext?.user?.userId;
    const myMember = trip.members?.find((m) => m.userId === currentUserId);
    const status = trip.myMemberStatus !== undefined ? trip.myMemberStatus : myMember?.status;

    if (status === TripMemberStatus.Approved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} />
          Đã duyệt tham gia
        </span>
      );
    }
    if (status === TripMemberStatus.Pending) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
          <Clock size={12} />
          Chờ Trưởng đoàn duyệt
        </span>
      );
    }
    if (status === TripMemberStatus.Rejected) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          <XCircle size={12} />
          Bị từ chối
        </span>
      );
    }
    if (status === TripMemberStatus.Cancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <AlertCircle size={12} />
          Đã hủy đăng ký
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        Đã đăng ký
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1200px] mx-auto w-full">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Chuyến đi đã tham gia 🎒
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Quản lý danh sách các hành trình bạn đã đăng ký xin gia nhập.
            </p>
          </div>

          {/* Cụm Bộ Lọc & Tìm Kiếm */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, điểm đi/đến, trưởng đoàn..."
              containerClassName="w-full sm:w-56"
            />

            <div className="w-full sm:w-44">
              <Select
                options={JOINED_STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val as string);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="w-full sm:w-40">
              <DatePicker
                value={dateFilter}
                onChange={(val) => {
                  setDateFilter(val);
                  setCurrentPage(1);
                }}
                onClear={() => {
                  setDateFilter('');
                  setCurrentPage(1);
                }}
                placeholder="Lọc ngày đi"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="space-y-4">
            <MyTripRowSkeleton />
            <MyTripRowSkeleton />
            <MyTripRowSkeleton />
          </div>
        ) : filteredTrips.length === 0 ? (
          /* Empty State - Nền Trong Suốt Full Width */
          <div className="w-full py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-coral-50 text-coral-500 mx-auto flex items-center justify-center">
              <Compass size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {trips.length === 0 ? 'Chưa có chuyến đi nào' : 'Không tìm thấy chuyến đi phù hợp'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {trips.length === 0
                  ? 'Bạn chưa tham gia chuyến đi nào. Hãy khám phá các hành trình hấp dẫn trên trang chủ!'
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái/ngày khởi hành.'}
              </p>
            </div>
            {trips.length === 0 && (
              <Button
                size="sm"
                variant="warning"
                leftIcon={<Compass size={15} />}
                onClick={() => navigate('/')}
                className="font-bold text-xs py-2 px-5 cursor-pointer mt-2"
              >
                Khám phá chuyến đi ngay
              </Button>
            )}
          </div>
        ) : (
          /* Danh sách Card Chuyến Đi Phân Trang */
          <div className="space-y-4">
            <div className="space-y-4">
              {paginatedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xs transition-all"
                >
                  {/* Top Banner Card */}
                  <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm text-slate-900">
                        {trip.title}
                      </span>
                      {renderMemberStatusBadge(trip)}
                    </div>

                    <div className="text-rose-600 font-bold text-base">
                      {(trip.estimatedCost ?? 0).toLocaleString('vi-VN')} <span className="underline text-xs font-semibold">đ</span>
                    </div>
                  </div>

                  {/* Body Content Card: Bố cục 2 Cột Thẳng Tắp 100% Đồng Bộ MyTripsPage */}
                  <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 text-xs text-slate-600 font-medium flex-1">
                      {/* Cột 1 (Cố định w-[320px]): Ngày bắt đầu + Lộ trình */}
                      <div className="w-full sm:w-[320px] shrink-0 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-slate-400 shrink-0" />
                          <span className="text-slate-500">Khởi hành:</span>
                          <span className="font-semibold text-slate-800">
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="text-coral-500 shrink-0" />
                          <span className="text-slate-500">Lộ trình:</span>
                          <span className="font-semibold text-slate-800 truncate">
                            {trip.startCityName || trip.startLocation} ➔ {trip.destinationCityName || trip.destination}
                          </span>
                        </div>
                      </div>

                      {/* Cột 2 (Cố định w-[260px]): Trưởng đoàn + Thể loại */}
                      <div className="w-full sm:w-[260px] shrink-0 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <User size={15} className="text-sky-500 shrink-0" />
                          <span className="text-slate-500">Trưởng đoàn:</span>
                          <span className="font-semibold text-slate-800 truncate">
                            {trip.organizerName}
                          </span>
                        </div>

                        {trip.categoryName && (
                          <div className="flex items-center gap-2">
                            <Tag size={15} className="text-slate-400 shrink-0" />
                            <span className="text-slate-500">Thể loại:</span>
                            <span className="font-semibold text-slate-800">
                              {trip.categoryName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nút Xem Chi Tiết */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="font-bold text-xs py-2 px-4 cursor-pointer"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Component Phân Trang Chuẩn */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                pageSize={pageSize}
                totalItems={filteredTrips.length}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        )}
      </main>

      <ScrollToTop />
    </div>
  );
};

export default JoinedTripsPage;
