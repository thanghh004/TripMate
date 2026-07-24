import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
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
  AlertCircle
} from 'lucide-react';

export const MyTripsPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingTripId, setCancellingTripId] = useState<string | null>(null);

  useEffect(() => {
    if (authContext && !authContext.isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

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

    if (isAuthenticated) {
      fetchMyTrips();
    }
  }, [isAuthenticated, authContext, navigate]);

  const handleCancelTrip = async (tripId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy chuyến đi "${title}" không?`)) {
      return;
    }

    try {
      setCancellingTripId(tripId);
      await tripApi.cancelTrip(tripId);
      toast.success('Đã hủy chuyến đi thành công.');
      const data = await tripApi.getMyTrips();
      setTrips(data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hủy chuyến đi thất bại.');
    } finally {
      setCancellingTripId(null);
    }
  };

  const renderStatusBadge = (status: TripStatus, note?: string) => {
    if (status === TripStatusEnum.PendingReview) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-700 border border-sky-200">
          Đang chờ duyệt
        </span>
      );
    }
    if (status === TripStatusEnum.Open || status === TripStatusEnum.Approved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Đang nhận đăng ký
        </span>
      );
    }
    if (status === TripStatusEnum.Full) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Đã đủ thành viên
        </span>
      );
    }
    if (status === TripStatusEnum.Ongoing) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Đang diễn ra
        </span>
      );
    }
    if (status === TripStatusEnum.Completed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Hoàn thành
        </span>
      );
    }
    if (status === TripStatusEnum.Cancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          Đã hủy
        </span>
      );
    }
    if (status === TripStatusEnum.Rejected) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 cursor-help"
          title={note ? `Lý do từ chối: ${note}` : 'Chuyến đi bị từ chối'}
        >
          Bị từ chối
        </span>
      );
    }
    if (status === TripStatusEnum.Failed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
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
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-2 sm:p-4 rounded-3xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              Chuyến đi đã tạo 🎒
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Quản lý danh sách các hành trình bạn làm Trưởng đoàn.
            </p>
          </div>

          <Button
            size="sm"
            variant="warning"
            leftIcon={<Plus size={15} />}
            onClick={() => navigate('/create-trip')}
            className="font-bold text-xs py-2 px-4 rounded-lg cursor-pointer"
          >
            Tạo chuyến đi mới
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <p className="text-slate-500 font-medium text-xs">Đang tải danh sách chuyến đi...</p>
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 max-w-md mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-coral-50 text-coral-500 mx-auto flex items-center justify-center">
              <Compass size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Chưa có chuyến đi nào</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn chưa tạo chuyến đi nào. Hãy lên kế hoạch cho hành trình mới ngay!
              </p>
            </div>
            <Button
              size="sm"
              variant="warning"
              leftIcon={<Plus size={15} />}
              onClick={() => navigate('/create-trip')}
              className="font-bold text-xs py-2 px-5 rounded-lg cursor-pointer"
            >
              Tạo chuyến đi ngay
            </Button>
          </div>
        ) : (
          /* Danh sách Card Ngang Nút Bấm Có Màu Rõ Rệt */
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all"
              >
                {/* Header Top Card */}
                <div className="px-6 py-3.5 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
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

                {/* Body Content Card */}
                <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Các cột thông tin vắn tắt */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1 text-xs text-slate-600 font-medium">
                    {/* Ngày khởi hành */}
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-700 font-semibold">Ngày bắt đầu:</span>{' '}
                        <span>{formatDate(trip.startDate)}</span>
                      </div>
                    </div>

                    {/* Địa điểm / Lộ trình */}
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-700 font-semibold">Lộ trình:</span>{' '}
                        <span>
                          {trip.startCityName || trip.startLocation} → {trip.destinationCityName || trip.destination}
                        </span>
                      </div>
                    </div>

                    {/* Số lượng thành viên */}
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

                  {/* Cụm Nút Thao Tác Dùng Component Common Button */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Nút Chi tiết */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="px-3.5 py-1.5 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Chi tiết
                    </Button>

                    {/* Nút Chỉnh sửa */}
                    {trip.status !== TripStatusEnum.Ongoing &&
                      trip.status !== TripStatusEnum.Completed &&
                      trip.status !== TripStatusEnum.Cancelled && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => navigate(`/trips/${trip.id}/edit`)}
                          className="px-3.5 py-1.5 font-bold text-xs"
                        >
                          Chỉnh sửa
                        </Button>
                      )}

                    {/* Nút Hủy chuyến */}
                    {trip.status !== TripStatusEnum.Cancelled &&
                      trip.status !== TripStatusEnum.Completed &&
                      trip.status !== TripStatusEnum.Ongoing && (
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={cancellingTripId === trip.id}
                          disabled={cancellingTripId === trip.id}
                          onClick={() => handleCancelTrip(trip.id, trip.title)}
                          className="px-3.5 py-1.5 font-bold text-xs"
                        >
                          Hủy chuyến
                        </Button>
                      )}
                  </div>
                </div>

                {/* Nếu bị từ chối -> Hiện lý do từ chối bên dưới */}
                {trip.status === TripStatusEnum.Rejected && trip.moderationNote && (
                  <div className="px-6 py-2 bg-rose-50 border-t border-rose-100 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-600 shrink-0" />
                    <span>
                      <strong>Lý do từ chối:</strong> {trip.moderationNote}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <ScrollToTop />
    </div>
  );
};

export default MyTripsPage;
