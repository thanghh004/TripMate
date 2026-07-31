import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Image from '../../components/common/Image';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
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
  UserCheck,
  Sparkles,
  AlertCircle,
  FileText,
  XCircle,
} from 'lucide-react';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchTripDetail = async () => {
      try {
        setIsLoading(true);
        const data = await tripApi.getTripById(id);
        setTrip(data);

        if (currentUser && data.members) {
          const joined = data.members.some((m) => m.userId === currentUser.userId);
          setHasJoined(joined);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Không thể tải thông tin chuyến đi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripDetail();
  }, [id]);

  const handleJoinTrip = async () => {
    if (!authContext?.isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đăng ký tham gia chuyến đi.');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      setIsJoining(true);
      await tripApi.joinTrip(id);
      toast.success('Gửi yêu cầu tham gia chuyến đi thành công!');
      setHasJoined(true);
      if (trip) {
        setTrip({ ...trip, currentMembers: trip.currentMembers + 1 });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu tham gia.');
    } finally {
      setIsJoining(false);
    }
  };

  const renderStatusBadge = (status: number) => {
    switch (status) {
      case TripStatus.PendingReview:
        return (
          <span className="text-[11px] font-black text-amber-700 bg-amber-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đang chờ duyệt
          </span>
        );
      case TripStatus.Approved:
      case TripStatus.Open:
        return (
          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đang nhận đăng ký
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
            Hoàn thành
          </span>
        );
      case TripStatus.Cancelled:
        return (
          <span className="text-[11px] font-black text-rose-700 bg-rose-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đã hủy
          </span>
        );
      case TripStatus.Failed:
        return (
          <span className="text-[11px] font-black text-slate-600 bg-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Tạo thất bại
          </span>
        );
      case TripStatus.Rejected:
        return (
          <span className="text-[11px] font-black text-rose-800 bg-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
            Đang nhận đăng ký
          </span>
        );
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

        {/* BỐ CỤC 2 CỘT (7 COLS MAIN + 5 COLS SIDEBAR) chuẩn CreateTripPage */}
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

              {/* Hiển thị Lý Do Hủy / Từ Chối / Thất Bại đầy đủ cho mọi trường hợp */}
              {trip.status === TripStatus.Rejected && (
                <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3.5 text-xs text-rose-900 font-sans">
                  <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-extrabold text-rose-900 text-xs uppercase tracking-wider">
                      Lý do bị từ chối phê duyệt bởi Admin
                    </p>
                    <p className="text-rose-800 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200/60 whitespace-pre-wrap">
                      {trip.moderationNote || 'Chưa có ghi chú lý do chi tiết từ Admin.'}
                    </p>
                  </div>
                </div>
              )}

              {trip.status === TripStatus.Cancelled && (
                <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3.5 text-xs text-rose-900 font-sans">
                  <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-extrabold text-rose-900 text-xs uppercase tracking-wider">
                      Lý do chuyến đi đã bị hủy
                    </p>
                    <p className="text-rose-800 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200/60 whitespace-pre-wrap">
                      {trip.cancellationReason || trip.moderationNote || 'Chuyến đi đã bị hủy bởi người tổ chức hoặc quản trị viên.'}
                    </p>
                  </div>
                </div>
              )}

              {trip.status === TripStatus.Failed && (
                <div className="p-4 sm:p-5 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-3.5 text-xs text-slate-800 font-sans">
                  <AlertCircle size={20} className="text-slate-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Lý do tạo chuyến đi thất bại
                    </p>
                    <p className="text-slate-700 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-200/60 whitespace-pre-wrap">
                      {trip.cancellationReason || trip.moderationNote || 'Chuyến đi tự động hủy do không đủ số lượng thành viên tham gia khi đến ngày khởi hành.'}
                    </p>
                  </div>
                </div>
              )}

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

              {/* Lộ trình: Điểm khởi hành & Điểm đến */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                {/* Điểm khởi hành */}
                <div className="space-y-3.5 p-5 rounded-2xl bg-white">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    <MapPin size={16} className="text-teal-600" /> Điểm khởi hành
                  </div>
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

                {/* Điểm đến */}
                <div className="space-y-3.5 p-5 rounded-2xl bg-white">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    <MapPin size={16} className="text-coral-500" /> Điểm đến chính
                  </div>
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

            {/* Box 2: Thời gian chuyến đi */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <Calendar size={18} className="text-coral-500" /> 2. Thời gian chuyến đi
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày khởi hành</label>
                  <Input value={formatDate(trip.startDate)} readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày kết thúc</label>
                  <Input value={formatDate(trip.endDate)} readOnly />
                </div>
              </div>
            </div>

            {/* Thành viên tham gia */}
            {trip.members && trip.members.length > 0 && (
              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-800">
                    <Users size={18} className="text-coral-500" /> Thành viên tham gia ({trip.members.length}/{trip.maxMembers})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trip.members.map((m) => (
                    <div key={m.userId} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/70">
                      {m.avatarUrl ? (
                        <Image src={m.avatarUrl} alt={m.fullName} containerClassName="w-9 h-9 rounded-xl border border-slate-100 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
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
            )}
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
            {trip.status === TripStatus.Open && currentUser?.userId !== trip.organizerId && (
              <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-3 font-sans">
                {hasJoined ? (
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2">
                    <UserCheck size={18} /> Đã gửi yêu cầu tham gia
                  </div>
                ) : (
                  <Button
                    onClick={handleJoinTrip}
                    disabled={isJoining || isFull}
                    className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isJoining ? <Loader2 size={16} className="animate-spin" /> : isFull ? 'Đã hết chỗ' : 'Đăng ký tham gia ngay'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default TripDetailPage;
