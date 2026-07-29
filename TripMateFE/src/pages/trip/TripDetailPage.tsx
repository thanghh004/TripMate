import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import Image from '../../components/common/Image';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
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
  ArrowLeft,
  Share2,
  Bookmark,
  UserCheck,
  Sparkles,
  AlertCircle
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
        
        // Kiểm tra xem user hiện tại đã tham gia chưa
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

  // Đăng ký tham gia chuyến đi
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

  // Chia sẻ link chuyến đi
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết chuyến đi vào bộ nhớ tạm!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-coral-500" />
          <span className="text-sm font-semibold">Đang tải thông tin chuyến đi...</span>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xs text-center max-w-md space-y-4">
          <AlertCircle size={48} className="mx-auto text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy chuyến đi</h2>
          <p className="text-xs text-slate-500">Chuyến đi có thể đã bị hủy, ẩn hoặc không tồn tại trên hệ thống.</p>
          <Button onClick={() => navigate('/trips')} className="w-full bg-coral-500 text-white font-bold py-2.5 rounded-xl">
            Khám phá chuyến đi khác
          </Button>
        </div>
      </div>
    );
  }

  const isOrganizer = currentUser?.userId === trip.organizerId;
  const isFull = trip.currentMembers >= trip.maxMembers;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans pb-16">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Chia sẻ chuyến đi"
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              className="p-2 text-slate-600 hover:text-rose-500 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Lưu yêu thích"
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>

        {/* LAYOUT 2 CỘT TƯƠNG TỰ TẠO MỚI CHUYẾN (7 COLS MAIN + 5 COLS SIDEBAR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">

          {/* CỘT TRÁI (MAIN CONTENT - 7 COLS) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Box 1: Thông tin tổng quan chuyến đi */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800">
                  <Info size={18} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                </span>
                <span className="text-[11px] font-bold text-coral-600 bg-coral-50 px-3 py-1 rounded-full">
                  {trip.categoryName || 'Chuyến đi'}
                </span>
              </h2>

              {/* Status Badge & Title */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {trip.statusName || 'Đang mở đăng ký'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    • Tạo ngày {formatDate(trip.createdAt)}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {trip.title}
                </h1>
              </div>

              {/* Địa điểm Khởi hành & Đến */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={14} className="text-coral-500" /> Điểm khởi hành
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {trip.startLocation}
                  </p>
                  {trip.startCityName && (
                    <p className="text-xs font-semibold text-slate-500">{trip.startCityName}</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={14} className="text-emerald-500" /> Điểm đến chính
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {trip.destination}
                  </p>
                  {trip.destinationCityName && (
                    <p className="text-xs font-semibold text-slate-500">{trip.destinationCityName}</p>
                  )}
                </div>
              </div>

              {/* Thời gian Bắt đầu & Kết thúc */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={14} className="text-coral-500" /> Thời gian lịch trình
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Bắt đầu</span>
                    <span>{formatDate(trip.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Kết thúc</span>
                    <span>{formatDate(trip.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Kế hoạch & Mô tả chi tiết */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <Info size={18} className="text-coral-500" /> 2. Kế hoạch & Mô tả chi tiết
              </h2>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-normal leading-relaxed text-slate-700 whitespace-pre-line">
                {trip.description || 'Chưa có mô tả chi tiết cho chuyến đi này.'}
              </div>
            </div>

            {/* Box 3: Danh sách Thành viên đã tham gia */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-coral-500" /> Thành viên đã tham gia ({trip.currentMembers}/{trip.maxMembers})
                </h2>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Còn trống {Math.max(0, trip.maxMembers - trip.currentMembers)} chỗ
                </span>
              </div>

              {trip.members && trip.members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trip.members.map((member) => (
                    <div key={member.userId} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
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
                <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                  Chưa có thành viên nào đăng ký. Hãy là người đầu tiên tham gia!
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (SIDEBAR FORM - 5 COLS STICKY) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Box 1: Thẻ Người tổ chức (Host / Organizer) */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Người tổ chức (Host)</span>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                {trip.organizerAvatarUrl ? (
                  <Image
                    src={trip.organizerAvatarUrl}
                    alt={trip.organizerName}
                    containerClassName="w-12 h-12 rounded-2xl border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-600 font-black text-lg flex items-center justify-center shrink-0">
                    {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : 'H'}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{trip.organizerName}</h3>
                    <span title="Host đã xác minh CCCD">
                      <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700">
                      {trip.organizerRating ? trip.organizerRating.toFixed(1) : '5.0'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">(Host uy tín)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Ảnh bìa chính & Bộ sưu tập ảnh */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <ImagePlus size={18} className="text-coral-500" /> Ảnh bìa & Hình ảnh
              </h2>

              {/* Ảnh bìa chính */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Ảnh bìa chính</span>
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
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Bộ sưu tập ảnh ({trip.imageUrls.length})
                  </span>
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

            {/* Box 3: Chi phí & Thành viên */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-4 font-sans">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <DollarSign size={18} className="text-coral-500" /> Chi phí & Điều kiện
              </h2>

              {/* Chi phí ước tính */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chi phí ước tính / người</span>
                <p className="text-lg font-black text-coral-600">
                  {trip.estimatedCost ? `${trip.estimatedCost.toLocaleString('vi-VN')} VNĐ` : 'Thỏa thuận'}
                </p>
                {trip.costNote && (
                  <p className="text-xs font-medium text-slate-500 pt-1 border-t border-slate-100">{trip.costNote}</p>
                )}
              </div>

              {/* Yêu cầu độ tuổi */}
              {(trip.minAge || trip.maxAge) && (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-slate-500 font-semibold">Độ tuổi yêu cầu:</span>
                  <span>
                    {trip.minAge ? `${trip.minAge} tuổi` : 'Không min'} - {trip.maxAge ? `${trip.maxAge} tuổi` : 'Không max'}
                  </span>
                </div>
              )}

              {/* Yêu cầu khác */}
              {trip.requirements && (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 block">Yêu cầu khác:</span>
                  <p className="text-slate-600 font-medium leading-relaxed">{trip.requirements}</p>
                </div>
              )}
            </div>

            {/* Box 4: Action Box (Đăng ký tham gia) */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-3">
              {isOrganizer ? (
                <Button
                  onClick={() => navigate(`/trips/${trip.id}/edit`)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-4 rounded-2xl cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  Chỉnh sửa chuyến đi của tôi
                </Button>
              ) : hasJoined ? (
                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2">
                  <UserCheck size={18} /> Bạn đã đăng ký chuyến đi này
                </div>
              ) : isFull ? (
                <div className="w-full bg-slate-200 text-slate-600 font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2">
                  Chuyến đi đã hết chỗ
                </div>
              ) : (
                <Button
                  onClick={handleJoinTrip}
                  disabled={isJoining}
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-black text-xs py-4 rounded-2xl cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                >
                  {isJoining ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Đang gửi yêu cầu...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Đăng ký tham gia chuyến đi
                    </>
                  )}
                </Button>
              )}
            </div>

          </div>

        </div>
      </main>

      <ScrollToTop />
    </div>
  );
};

export default TripDetailPage;
