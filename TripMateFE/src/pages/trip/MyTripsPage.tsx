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
import type { Trip, TripStatus } from '../../types/trip';
import { TripStatus as TripStatusEnum } from '../../types/trip';
import { formatDate } from '../../utils/formatters';
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  Loader2,
  Compass,
  AlertCircle,
  Tag,
} from 'lucide-react';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Đang chờ duyệt', value: String(TripStatusEnum.PendingReview) },
  { label: 'Đang nhận đăng ký', value: String(TripStatusEnum.Open) },
  { label: 'Đã đủ thành viên', value: String(TripStatusEnum.Full) },
  { label: 'Đang diễn ra', value: String(TripStatusEnum.Ongoing) },
  { label: 'Hoàn thành', value: String(TripStatusEnum.Completed) },
  { label: 'Đã hủy', value: String(TripStatusEnum.Cancelled) },
  { label: 'Bị từ chối', value: String(TripStatusEnum.Rejected) },
];

export const MyTripsPage: React.FC = () => {
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

  // Modal hủy chuyến
  const [tripToCancel, setTripToCancel] = useState<Trip | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');

  const CANCEL_REASONS = [
    'Thay đổi lịch trình',
    'Có việc bận đột xuất',
    'Thời tiết xấu',
    'Không đủ số lượng thành viên',
    'Lý do sức khỏe',
    'Lý do khác',
  ];

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

  // Combine lý do chọn + ghi chú tự do thành 1 string gửi BE
  const combinedReason = [
    ...selectedReasons,
    customNote.trim(),
  ].filter(Boolean).join('; ');

  const hasReason = combinedReason.length > 0;

  const fetchMyTrips = async () => {
    try {
      setIsLoading(true);
      const data = await tripApi.getMyTrips();
      setTrips(data || []);
    } catch (err: any) {
      toast.error('Không thể tải danh sách chuyến đi của bạn.');
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
      fetchMyTrips();
    }
  }, [isAuthenticated, authContext, navigate]);

  const handleConfirmCancel = async () => {
    if (!tripToCancel) return;
    if (!hasReason) return;

    try {
      setIsCancelling(true);
      await tripApi.cancelTrip(tripToCancel.id, combinedReason);
      toast.success(`Đã hủy chuyến đi "${tripToCancel.title}" thành công.`);
      resetCancelModal();
      await fetchMyTrips();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hủy chuyến đi thất bại.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      matchSearchText(trip.title, searchQuery) ||
      matchSearchText(trip.startCityName || trip.startLocation || '', searchQuery) ||
      matchSearchText(trip.destinationCityName || trip.destination || '', searchQuery) ||
      matchSearchText(trip.categoryName || '', searchQuery);

    const matchesStatus =
      statusFilter === 'ALL' ||
      String(trip.status) === statusFilter ||
      (statusFilter === String(TripStatusEnum.Open) && trip.status === TripStatusEnum.Approved);

    const matchesDate =
      !dateFilter ||
      (trip.startDate && trip.startDate.substring(0, 10) === dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredTrips.length / pageSize);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderStatusBadge = (status: TripStatus, note?: string) => {
    if (status === TripStatusEnum.PendingReview) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 border border-sky-200">
          Đang chờ duyệt
        </span>
      );
    }
    if (status === TripStatusEnum.Open || status === TripStatusEnum.Approved) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Đang nhận đăng ký
        </span>
      );
    }
    if (status === TripStatusEnum.Full) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Đã đủ thành viên
        </span>
      );
    }
    if (status === TripStatusEnum.Ongoing) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Đang diễn ra
        </span>
      );
    }
    if (status === TripStatusEnum.Completed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Hoàn thành
        </span>
      );
    }
    if (status === TripStatusEnum.Cancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          Đã hủy
        </span>
      );
    }
    if (status === TripStatusEnum.Rejected) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 cursor-help"
          title={note ? `Lý do từ chối: ${note}` : 'Chuyến đi bị từ chối'}
        >
          Bị từ chối
        </span>
      );
    }
    if (status === TripStatusEnum.Failed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
          Không thành công
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1200px] mx-auto w-full">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Chuyến đi đã tạo 🎒
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Quản lý danh sách các hành trình bạn làm Trưởng đoàn.
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
              placeholder="Tìm theo tên, điểm đi/đến..."
              containerClassName="w-full sm:w-48"
            />

            <div className="w-full sm:w-44">
              <Select
                options={STATUS_FILTER_OPTIONS}
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

            <Button
              size="sm"
              variant="warning"
              leftIcon={<Plus size={15} />}
              onClick={() => navigate('/create-trip')}
              className="font-bold text-xs shrink-0 py-2.5"
            >
              Tạo chuyến đi
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-lg border border-slate-200/80">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <p className="text-slate-500 font-medium text-xs">Đang tải danh sách chuyến đi...</p>
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
                  ? 'Bạn chưa tạo chuyến đi nào. Hãy lên kế hoạch cho hành trình mới ngay!'
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái/ngày khởi hành.'}
              </p>
            </div>
            {trips.length === 0 && (
              <Button
                size="sm"
                variant="warning"
                leftIcon={<Plus size={15} />}
                onClick={() => navigate('/create-trip')}
                className="font-bold text-xs py-2 px-5 cursor-pointer mt-2"
              >
                Tạo chuyến đi ngay
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
                      {renderStatusBadge(trip.status, trip.moderationNote)}
                    </div>

                    <div className="text-rose-600 font-bold text-base">
                      {(trip.estimatedCost ?? 0).toLocaleString('vi-VN')} <span className="underline text-xs font-semibold">đ</span>
                    </div>
                  </div>

                  {/* Body Content Card: Sử dụng Cột Cố Định Chiều Rộng w-[300px] & w-[240px] đảm bảo Thẳng Tắp 100% */}
                  <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Layout 2 Cột Cố Định Kích Thước - Tuyệt Đối Không Bao Giờ Lệch */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 text-xs text-slate-600 font-medium flex-1">
                      {/* Cột 1 (Cố định w-[320px]): Ngày bắt đầu + Lộ trình */}
                      <div className="w-full sm:w-[320px] shrink-0 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-slate-400 shrink-0" />
                          <div>
                            <span className="text-slate-700 font-semibold">Ngày bắt đầu:</span>{' '}
                            <span>{formatDate(trip.startDate)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-700 font-semibold">Lộ trình:</span>{' '}
                            <span>
                              {trip.startCityName || trip.startLocation} → {trip.destinationCityName || trip.destination}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cột 2 (Cố định vị trí nằm thẳng tắp): Loại hình + Thành viên */}
                      <div className="w-full sm:w-[220px] shrink-0 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Tag size={15} className="text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-700 font-semibold">Loại hình:</span>{' '}
                            <span className="text-slate-800 font-semibold">
                              {trip.categoryName || 'Chuyến đi tự do'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={15} className="text-slate-400 shrink-0" />
                          <div>
                            <span className="text-slate-700 font-semibold">Thành viên:</span>{' '}
                            <span>
                              {trip.currentMembers} / {trip.maxMembers} người
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cụm Nút Thao Tác Bên Phải */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="font-bold text-xs border-slate-300 text-slate-700"
                      >
                        Chi tiết
                      </Button>

                      {trip.status !== TripStatusEnum.Ongoing &&
                        trip.status !== TripStatusEnum.Completed &&
                        trip.status !== TripStatusEnum.Cancelled && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => navigate(`/trips/${trip.id}/edit`)}
                            className="font-bold text-xs"
                          >
                            Chỉnh sửa
                          </Button>
                        )}

                      {trip.status !== TripStatusEnum.Cancelled &&
                        trip.status !== TripStatusEnum.Completed &&
                        trip.status !== TripStatusEnum.Ongoing && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setTripToCancel(trip)}
                            className="font-bold text-xs"
                          >
                            Hủy chuyến
                          </Button>
                        )}
                    </div>
                  </div>

                  {/* Nếu bị từ chối -> Hiện lý do từ chối bên dưới */}
                  {trip.status === TripStatusEnum.Rejected && trip.moderationNote && (
                    <div className="px-6 py-2.5 bg-rose-50 border-t border-rose-100 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-600 shrink-0" />
                      <span>
                        <strong>Lý do từ chối:</strong> {trip.moderationNote}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Component Phân trang */}
            {filteredTrips.length > 0 && (
              <div className="pt-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredTrips.length}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal xác nhận hủy chuyến đi */}
      {tripToCancel && (
        <Modal
          isOpen
          onClose={resetCancelModal}
          title="Xác nhận hủy chuyến đi"
          maxWidth="2xl"
        >
          <div className="space-y-5 text-left">
            {/* Cảnh báo */}
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-lg">
              <AlertCircle size={15} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-xs text-rose-700 leading-relaxed">
                Bạn sắp hủy chuyến đi{' '}
                <strong className="font-bold">{tripToCancel.title}</strong>.
                {' '}Hành động này <strong>không thể hoàn tác</strong>.
              </p>
            </div>

            {/* Chọn lý do hủy (multi-select) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Lý do hủy chuyến
                  <span className="font-normal text-rose-500 ml-1">*</span>
                </p>
                {selectedReasons.length > 0 && (
                  <span className="text-[10px] text-rose-500 font-medium">
                    Đã chọn {selectedReasons.length} lý do
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CANCEL_REASONS.map((reason) => {
                  const isSelected = selectedReasons.includes(reason);
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggleReason(reason)}
                      className={`relative text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 text-rose-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-rose-500 border-rose-500'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        {reason}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea ghi chú thêm */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">
                Ghi chú thêm
                <span className="font-normal text-slate-400 ml-1">(tùy chọn)</span>
              </p>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Nhập thêm chi tiết lý do hủy chuyến..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg resize-none outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 text-right">
                {customNote.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              {!hasReason && (
                <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle size={11} />
                  Vui lòng chọn ít nhất 1 lý do hủy
                </p>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetCancelModal}
                  className="px-4 border-slate-300 text-slate-700 font-semibold"
                >
                  Đóng
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  isLoading={isCancelling}
                  disabled={isCancelling || !hasReason}
                  onClick={handleConfirmCancel}
                  className="px-4 font-semibold"
                >
                  Xác nhận Hủy chuyến
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ScrollToTop />
    </div>
  );
};

export default MyTripsPage;