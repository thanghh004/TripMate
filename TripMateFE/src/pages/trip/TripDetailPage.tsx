import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { tripApi } from '../../api/tripApi';
import { userApi } from '../../api/userApi';
import type { Trip } from '../../types/trip';
import { TripStatus } from '../../types/trip';
import { Header } from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Image from '../../components/common/Image';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  Users,
  DollarSign,
  FileText,
  ShieldCheck,
  Star,
  Loader2,
  AlertCircle,
  Sparkles,
  MapPin,
  ImagePlus,
  Mail,
  User as UserIcon,
} from 'lucide-react';

interface HostPublicProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  totalCreatedTrips: number;
  completedTripsCount: number;
  uncompletedTripsCount: number;
}

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const currentUser = authContext?.user;
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // State Host Profile Modal
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [hostProfile, setHostProfile] = useState<HostPublicProfile | null>(null);
  const [isLoadingHostProfile, setIsLoadingHostProfile] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchTripDetail = async () => {
      try {
        setIsLoading(true);
        const data = await tripApi.getTripById(id);
        setTrip(data);
      } catch (err: any) {
        console.error('Lỗi khi lấy chi tiết chuyến đi:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripDetail();
  }, [id]);

  const handleOpenHostModal = async () => {
    if (!trip || !trip.organizerId) return;
    setIsHostModalOpen(true);
    try {
      setIsLoadingHostProfile(true);
      const data = await userApi.getHostPublicProfile(trip.organizerId);
      setHostProfile(data);
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ Host:', err);
    } finally {
      setIsLoadingHostProfile(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!trip) return;
    try {
      setIsJoining(true);
      const response = await tripApi.joinTrip(trip.id);
      toast.success(response.message || 'Đăng ký tham gia chuyến đi thành công!');
      // Reload lại thông tin chuyến đi sau khi join
      const updated = await tripApi.getTripById(trip.id);
      setTrip(updated);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Đã có lỗi xảy ra khi đăng ký tham gia chuyến đi.';
      toast.error(errorMsg);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-coral-500" />
          <span className="text-sm font-semibold">Đang tải thông tin chuyến đi...</span>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl text-center max-w-md space-y-4 shadow-sm">
          <AlertCircle size={48} className="mx-auto text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy chuyến đi</h2>
          <p className="text-xs text-slate-500">Chuyến đi có thể đã bị hủy hoặc không tồn tại trên hệ thống.</p>
          <Button onClick={() => navigate('/')} className="w-full bg-coral-500 text-white font-bold py-2.5 rounded-xl">
            Khám phá chuyến đi khác
          </Button>
        </div>
      </div>
    );
  }

  const isFull = trip ? trip.currentMembers >= trip.maxMembers : false;
  const isOrganizer = currentUser && trip ? currentUser.userId === trip.organizerId : false;
  const isAlreadyMember = currentUser && trip?.members ? trip.members.some((m) => m.userId === currentUser.userId) : false;

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    handleJoinTrip();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1400px] mx-auto w-full">
        {/* Header Title Seamless Top */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-4 sm:p-6 rounded-3xl">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              {trip.title} <Sparkles size={24} className="text-coral-500 fill-coral-500/20" />
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Thông tin chi tiết hành trình và thành viên tham gia chuyến đi.
            </p>
          </div>

          {/* Thẻ Người tổ chức (Click vào để mở Modal Hồ Sơ Host) */}
          <button
            type="button"
            onClick={handleOpenHostModal}
            className="shrink-0 flex items-center gap-3 bg-white hover:bg-slate-100/90 p-3 rounded-2xl border border-slate-200/80 shadow-2xs transition cursor-pointer text-left group"
          >
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
              <p className="text-slate-800 font-bold flex items-center gap-1 group-hover:text-coral-600 transition">
                Người tổ chức: {trip.organizerName}
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              </p>
              <p className="text-slate-400 flex items-center gap-1.5 pt-0.5">
                <span className="flex items-center gap-0.5 text-slate-600 font-bold">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  {trip.organizerRating ? trip.organizerRating.toFixed(1) : '5.0'}
                </span>
                <span>•</span>
                <span className="text-coral-600 font-bold">Xem thông tin Host ➔</span>
              </p>
            </div>
          </button>
        </div>

        {/* BỐ CỤC 2 CỘT (7 COLS MAIN + 5 COLS SIDEBAR) chuẩn CreateTripPage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* CỘT TRÁI (MAIN FORM - 7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* THÔNG BÁO LÝ DO NẾU CHUYẾN ĐI BỊ HỦY HOẶC TỪ CHỐI DUYỆT */}
            {(trip.status === TripStatus.Cancelled || trip.status === TripStatus.Rejected || trip.status === TripStatus.Failed) && (
              <div className="p-5 bg-rose-50 border border-rose-200/90 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-rose-800 uppercase tracking-wider">
                  <AlertCircle size={16} /> Thông báo trạng thái chuyến đi
                </div>
                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                  Lý do: <strong className="font-bold">{trip.cancellationReason || trip.moderationNote || 'Chuyến đi đã kết thúc hoặc bị hủy.'}</strong>
                </p>
              </div>
            )}

            {/* Box 1: Thông tin chung */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-5 font-sans">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                </h2>
                <div className="flex items-center gap-2">
                  {trip.status === TripStatus.Open && (
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
                      Đang nhận đăng ký
                    </span>
                  )}
                  {trip.status === TripStatus.Full && (
                    <span className="text-[11px] font-extrabold text-blue-800 bg-blue-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
                      Đã đủ chỗ
                    </span>
                  )}
                </div>
              </div>

              {/* Tiêu đề & Loại hình */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tiêu đề chuyến đi</label>
                  <Input value={trip.title} readOnly />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Loại hình chuyến đi</label>
                  <Input value={trip.categoryName || 'Chưa chọn'} readOnly />
                </div>
              </div>

              {/* Lộ trình Chuyến đi (2 Card con tách biệt) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Điểm khởi hành */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 border-b border-slate-100 pb-2">
                    <MapPin size={16} className="text-teal-600 shrink-0" />
                    <span>Điểm khởi hành</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Địa điểm cụ thể</label>
                      <Input value={trip.startLocation} readOnly />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Quốc gia</label>
                        <Input value="Việt Nam" readOnly />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Thành phố / Tỉnh</label>
                        <Input value={trip.startCityName || 'Chưa chọn'} readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Điểm đến chính */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-coral-700 border-b border-slate-100 pb-2">
                    <MapPin size={16} className="text-coral-500 shrink-0" />
                    <span>Điểm đến chính</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Địa điểm cụ thể</label>
                      <Input value={trip.destination} readOnly />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Quốc gia</label>
                        <Input value="Việt Nam" readOnly />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Thành phố / Tỉnh</label>
                        <Input value={trip.destinationCityName || 'Chưa chọn'} readOnly />
                      </div>
                    </div>
                  </div>
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

              {/* Mô tả chuyến đi */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText size={15} className="text-slate-500" /> Mô tả & Kế hoạch chi tiết
                </label>
                <textarea
                  rows={6}
                  value={trip.description || 'Chưa có thông tin mô tả lịch trình.'}
                  readOnly
                  className="w-full bg-white border border-slate-300 rounded-xl p-4 text-xs font-medium text-slate-800 focus:outline-none transition resize-none leading-relaxed"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Trưởng đoàn (Host) */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-coral-200/80 shadow-2xs">
                  {trip.organizerAvatarUrl ? (
                    <Image src={trip.organizerAvatarUrl} alt={trip.organizerName} containerClassName="w-10 h-10 rounded-xl border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                    </div>
                  )}
                  <div className="text-xs min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate flex items-center gap-1">
                      {trip.organizerName}
                      <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    </p>
                    <p className="text-[11px] font-extrabold text-coral-600">Trưởng đoàn (Host)</p>
                  </div>
                </div>

                {/* 2. Các thành viên khác nếu có */}
                {trip.members && trip.members.length > 0 && trip.members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/70">
                    {m.avatarUrl ? (
                      <Image src={m.avatarUrl} alt={m.fullName} containerClassName="w-10 h-10 rounded-xl border border-slate-100 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {m.fullName ? m.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="text-xs min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate">{m.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{m.role || 'Thành viên'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (SIDEBAR FORM - 5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box 3: Ảnh bìa & Hình ảnh */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <ImagePlus size={18} className="text-coral-500" /> Ảnh bìa & Hình ảnh
              </h2>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Ảnh bìa chính</label>
                {trip.coverImageUrl ? (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-white shadow-xs border border-slate-200">
                    <Image src={trip.coverImageUrl} alt={trip.title} previewable containerClassName="w-full h-full" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400 font-medium">
                    Chưa có ảnh bìa
                  </div>
                )}
              </div>

              {trip.imageUrls && trip.imageUrls.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Bộ sưu tập ảnh ({trip.imageUrls.length})
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {trip.imageUrls.map((url, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white">
                        <Image src={url} alt={`Gallery ${idx}`} previewable containerClassName="w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Box 4: Chi phí & Thành viên */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-4 font-sans">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <DollarSign size={18} className="text-coral-500" /> Chi phí & Thành viên
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Chi phí ước tính / người</label>
                <Input value={trip.estimatedCost ? `${trip.estimatedCost.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'} readOnly />
              </div>

              {trip.costNote && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chú chi phí</label>
                  <Input value={trip.costNote} readOnly />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Số lượng thành viên tối đa</label>
                <Input value={`${trip.currentMembers}/${trip.maxMembers} thành viên`} readOnly rightIcon={<Users size={18} className="text-slate-400" />} />
              </div>

              {/* Giới hạn độ tuổi */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Yêu cầu độ tuổi (Nếu có)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={trip.minAge || ''}
                    readOnly
                    placeholder="Min (VD: 18)"
                  />
                  <Input
                    type="number"
                    value={trip.maxAge || ''}
                    readOnly
                    placeholder="Max (VD: 40)"
                  />
                </div>
              </div>

              {/* Yêu cầu khác đối với thành viên */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Yêu cầu khác đối với thành viên</label>
                <textarea
                  rows={3}
                  value={trip.requirements || 'Chưa có yêu cầu khác.'}
                  readOnly
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Action Join Button cho User */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-3 font-sans">
              <Button
                disabled={isJoining || isOrganizer || isAlreadyMember || isFull || trip.status !== TripStatus.Open}
                onClick={handleButtonClick}
                className={`w-full py-4 text-sm font-black rounded-2xl shadow-lg transition-transform cursor-pointer flex items-center justify-center gap-2 ${
                  isOrganizer || isAlreadyMember || isFull || trip.status !== TripStatus.Open
                    ? 'bg-slate-300 text-slate-600 shadow-none cursor-not-allowed'
                    : 'bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-coral-500/30 hover:scale-[1.02]'
                }`}
              >
                {isJoining ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Đang xử lý đăng ký...
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <Users size={18} /> Đăng nhập để tham gia chuyến đi
                  </>
                ) : isOrganizer ? (
                  'Bạn là Trưởng đoàn của chuyến đi này'
                ) : isAlreadyMember ? (
                  'Bạn đã tham gia chuyến đi này'
                ) : isFull ? (
                  'Chuyến đi đã đủ thành viên'
                ) : trip.status !== TripStatus.Open ? (
                  'Chuyến đi tạm ngưng nhận chỗ'
                ) : (
                  <>
                    <Users size={18} /> Đăng ký tham gia chuyến đi ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* DÙNG REUSABLE MODAL COMPONENT TỪ SRC/COMPONENTS/COMMON/MODAL.TSX */}
      <Modal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        title="Thông tin Người tổ chức"
        maxWidth="md"
      >
        {isLoadingHostProfile ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <span className="text-xs font-semibold">Đang nạp thông tin...</span>
          </div>
        ) : hostProfile ? (
          <div className="space-y-4 text-left font-sans pt-1">
            {/* Tên người dùng */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Họ và tên</label>
              <Input value={hostProfile.fullName} readOnly leftIcon={<UserIcon size={16} className="text-slate-400" />} />
            </div>

            {/* Email người dùng */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email liên hệ</label>
              <Input value={hostProfile.email} readOnly leftIcon={<Mail size={16} className="text-slate-400" />} />
            </div>

            {/* Đánh giá sao */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Đánh giá uy tín</label>
              <Input value={`${hostProfile.rating.toFixed(1)} / 5.0 ⭐`} readOnly leftIcon={<Star size={16} className="text-amber-400 fill-amber-400" />} />
            </div>

            {/* Số chuyến đi tạo HIỂN THỊ CHÍNH XÁC 100% NHƯ ẢNH YÊU CẦU */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Số chuyến đi tạo</label>
              <Input
                value={`${hostProfile.totalCreatedTrips} chuyến (${hostProfile.uncompletedTripsCount} không hoàn thành)`}
                readOnly
              />
            </div>

            <div className="pt-3">
              <Button
                onClick={() => setIsHostModalOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Không thể tải thông tin người dùng.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TripDetailPage;
