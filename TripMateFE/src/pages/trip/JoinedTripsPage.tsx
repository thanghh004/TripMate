import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import SearchInput, { matchSearchText } from '../../components/common/SearchInput';
import { Select, type SelectOption } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
import { TripMemberStatus, TripStatus } from '../../types/trip';
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
  Loader2,
} from 'lucide-react';
import { MyTripRowSkeleton } from '../../components/skeleton/MyTripRowSkeleton';

const JOINED_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Đã duyệt tham gia', value: String(TripMemberStatus.Approved) },
  { label: 'Đang chờ duyệt', value: String(TripMemberStatus.Pending) },
  { label: 'Bị từ chối', value: String(TripMemberStatus.Rejected) },
  { label: 'Đã hủy đăng ký', value: String(TripMemberStatus.Cancelled) },
];

const CANCEL_REASONS = [
  'Thay đổi lịch trình',
  'Có việc bận đột xuất',
  'Thời tiết xấu',
  'Không đủ số lượng thành viên',
  'Lý do sức khỏe',
  'Lý do khác',
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

  // State Modal Hủy Đăng Ký
  const [tripToCancel, setTripToCancel] = useState<Trip | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const resetCancelModal = () => {
    setTripToCancel(null);
    setSelectedReasons([]);
    setCustomNote('');
  };

  const combinedReason = [...selectedReasons, customNote.trim()].filter(Boolean).join('; ');
  const hasReason = combinedReason.length > 0;

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

  const handleConfirmCancelRegistration = async () => {
    if (!tripToCancel) return;
    if (!hasReason) {
      toast.error('Vui lòng chọn hoặc nhập lý do hủy đăng ký.');
      return;
    }

    try {
      setIsCancelling(true);
      await tripApi.cancelRegistration(tripToCancel.id, combinedReason);
      toast.success(`Đã hủy đăng ký chuyến đi "${tripToCancel.title}" thành công.`);
      resetCancelModal();
      await fetchJoinedTrips();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Hủy đăng ký thất bại.');
    } finally {
      setIsCancelling(false);
    }
  };

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
              {paginatedTrips.map((trip) => {
                const currentUserId = authContext?.user?.userId;
                const myMember = trip.members?.find((m) => m.userId === currentUserId);
                const effectiveMemberStatus = trip.myMemberStatus !== undefined ? trip.myMemberStatus : myMember?.status;

                // Điều kiện hiển thị Nút Hủy Đăng Ký: 
                // 1. Chuyến đi ở trạng thái Open (1) hoặc Full (2)
                // 2. VÀ trạng thái tham gia của member là Pending (0) hoặc Approved (1)
                const isTripOpenOrFull =
                  trip.status === TripStatus.Open ||
                  trip.status === TripStatus.Full ||
                  (trip.status as any) === 1 ||
                  (trip.status as any) === 2 ||
                  String(trip.status).toLowerCase() === 'open' ||
                  String(trip.status).toLowerCase() === 'full';

                const isMemberPendingOrApproved =
                  effectiveMemberStatus === TripMemberStatus.Pending ||
                  effectiveMemberStatus === TripMemberStatus.Approved ||
                  (effectiveMemberStatus as any) === 0 ||
                  (effectiveMemberStatus as any) === 1 ||
                  String(effectiveMemberStatus).toLowerCase() === 'pending' ||
                  String(effectiveMemberStatus).toLowerCase() === 'approved';

                const canCancelRegistration = isTripOpenOrFull && isMemberPendingOrApproved;

                // Ẩn nút "Xem chi tiết" khi trạng thái tham gia là Cancelled (3)
                const isCancelled =
                  effectiveMemberStatus === TripMemberStatus.Cancelled ||
                  (effectiveMemberStatus as any) === 3 ||
                  String(effectiveMemberStatus).toLowerCase() === 'cancelled';

                return (
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

                    {/* Body Content Card */}
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

                      {/* Cụm Nút Thao Tác Bên Phải */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        {/* Nút Xem chi tiết - CHỈ HIỂN THỊ KHI CHƯA HỦY ĐĂNG KÝ */}
                        {!isCancelled && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            className="font-bold text-xs py-2 px-4 cursor-pointer"
                          >
                            Xem chi tiết
                          </Button>
                        )}

                        {/* Nút Hủy đăng ký MÀU ĐỎ NỔI BẬT */}
                        {canCancelRegistration && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setTripToCancel(trip)}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer shadow-2xs"
                          >
                            Hủy đăng ký
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Component Phân Trang Chuẩn */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 1}
              onPageChange={(page) => setCurrentPage(page)}
              pageSize={pageSize}
              totalItems={filteredTrips.length}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </main>

      {/* MODAL HỦY ĐĂNG KÝ THAM GIA CHUYẾN ĐI chuẩn 100% Ảnh Mẫu (Grid 3 Cột, MaxWidth 2XL) */}
      <Modal
        isOpen={Boolean(tripToCancel)}
        onClose={resetCancelModal}
        title="Xác nhận hủy đăng ký tham gia"
        maxWidth="2xl"
      >
        {tripToCancel && (
          <div className="space-y-5 text-left font-sans">
            {/* Banner Cảnh báo đỏ nhạt */}
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
              <p className="font-medium leading-relaxed">
                Bạn sắp hủy đăng ký tham gia chuyến đi <strong className="font-extrabold text-rose-900">{tripToCancel.title}</strong>. Hành động này <strong className="font-extrabold text-rose-900">không thể hoàn tác</strong>.
              </p>
            </div>

            {/* Chọn lý do hủy (Grid 3 cột x 2 hàng) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Lý do hủy đăng ký <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CANCEL_REASONS.map((reason) => {
                  const isSelected = selectedReasons.includes(reason);
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggleReason(reason)}
                      className={`py-2 px-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50/80 border-rose-300 text-rose-900 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded text-rose-500 focus:ring-rose-400 accent-rose-500 cursor-pointer shrink-0"
                      />
                      <span className="truncate">{reason}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea ghi chú thêm + Đếm số ký tự 0/500 */}
            <div className="space-y-1.5 relative">
              <label className="block text-xs font-semibold text-slate-600">
                Ghi chú thêm <span className="text-slate-400 font-normal">(hoặc tự nhập lý do tại đây)</span>
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Nhập thêm chi tiết lý do hủy đăng ký..."
                rows={3}
                maxLength={500}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400 transition resize-none leading-relaxed"
              />
              <div className="text-[11px] font-semibold text-slate-400 text-right pt-0.5">
                {customNote.length}/500
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetCancelModal}
                disabled={isCancelling}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="submit"
                disabled={isCancelling || !hasReason}
                onClick={handleConfirmCancelRegistration}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-60 transition"
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  'Xác nhận Hủy đăng ký'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ScrollToTop />
    </div>
  );
};

export default JoinedTripsPage;
