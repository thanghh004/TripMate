import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { tripApi } from '../../api/tripApi';
import { userApi } from '../../api/userApi';
import type { Trip, TripMember } from '../../types/trip';
import { TripStatus, TripMemberStatus } from '../../types/trip';
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
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
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

interface ApplicantProfile {
  userId: string;
  fullName: string;
  email: string;
  gender?: string;
  birthDate?: string;
  avatarUrl?: string;
  avgRating: number;
}

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const currentUser = authContext?.user;
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 1 || currentUser?.role === '1';

  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // State Host Profile Modal
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [hostProfile, setHostProfile] = useState<HostPublicProfile | null>(null);
  const [isLoadingHostProfile, setIsLoadingHostProfile] = useState<boolean>(false);

  // State Applicant Detail Modal (Dành cho Host bấm vào tên thành viên trong bảng)
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState<boolean>(false);
  const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile | null>(null);
  const [selectedApplicantMember, setSelectedApplicantMember] = useState<TripMember | null>(null);
  const [isLoadingApplicant, setIsLoadingApplicant] = useState<boolean>(false);
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);

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

  const handleOpenApplicantModal = async (member: TripMember) => {
    setSelectedApplicantMember(member);
    setIsApplicantModalOpen(true);
    try {
      setIsLoadingApplicant(true);
      const data = await userApi.getApplicantProfile(member.userId);
      setApplicantProfile(data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin người xin tham gia:', err);
    } finally {
      setIsLoadingApplicant(false);
    }
  };

  const handleApproveMember = async (userId: string) => {
    if (!trip) return;
    try {
      setIsActionProcessing(true);
      const res = await tripApi.approveMember(trip.id, userId);
      toast.success(res.message || 'Đã phê duyệt thành viên tham gia!');
      setIsApplicantModalOpen(false);
      // Reload lại trip detail
      const updated = await tripApi.getTripById(trip.id);
      setTrip(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Không thể duyệt thành viên.');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleRejectMember = async (userId: string) => {
    if (!trip) return;
    try {
      setIsActionProcessing(true);
      const res = await tripApi.rejectMember(trip.id, userId);
      toast.success(res.message || 'Đã từ chối yêu cầu tham gia.');
      setIsApplicantModalOpen(false);
      // Reload lại trip detail
      const updated = await tripApi.getTripById(trip.id);
      setTrip(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Không thể từ chối thành viên.');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!trip) return;

    try {
      setIsJoining(true);
      const response = await tripApi.joinTrip(trip.id);
      toast.success(response.message || 'Đã gửi yêu cầu tham gia chuyến đi, vui lòng chờ Trưởng đoàn phê duyệt!');
      // Reload lại thông tin chuyến đi sau khi join
      const updated = await tripApi.getTripById(trip.id);
      setTrip(updated);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Đã có lỗi xảy ra khi gửi yêu cầu tham gia chuyến đi.';
      toast.error(errorMsg);
      // Nếu lỗi do chưa cập nhật hồ sơ ➔ Chuyển sang /profile
      if (errorMsg.includes('cập nhật đầy đủ thông tin cá nhân') || errorMsg.includes('Hồ sơ cá nhân')) {
        navigate('/profile');
      }
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

  const isFull = trip.currentMembers >= trip.maxMembers;
  const isOrganizer = currentUser ? currentUser.userId === trip.organizerId : false;

  // Lấy thông tin trạng thái thành viên của user hiện tại
  const userMemberRecord = currentUser && trip.members ? trip.members.find((m) => m.userId === currentUser.userId) : null;
  const isPending = userMemberRecord ? userMemberRecord.status === TripMemberStatus.Pending : false;
  const isApproved = userMemberRecord ? userMemberRecord.status === TripMemberStatus.Approved : false;
  const isRejected = userMemberRecord ? userMemberRecord.status === TripMemberStatus.Rejected : false;
  const isMemberCancelled = userMemberRecord ? userMemberRecord.status === TripMemberStatus.Cancelled : false;
  const isMemberCompleted = userMemberRecord ? userMemberRecord.status === TripMemberStatus.Completed : false;

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    handleJoinTrip();
  };

  // Danh sách các thành viên khác đăng ký ngoại trừ Trưởng đoàn (Host)
  const allMembersOnly = trip.members ? trip.members.filter((m) => m.userId !== trip.organizerId) : [];

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

        {/* BỐ CỤC 2 CỘT (7 COLS MAIN + 5 COLS SIDEBAR) */}
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

              {/* Mô tả chuyến đi tự động co giãn hiển thị trọn vẹn */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText size={15} className="text-slate-500" /> Mô tả & Kế hoạch chi tiết
                </label>
                <div className="w-full bg-white border border-slate-300 rounded-xl p-4 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap break-words min-h-[120px]">
                  {trip.description || 'Chưa có thông tin mô tả lịch trình.'}
                </div>
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

              {/* BẢNG / LIST RÕ RÀNG 2 CỘT DÀNH CHO HOST VÀ ADMIN */}
              {(isOrganizer || isAdmin) ? (
                allMembersOnly.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Tên người dùng</th>
                          <th className="py-3 px-4 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {allMembersOnly.map((m) => (
                          <tr key={m.userId} className="hover:bg-slate-50/80 transition">
                            {/* Cột 1: Tên người dùng (Nhấn vào mở Modal thông tin chi tiết) */}
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleOpenApplicantModal(m)}
                                className="flex items-center gap-2.5 text-slate-900 font-bold hover:text-coral-600 transition cursor-pointer text-left group"
                              >
                                {m.avatarUrl ? (
                                  <Image src={m.avatarUrl} alt={m.fullName} containerClassName="w-8 h-8 rounded-xl border border-slate-200 shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-600 font-bold text-xs flex items-center justify-center shrink-0">
                                    {m.fullName ? m.fullName.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                )}
                                <span className="group-hover:underline flex items-center gap-1">
                                  {m.fullName} <ChevronRight size={14} className="text-slate-400 group-hover:text-coral-600" />
                                </span>
                              </button>
                            </td>

                            {/* Cột 2: Trạng thái (Chờ duyệt, Đã duyệt, Từ chối) */}
                            <td className="py-3 px-4 text-right">
                              {m.status === TripMemberStatus.Pending ? (
                                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full font-bold text-[11px]">
                                  <Clock size={12} /> Chờ duyệt
                                </span>
                              ) : m.status === TripMemberStatus.Approved || m.status === undefined ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full font-bold text-[11px]">
                                  <CheckCircle2 size={12} /> Đã duyệt
                                </span>
                              ) : m.status === TripMemberStatus.Rejected ? (
                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full font-bold text-[11px]">
                                  <XCircle size={12} /> Bị từ chối
                                </span>
                              ) : (
                                <span className="text-slate-500 font-semibold text-[11px]">Khác</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    Chưa có danh sách yêu cầu thành viên.
                  </div>
                )
              ) : null}
            </div>
          </div>

          {/* CỘT PHẢI (SIDEBAR FORM - 5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
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
                <div className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap break-words min-h-[70px]">
                  {trip.requirements || 'Chưa có yêu cầu khác.'}
                </div>
              </div>

              {/* DÙNG REUSABLE BUTTON COMPONENT ĐẶT SÁT NGAY BÊN TRONG CARD CHI PHÍ */}
              <div className="pt-3 font-sans border-t border-slate-200/60 mt-4">
                <Button
                  disabled={isJoining || isOrganizer || isPending || isApproved || isRejected || isMemberCompleted || isFull || trip.status !== TripStatus.Open}
                  onClick={handleButtonClick}
                  className={`w-full py-4 text-sm font-black rounded-2xl shadow-lg transition-transform flex items-center justify-center gap-2 ${
                    isOrganizer || isPending || isApproved || isRejected || isMemberCompleted || isFull || trip.status !== TripStatus.Open
                      ? 'bg-slate-600 text-white shadow-none opacity-100 cursor-not-allowed'
                      : 'bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-coral-500/30 hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  {isJoining ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Đang xử lý...
                    </>
                  ) : !isAuthenticated ? (
                    <>
                      <Users size={18} /> Đăng nhập để tham gia chuyến đi
                    </>
                  ) : isOrganizer ? (
                    'Bạn là Trưởng đoàn của chuyến đi này'
                  ) : isPending ? (
                    <>
                      <Clock size={18} className="text-white" /> Đã gửi yêu cầu (Chờ duyệt)
                    </>
                  ) : isApproved ? (
                    <>
                      <CheckCircle2 size={18} className="text-white" /> Bạn đã tham gia chuyến đi này
                    </>
                  ) : isRejected ? (
                    <>
                      <XCircle size={18} className="text-white" /> Yêu cầu tham gia đã bị từ chối
                    </>
                  ) : isMemberCompleted ? (
                    'Đã hoàn thành chuyến đi'
                  ) : isMemberCancelled ? (
                    'Đã hủy yêu cầu tham gia'
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
        </div>
      </main>

      {/* MODAL 1: DÙNG REUSABLE MODAL TỪ SRC/COMPONENTS/COMMON/MODAL.TSX - THÔNG TIN HOST */}
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
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Họ và tên</label>
              <Input value={hostProfile.fullName} readOnly leftIcon={<UserIcon size={16} className="text-slate-400" />} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email liên hệ</label>
              <Input value={hostProfile.email} readOnly leftIcon={<Mail size={16} className="text-slate-400" />} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Đánh giá uy tín</label>
              <Input value={`${hostProfile.rating.toFixed(1)} / 5.0 ⭐`} readOnly leftIcon={<Star size={16} className="text-amber-400 fill-amber-400" />} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Số chuyến đi tạo</label>
              <Input
                value={`${hostProfile.totalCreatedTrips} chuyến (${hostProfile.uncompletedTripsCount} không hoàn thành)`}
                readOnly
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsHostModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Không thể tải thông tin người dùng.
          </div>
        )}
      </Modal>

      {/* MODAL 2: DÙNG REUSABLE MODAL - XEM CHI TIẾT NGƯỜI XIN THAM GIA (DÀNH CHO HOST KHI BẤM VÀO TÊN) */}
      <Modal
        isOpen={isApplicantModalOpen}
        onClose={() => setIsApplicantModalOpen(false)}
        title="Chi tiết thành viên xin tham gia"
        maxWidth="md"
      >
        {isLoadingApplicant ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <span className="text-xs font-semibold">Đang tải hồ sơ thành viên...</span>
          </div>
        ) : applicantProfile ? (
          <div className="space-y-4 text-left font-sans pt-1">
            {/* Tên */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Họ và tên</label>
              <Input value={applicantProfile.fullName} readOnly leftIcon={<UserIcon size={16} className="text-slate-400" />} />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email liên hệ</label>
              <Input value={applicantProfile.email} readOnly leftIcon={<Mail size={16} className="text-slate-400" />} />
            </div>

            {/* Giới tính & Ngày sinh */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Giới tính</label>
                <Input value={applicantProfile.gender || 'Chưa cập nhật'} readOnly />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Ngày sinh</label>
                <Input value={applicantProfile.birthDate ? formatDate(applicantProfile.birthDate) : 'Chưa cập nhật'} readOnly />
              </div>
            </div>

            {/* Đánh giá */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Đánh giá trung bình</label>
              <Input value={`${applicantProfile.avgRating.toFixed(1)} / 5.0 ⭐`} readOnly leftIcon={<Star size={16} className="text-amber-400 fill-amber-400" />} />
            </div>

            {/* 2 Nút Hành động Từ chối và Duyệt (Chỉ hiển thị cho Host đối với thành viên Chờ duyệt) */}
            {isOrganizer && selectedApplicantMember?.status === TripMemberStatus.Pending ? (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <Button
                  disabled={isActionProcessing}
                  onClick={() => handleRejectMember(applicantProfile.userId)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle size={16} /> Từ chối
                </Button>

                <Button
                  disabled={isActionProcessing}
                  onClick={() => handleApproveMember(applicantProfile.userId)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Duyệt tham gia
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsApplicantModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 font-bold text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Không thể tải hồ sơ người dùng.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TripDetailPage;
