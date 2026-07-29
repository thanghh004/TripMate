import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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
  Users,
  DollarSign,
  Info,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Star,
  Sparkles,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowLeft
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

  // Admin Phê duyệt chuyến đi
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

  // Admin Từ chối chuyến đi
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

  // Helper render Trạng thái chuyến đi chuẩn Tiếng Việt
  const renderStatusBadge = (status: number) => {
    switch (status) {
      case TripStatus.PendingReview:
        return (
          <span className="text-[11px] font-black text-amber-700 bg-amber-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đang chờ duyệt
          </span>
        );
      case TripStatus.Open:
      case TripStatus.Approved:
        return (
          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đang mở đăng ký
          </span>
        );
      case TripStatus.Full:
        return (
          <span className="text-[11px] font-black text-blue-700 bg-blue-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đã đủ thành viên
          </span>
        );
      case TripStatus.Ongoing:
        return (
          <span className="text-[11px] font-black text-purple-700 bg-purple-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đang diễn ra
          </span>
        );
      case TripStatus.Completed:
        return (
          <span className="text-[11px] font-black text-slate-700 bg-slate-200/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đã hoàn thành
          </span>
        );
      case TripStatus.Cancelled:
      case TripStatus.Failed:
      case TripStatus.Rejected:
        return (
          <span className="text-[11px] font-black text-rose-700 bg-rose-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đã hủy / Bị từ chối
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đang mở đăng ký
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left max-w-[1400px] mx-auto">
        {isLoading ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={36} className="animate-spin text-coral-500" />
            <span className="text-sm font-semibold">Đang tải thông tin chuyến đi...</span>
          </div>
        ) : !trip ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
            <AlertCircle size={48} className="mx-auto text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">Không tìm thấy chuyến đi</h2>
            <Button onClick={() => navigate('/admin/trips')} className="bg-coral-500 text-white font-bold py-2.5 px-6 rounded-xl">
              Quay lại danh sách chuyến đi
            </Button>
          </div>
        ) : (
          <>
            {/* Header Title Top - KHỚP 100% VỚI THIẾT KẾ PHẲNG & THẺ HOST GÓC PHẢI */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/trips')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer mb-1"
                  >
                    <ArrowLeft size={15} /> Quay lại danh sách
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  {trip.title} <Sparkles size={24} className="text-coral-500 fill-coral-500/20" />
                </h1>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Đăng tin tuyển thành viên đồng hành cho hành trình tuyệt vời sắp tới của bạn.
                </p>
              </div>

              {/* Thẻ Người Tổ Chức (Host) ở vị trí góc phải */}
              <div className="shrink-0 flex items-center gap-3 bg-slate-100/80 p-3 rounded-2xl">
                {trip.organizerAvatarUrl ? (
                  <Image
                    src={trip.organizerAvatarUrl}
                    alt={trip.organizerName}
                    containerClassName="w-10 h-10 rounded-xl border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-coral-50 text-coral-600 font-black text-base flex items-center justify-center shrink-0">
                    {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                  </div>
                )}

                <div className="text-[11px] text-slate-600 font-semibold">
                  <p className="text-slate-800 font-bold flex items-center gap-1">
                    Người tổ chức: {trip.organizerName}
                    <span title="Host đã xác minh CCCD">
                      <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    </span>
                  </p>
                  <p className="text-slate-400 flex items-center gap-1 pt-0.5">
                    <span>Đã xác minh CCCD</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-600 font-bold">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      {trip.organizerRating ? trip.organizerRating.toFixed(1) : '5.0'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* BỐ CỤC 2 CỘT (7 COLS MAIN + 5 COLS SIDEBAR) KHỚP 100% THIẾT KẾ CỦA USER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">

              {/* CỘT TRÁI (MAIN FORM - 7 COLS) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Box 1: Thông tin chung về chuyến đi */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-800">
                      <Info size={18} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                    </span>
                    {renderStatusBadge(trip.status)}
                  </h2>

                  {/* Tiêu đề & Loại hình */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiêu đề chuyến đi</label>
                      <Input value={trip.title} readOnly />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại hình chuyến đi</label>
                      <Input value={trip.categoryName || 'Chưa phân loại'} readOnly />
                    </div>
                  </div>

                  {/* Điểm khởi hành & Điểm đến */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa điểm khởi hành</label>
                      <Input
                        value={`${trip.startLocation}${trip.startCityName ? ` (${trip.startCityName})` : ''}`}
                        readOnly
                        leftIcon={<MapPin size={18} className="text-coral-500 shrink-0" />}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa điểm đến chính</label>
                      <Input
                        value={`${trip.destination}${trip.destinationCityName ? ` (${trip.destinationCityName})` : ''}`}
                        readOnly
                        leftIcon={<MapPin size={18} className="text-emerald-500 shrink-0" />}
                      />
                    </div>
                  </div>

                  {/* Ngày khởi hành & Ngày kết thúc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày khởi hành</label>
                      <Input
                        value={formatDate(trip.startDate)}
                        readOnly
                        leftIcon={<Calendar size={18} className="text-coral-500 shrink-0" />}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày kết thúc</label>
                      <Input
                        value={formatDate(trip.endDate)}
                        readOnly
                        leftIcon={<Calendar size={18} className="text-coral-500 shrink-0" />}
                      />
                    </div>
                  </div>
                </div>

                {/* Box 2: Kế hoạch & Mô tả chi tiết */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <FileText size={18} className="text-coral-500" /> 2. Kế hoạch & Mô tả chi tiết
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nội dung chi tiết chuyến đi</label>
                    <textarea
                      rows={6}
                      value={trip.description || 'Chưa có mô tả chi tiết cho chuyến đi này.'}
                      readOnly
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none transition resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Box 3: Danh sách Thành viên tham gia */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Users size={18} className="text-coral-500" /> Thành viên đã tham gia ({trip.currentMembers}/{trip.maxMembers})
                    </h2>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Còn trống {Math.max(0, trip.maxMembers - trip.currentMembers)} chỗ
                    </span>
                  </div>

                  {trip.members && trip.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {trip.members.map((member) => (
                        <div key={member.userId} className="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                          {member.avatarUrl ? (
                            <Image
                              src={member.avatarUrl}
                              alt={member.fullName}
                              containerClassName="w-10 h-10 rounded-xl border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-coral-50 text-coral-600 font-bold text-sm flex items-center justify-center shrink-0">
                              {member.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{member.fullName}</p>
                            <span className="text-[10px] font-semibold text-slate-400 block">{member.role || 'Thành viên'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                      Chưa có thành viên nào đăng ký.
                    </div>
                  )}
                </div>

              </div>

              {/* CỘT PHẢI (SIDEBAR FORM - 5 COLS) */}
              <div className="lg:col-span-5 space-y-6">

                {/* Box 1: Ảnh bìa chính & Bộ sưu tập ảnh */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-5 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <ImagePlus size={18} className="text-coral-500" /> Ảnh bìa & Hình ảnh
                  </h2>

                  {/* Ảnh bìa chính */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Ảnh bìa chính</label>
                    <div className="rounded-2xl overflow-hidden aspect-video bg-white border border-slate-200 shadow-2xs">
                      <Image
                        src={trip.coverImageUrl}
                        alt={trip.title}
                        previewable
                        fallbackText="Chưa có ảnh bìa"
                        containerClassName="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Bộ sưu tập ảnh */}
                  {trip.imageUrls && trip.imageUrls.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Bộ sưu tập ảnh ({trip.imageUrls.length})
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {trip.imageUrls.map((url, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white">
                            <Image
                              src={url}
                              alt={`Gallery ${idx}`}
                              previewable
                              containerClassName="w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Box 2: Chi phí & Thành viên */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-4 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <DollarSign size={18} className="text-coral-500" /> Chi phí & Thành viên
                  </h2>

                  {/* Chi phí ước tính */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Chi phí ước tính / người (VND)</label>
                    <Input
                      value={
                        trip.estimatedCost !== undefined && trip.estimatedCost !== null
                          ? `${trip.estimatedCost.toLocaleString('vi-VN')} VNĐ`
                          : 'Thỏa thuận'
                      }
                      readOnly
                      className="font-black text-coral-600"
                    />
                  </div>

                  {/* Ghi chú chi phí */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chú chi phí</label>
                    <Input value={trip.costNote || 'Không có ghi chú thêm.'} readOnly />
                  </div>

                  {/* Số lượng thành viên tối đa */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Số lượng thành viên tối đa</label>
                    <Input
                      value={`${trip.maxMembers} thành viên`}
                      readOnly
                      rightIcon={<Users size={18} className="text-slate-400 shrink-0" />}
                    />
                  </div>

                  {/* Giới hạn độ tuổi */}
                  {(trip.minAge || trip.maxAge) && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-xs font-bold text-slate-700">Yêu cầu độ tuổi</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={`Min: ${trip.minAge || 'Không có'}`} readOnly />
                        <Input value={`Max: ${trip.maxAge || 'Không có'}`} readOnly />
                      </div>
                    </div>
                  )}

                  {/* Yêu cầu khác */}
                  {trip.requirements && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-xs font-bold text-slate-700">Yêu cầu khác đối với thành viên</label>
                      <textarea
                        rows={3}
                        value={trip.requirements}
                        readOnly
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none transition resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Box 3: Thanh công cụ Duyệt / Từ chối dành riêng cho ADMIN */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-3 font-sans">
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] font-bold text-amber-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                    <span>Quản trị viên Admin — Thẩm định & Phê duyệt chuyến đi</span>
                  </div>

                  {trip.status === TripStatus.PendingReview ? (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <Button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleApprove}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle2 size={16} /> Phê duyệt chuyến
                      </Button>

                      <Button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleReject}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3.5 rounded-2xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <XCircle size={16} /> Từ chối chuyến
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs font-bold text-slate-500">
                      Trạng thái hiện tại: {renderStatusBadge(trip.status)}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTripDetailPage;
