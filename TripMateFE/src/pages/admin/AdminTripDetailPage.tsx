import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Image from '../../components/common/Image';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import { adminApi } from '../../api/adminApi';
import type { Trip } from '../../types/trip';
import { TripStatus } from '../../types/trip';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  MapPin,
  DollarSign,
  Info,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Star,
  ArrowLeft,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Compass
} from 'lucide-react';

export const AdminTripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTripDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await tripApi.getTripById(id);
      setTrip(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải thông tin chuyến đi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetail();
  }, [id]);

  // Phê duyệt chuyến đi
  const handleApprove = async () => {
    if (!trip) return;
    try {
      setIsProcessing(true);
      await adminApi.approveTrip(trip.id);
      toast.success('Đã phê duyệt chuyến đi thành công!');
      setTrip({ ...trip, status: TripStatus.Open });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Phê duyệt thất bại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Từ chối chuyến đi
  const handleReject = async () => {
    if (!trip) return;
    const reason = prompt('Nhập lý do từ chối chuyến đi này:');
    if (!reason || !reason.trim()) return;

    try {
      setIsProcessing(true);
      await adminApi.rejectTrip(trip.id, reason.trim());
      toast.success('Đã từ chối chuyến đi.');
      setTrip({ ...trip, status: TripStatus.Rejected });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Từ chối thất bại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: number) => {
    switch (status) {
      case TripStatus.PendingReview:
        return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase">Đang chờ duyệt</span>;
      case TripStatus.Open:
      case TripStatus.Approved:
        return <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase">Đang mở đăng ký</span>;
      case TripStatus.Full:
        return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase">Đã đủ thành viên</span>;
      case TripStatus.Ongoing:
        return <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase">Đang diễn ra</span>;
      case TripStatus.Completed:
        return <span className="text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full uppercase">Đã hoàn thành</span>;
      case TripStatus.Cancelled:
      case TripStatus.Rejected:
        return <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full uppercase">Đã hủy / Bị từ chối</span>;
      default:
        return <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase">Đang mở đăng ký</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left max-w-[1400px] mx-auto">
        {/* Top Action Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/trips')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass size={20} className="text-coral-500" />
                Chi tiết chuyến đi (Admin)
              </h1>
              <p className="text-xs text-slate-500 font-medium">Thẩm định và phê duyệt chuyến đi trong hệ thống</p>
            </div>
          </div>

          {/* Group nút Thao tác Duyệt / Từ chối dành riêng cho Admin */}
          {trip && trip.status === TripStatus.PendingReview && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                disabled={isProcessing}
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 size={16} /> Phê duyệt chuyến
              </Button>

              <Button
                type="button"
                disabled={isProcessing}
                onClick={handleReject}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <XCircle size={16} /> Từ chối chuyến
              </Button>
            </div>
          )}
        </div>

        {/* Nội dung chi tiết chuyến đi */}
        {isLoading ? (
          <div className="bg-white p-16 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <span className="text-xs font-semibold">Đang tải thông tin chi tiết chuyến đi...</span>
          </div>
        ) : !trip ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <AlertCircle size={40} className="mx-auto text-rose-500" />
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy chuyến đi</h3>
            <Button onClick={() => navigate('/admin/trips')} className="bg-coral-500 text-white text-xs font-bold py-2 px-4 rounded-xl">
              Quay lại danh sách
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Thông tin chính */}
            <div className="lg:col-span-7 space-y-6">
              {/* Box 1: Thông tin chung */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                    <Info size={16} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                  </h2>
                  {renderStatusBadge(trip.status)}
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-slate-400 text-[11px] font-bold block uppercase">Tiêu đề chuyến đi</label>
                    <p className="text-base font-black text-slate-900 mt-0.5">{trip.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block uppercase">Loại hình</span>
                      <p className="font-bold text-slate-800">{trip.categoryName || 'Chưa phân loại'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block uppercase">Ngày tạo</span>
                      <p className="font-bold text-slate-800">{formatDate(trip.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block uppercase flex items-center gap-1">
                        <MapPin size={13} className="text-coral-500" /> Điểm khởi hành
                      </span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{trip.startLocation}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block uppercase flex items-center gap-1">
                        <MapPin size={13} className="text-emerald-500" /> Điểm đến chính
                      </span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{trip.destination}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block uppercase flex items-center gap-1">
                        <Calendar size={13} className="text-coral-500" /> Ngày khởi hành
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">{formatDate(trip.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] font-bold block uppercase flex items-center gap-1">
                        <Calendar size={13} className="text-coral-500" /> Ngày kết thúc
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">{formatDate(trip.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Mô tả chi tiết */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <h2 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText size={16} className="text-coral-500" /> 2. Kế hoạch & Mô tả chi tiết
                </h2>
                <p className="text-xs font-medium leading-relaxed text-slate-700 whitespace-pre-line pt-1">
                  {trip.description || 'Chưa có mô tả chi tiết cho chuyến đi này.'}
                </p>
              </div>
            </div>

            {/* Cột phải: Host, Ảnh bìa, Chi phí */}
            <div className="lg:col-span-5 space-y-6">
              {/* Box Người tổ chức */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <h2 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <ShieldCheck size={16} className="text-emerald-500" /> Người tổ chức (Host)
                </h2>
                <div className="flex items-center gap-3">
                  {trip.organizerAvatarUrl ? (
                    <Image src={trip.organizerAvatarUrl} alt={trip.organizerName} containerClassName="w-10 h-10 rounded-xl border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-coral-50 text-coral-600 font-bold flex items-center justify-center shrink-0">
                      {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900">{trip.organizerName}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-700">{trip.organizerRating ? trip.organizerRating.toFixed(1) : '5.0'}</span>
                      <span>• Đã xác minh CCCD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box Ảnh bìa */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <h2 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <ImagePlus size={16} className="text-coral-500" /> Ảnh bìa chính
                </h2>
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                  <Image src={trip.coverImageUrl} alt={trip.title} previewable containerClassName="w-full h-full" />
                </div>
              </div>

              {/* Box Chi phí */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
                <h2 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <DollarSign size={16} className="text-coral-500" /> Chi phí & Quy mô
                </h2>
                <div className="space-y-2 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chi phí ước tính:</span>
                    <span className="font-black text-coral-600">
                      {trip.estimatedCost !== undefined && trip.estimatedCost !== null
                        ? `${trip.estimatedCost.toLocaleString('vi-VN')} VNĐ`
                        : 'Thỏa thuận'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Số thành viên tối đa:</span>
                    <span className="font-bold text-slate-800">{trip.maxMembers} người</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTripDetailPage;
