import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { DatePicker } from '../../components/common/DatePicker';
import { Modal } from '../../components/common/Modal';
import { HostVerificationStatus } from '../../types/auth';
import {
  ShieldCheck, Star,
  AlignLeft, Camera, Loader2, ImagePlus, X, Phone, CreditCard, Clock, AlertCircle, Send, RefreshCw, Lock, Mail
} from 'lucide-react';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

const GENDER_OPTIONS = [
  { label: 'Nam', value: 'Nam' },
  { label: 'Nữ', value: 'Nữ' },
  { label: 'Khác', value: 'Khác' },
];

const VIETNAM_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
const CCCD_REGEX = /^\d{12}$/;

const ProfilePage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();
  const { toast } = useToast();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cccdFrontInputRef = useRef<HTMLInputElement>(null);
  const cccdBackInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isReverificationMode, setIsReverificationMode] = useState(false);
  const [showReverifyConfirmModal, setShowReverifyConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const profileDataRef = useRef<{
    fullName: string;
    phoneNumber: string;
    avatarUrl: string;
    cccdFrontUrl: string;
    cccdBackUrl: string;
    identityCardNumber: string;
    gender: string;
    birthDate: string;
    bio: string;
  }>({
    fullName: '',
    phoneNumber: '',
    avatarUrl: '',
    cccdFrontUrl: '',
    cccdBackUrl: '',
    identityCardNumber: '',
    gender: '',
    birthDate: '',
    bio: '',
  });

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cccdFrontUrl, setCccdFrontUrl] = useState('');
  const [cccdBackUrl, setCccdBackUrl] = useState('');
  const [identityCardNumber, setIdentityCardNumber] = useState('');
  const [hostVerificationStatus, setHostVerificationStatus] = useState<HostVerificationStatus>(HostVerificationStatus.Unverified);
  const [hostRejectReason, setHostRejectReason] = useState<string>('');

  const isApproved = hostVerificationStatus === HostVerificationStatus.Approved;
  const isIdentityLocked = isApproved && !isReverificationMode;

  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [createdCompletedTripsCount, setCreatedCompletedTripsCount] = useState(0);
  const [createdUncompletedTripsCount, setCreatedUncompletedTripsCount] = useState(0);
  const [joinedCompletedTripsCount, setJoinedCompletedTripsCount] = useState(0);
  const [joinedUncompletedTripsCount, setJoinedUncompletedTripsCount] = useState(0);
  const [hasActiveTrips, setHasActiveTrips] = useState(false);



  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    if (authContext && !authContext.isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authContext, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchProfile = async () => {
      try {
        setIsFetchingProfile(true);
        const res = await userApi.getProfile();
        const profile = res.data;
        const bDate = profile.birthDate ? String(profile.birthDate).substring(0, 10) : '';

        profileDataRef.current = {
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber || '',
          avatarUrl: profile.avatarUrl || '',
          cccdFrontUrl: profile.identityCardFrontUrl || '',
          cccdBackUrl: profile.identityCardBackUrl || '',
          identityCardNumber: profile.identityCardNumber || '',
          gender: profile.gender || '',
          birthDate: bDate,
          bio: profile.bio || '',
        };

        setFullName(profile.fullName);
        setPhoneNumber(profile.phoneNumber || '');
        setGender(profile.gender || '');
        setBirthDate(bDate);
        setAvatarUrl(profile.avatarUrl || '');
        setCccdFrontUrl(profile.identityCardFrontUrl || '');
        setCccdBackUrl(profile.identityCardBackUrl || '');
        setIdentityCardNumber(profile.identityCardNumber || '');
        setHostVerificationStatus(profile.hostVerificationStatus ?? HostVerificationStatus.Unverified);
        setHostRejectReason(profile.hostRejectReason || '');
        setBio(profile.bio || '');
        const createdCompleted = profile.createdCompletedTripsCount ?? 0;
        const createdUncompleted = profile.createdUncompletedTripsCount ?? 0;
        const joinedCompleted = profile.joinedCompletedTripsCount ?? 0;
        const joinedUncompleted = profile.joinedUncompletedTripsCount ?? 0;

        setCreatedCompletedTripsCount(createdCompleted);
        setCreatedUncompletedTripsCount(createdUncompleted);
        setJoinedCompletedTripsCount(joinedCompleted);
        setJoinedUncompletedTripsCount(joinedUncompleted);

        setAvgRating(profile.avgRating || 0);
        setTotalReviews(profile.totalReviews || 0);
        setHasActiveTrips(profile.hasActiveTrips || false);



        authContext?.updateUser({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          avatarUrl: profile.avatarUrl,
        });
      } catch {
        if (currentUser) {
          setFullName(currentUser.fullName);
          setPhoneNumber(currentUser.phoneNumber || '');
          setAvatarUrl(currentUser.avatarUrl || '');
        }
      } finally {
        setIsFetchingProfile(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!currentUser || isFetchingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-medium text-sm">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (
    file: File,
    setLoading: (v: boolean) => void,
    setUrl: (url: string) => void,
  ) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Chỉ chấp nhận định dạng ảnh: JPEG, PNG, WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Kích thước ảnh không được vượt quá ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    try {
      setLoading(true);
      const res = await userApi.uploadFile(file);
      setUrl(res.data.url);
    } catch {
      toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const cleanName = fullName.trim();
    const cleanPhone = phoneNumber.trim();
    const cleanCccd = identityCardNumber.trim();

    if (!cleanName) {
      toast.error('Họ và tên không được để trống.');
      return;
    }

    if (cleanPhone && !VIETNAM_PHONE_REGEX.test(cleanPhone)) {
      toast.error('Số điện thoại không đúng định dạng mạng Việt Nam.');
      return;
    }

    if (cleanCccd && !CCCD_REGEX.test(cleanCccd)) {
      toast.error('Số CCCD phải gồm đúng 12 chữ số.');
      return;
    }

    try {
      setIsSaving(true);
      await userApi.updateProfile({
        fullName: cleanName,
        phoneNumber: cleanPhone || undefined,
        gender: gender || undefined,
        birthDate: birthDate ? `${birthDate}T00:00:00Z` : undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        identityCardFrontUrl: cccdFrontUrl || undefined,
        identityCardBackUrl: cccdBackUrl || undefined,
        identityCardNumber: cleanCccd || undefined,
      });

      authContext?.updateUser({
        fullName: cleanName,
        phoneNumber: cleanPhone || undefined,
        avatarUrl: avatarUrl || undefined,
        identityCardFrontUrl: cccdFrontUrl || undefined,
        identityCardBackUrl: cccdBackUrl || undefined,
      });

      profileDataRef.current = {
        fullName: cleanName,
        phoneNumber: cleanPhone,
        avatarUrl: avatarUrl || '',
        cccdFrontUrl: cccdFrontUrl || '',
        cccdBackUrl: cccdBackUrl || '',
        identityCardNumber: cleanCccd,
        gender: gender || '',
        birthDate: birthDate || '',
        bio: bio.trim(),
      };

      if (isReverificationMode) {
        setHostVerificationStatus(HostVerificationStatus.Pending);
        setIsReverificationMode(false);
        toast.success('Đã cập nhật thông tin mới và gửi lại cho Admin xét duyệt!');
      } else {
        toast.success('Cập nhật hồ sơ thành công!');
      }
      setIsEditing(false);
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors && typeof data.errors === 'object') {
          const messages = Object.values(data.errors).flat().join(' ');
          toast.error(messages || data.message || 'Cập nhật thất bại.');
        } else {
          toast.error(data.message || 'Cập nhật thất bại.');
        }
      } else {
        toast.error('Không thể kết nối đến máy chủ Backend.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const p = profileDataRef.current;
    setFullName(p.fullName);
    setPhoneNumber(p.phoneNumber);
    setAvatarUrl(p.avatarUrl);
    setCccdFrontUrl(p.cccdFrontUrl);
    setCccdBackUrl(p.cccdBackUrl);
    setIdentityCardNumber(p.identityCardNumber);
    setGender(p.gender);
    setBirthDate(p.birthDate);
    setBio(p.bio);
    setIsEditing(false);
    setIsReverificationMode(false);
  };

  const handleRequestVerification = async () => {
    try {
      setIsSubmittingRequest(true);
      await userApi.requestHostVerification();
      setHostVerificationStatus(HostVerificationStatus.Pending);
      toast.success('Gửi yêu cầu duyệt quyền tạo chuyến thành công! Vui lòng chờ Admin xét duyệt.');
    } catch (err: any) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Gửi yêu cầu thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const CccdUploadBox = ({
    label,
    url,
    isUploading,
    inputRef,
    onFileChange,
    onClear,
    disabled = false,
  }: {
    label: string;
    url: string;
    isUploading: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (file: File) => void;
    onClear: () => void;
    disabled?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
          e.target.value = '';
        }}
      />
      {url ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
          <img src={url} alt={label} className="w-full h-full object-cover" />
          {isEditing && !disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white/90 rounded-full text-slate-700 hover:bg-white transition cursor-pointer"
                title="Thay ảnh"
              >
                <ImagePlus size={16} />
              </button>
              <button
                type="button"
                onClick={onClear}
                className="p-2 bg-white/90 rounded-full text-red-500 hover:bg-white transition cursor-pointer"
                title="Xóa ảnh"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-coral-500" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading || !isEditing || disabled}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 size={22} className="animate-spin text-coral-500" />
          ) : (
            <>
              <ImagePlus size={22} />
              <span className="text-xs font-semibold">Nhấn để chọn ảnh</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-6 max-w-3xl mx-auto w-full relative z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-coral-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Profile Card */}
        <div className="p-8 sm:p-10">
          {/* Header Avatar & Summary */}
          <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-slate-100 pb-8">
            <div className="relative shrink-0 group">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, setUploadingAvatar, setAvatarUrl);
                  e.target.value = '';
                }}
              />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-coral-500 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center border-4 border-slate-100 shadow-xs overflow-hidden select-none">
                {(isEditing ? avatarUrl : currentUser.avatarUrl) ? (
                  <img
                    src={isEditing ? avatarUrl : currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (isEditing ? fullName : currentUser.fullName).charAt(0).toUpperCase()
                )}
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-wait"
                  title="Đổi ảnh đại diện"
                >
                  {uploadingAvatar ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </button>
              )}
              <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-3 w-full">
              {isEditing ? (
                <Input
                  label="Họ và Tên *"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                />
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentUser.fullName}</h1>
                  {hostVerificationStatus === HostVerificationStatus.Approved && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={14} className="text-emerald-600" /> Đã duyệt tạo chuyến
                    </span>
                  )}
                  {hostVerificationStatus === HostVerificationStatus.Pending && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock size={14} className="text-amber-600 animate-spin" /> Chờ Admin duyệt
                    </span>
                  )}
                  {hostVerificationStatus === HostVerificationStatus.Rejected && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertCircle size={14} className="text-rose-600" /> Bị từ chối tạo chuyến
                    </span>
                  )}
                  {hostVerificationStatus === HostVerificationStatus.Unverified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                      Chưa đăng ký tạo chuyến
                    </span>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                {isEditing ? (
                  <Input
                    label="Địa chỉ Email"
                    type="email"
                    value={currentUser.email}
                    disabled
                    leftIcon={<Mail size={15} />}
                    helperText="Địa chỉ email không thể chỉnh sửa"
                  />
                ) : (
                  <p className="text-slate-500 text-sm font-medium">{currentUser.email}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1">
                {isEditing ? (
                  <Input
                    label="Số điện thoại"
                    type="text"
                    disabled={isIdentityLocked}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912345678"
                    leftIcon={<Phone size={15} />}
                    helperText={isIdentityLocked ? 'Thông tin đã duyệt chính chủ, bị khóa không thể sửa' : undefined}
                  />
                ) : (
                  <p className="text-slate-500 text-sm font-medium">
                    {phoneNumber || currentUser.phoneNumber || 'Chưa cập nhật số điện thoại'}
                  </p>
                )}
              </div>

              {/* Giới tính & Ngày sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  {isEditing ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                      <Select
                        options={GENDER_OPTIONS}
                        value={gender}
                        onChange={(val) => setGender(val as string)}
                        placeholder="Chọn giới tính"
                        disabled={isIdentityLocked}
                        searchable={false}
                      />
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm font-medium">
                      {gender ? `Giới tính: ${gender}` : 'Chưa cập nhật giới tính'}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  {isEditing ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
                      <DatePicker value={birthDate} onChange={setBirthDate} placeholder="Chọn ngày sinh" disabled={isIdentityLocked} />
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm font-medium">
                      {birthDate ? (() => {
                        const parts = birthDate.split('-');
                        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : birthDate;
                      })() : 'Chưa cập nhật ngày sinh'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="self-start shrink-0 flex flex-col items-stretch sm:items-end gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (hasActiveTrips) return;
                    setIsReverificationMode(false);
                    setIsEditing(true);
                  }}
                  disabled={hasActiveTrips}
                  title={hasActiveTrips ? 'Bạn không thể chỉnh sửa hồ sơ khi đang tạo hoặc tham gia chuyến đi đang hoạt động' : undefined}
                  className="font-bold text-xs"
                >
                  {hasActiveTrips && <Lock size={13} className="text-slate-400 mr-1" />}
                  Chỉnh sửa hồ sơ
                </Button>

                {isApproved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (hasActiveTrips) return;
                      setShowReverifyConfirmModal(true);
                    }}
                    disabled={hasActiveTrips}
                    leftIcon={hasActiveTrips ? <Lock size={13} className="text-slate-400 shrink-0" /> : <RefreshCw size={14} className="text-amber-600 shrink-0" />}
                    title={hasActiveTrips ? 'Bạn không thể yêu cầu cập nhật khi đang tạo hoặc tham gia chuyến đi đang hoạt động' : undefined}
                    className="border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100/70 font-bold text-xs"
                  >
                    Yêu cầu cập nhật lại thông tin xác thực
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cảnh báo khi có chuyến đi hoạt động */}
        {hasActiveTrips && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1">
            <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <Lock size={16} className="text-amber-600 shrink-0" />
              Hồ sơ đang tạm khóa chỉnh sửa
            </p>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Bạn đang tạo hoặc tham gia vào chuyến đi đang hoạt động. Để đảm bảo an toàn & minh bạch cho tất cả thành viên trong đoàn, thông tin cá nhân và CCCD của bạn sẽ tạm thời không thể thay đổi cho đến khi các chuyến đi kết thúc hoặc bị hủy.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 border-b border-slate-100 pb-8 pt-6 text-center">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đánh giá</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-base font-black text-slate-900">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</span>
              <Star size={14} className="text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="space-y-1 border-x border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lượt Đánh Giá</p>
            <p className="text-base font-black text-slate-900">{totalReviews}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuyến đi đã tạo</p>
            <p className="text-base font-black text-slate-900">
              {createdUncompletedTripsCount > 0
                ? `${createdCompletedTripsCount + createdUncompletedTripsCount}`
                : createdCompletedTripsCount}
            </p>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuyến đi đã tham gia</p>
            <p className="text-base font-black text-slate-900">
              {joinedUncompletedTripsCount > 0
                ? `${joinedCompletedTripsCount + joinedUncompletedTripsCount}`
                : joinedCompletedTripsCount}
            </p>
          </div>
        </div>


        {/* Details & CCCD */}
        <div className="space-y-6 pt-8">
          {isEditing && isIdentityLocked && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-left text-xs font-semibold text-sky-900 flex items-start gap-2">
              <Lock size={16} className="text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sky-950">Hồ sơ đã phê duyệt Host — Thông tin xác minh bị khóa Read-Only</p>
                <p className="text-[11px] text-sky-700 font-medium mt-0.5">
                  Các trường SĐT, Ngày sinh, CCCD đã được duyệt chính chủ. Bạn chỉ có thể sửa Họ tên & Bio. Để sửa thông tin xác thực, vui lòng dùng nút <span className="font-bold">"Yêu cầu cập nhật lại thông tin xác thực"</span>.
                </p>
              </div>
            </div>
          )}

          {isEditing && isReverificationMode && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs font-semibold text-amber-900 flex items-start gap-2">
              <RefreshCw size={16} className="text-amber-600 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-bold text-amber-950">Chế độ cập nhật lại thông tin xác thực (Cần Admin duyệt lại)</p>
                <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                  Sau khi bấm <span className="font-bold">Lưu thay đổi</span>, thông tin mới của bạn sẽ được lưu và quyền Host sẽ tạm thời chuyển sang trạng thái <span className="font-bold">Chờ duyệt (Pending)</span> để Admin xác minh lại.
                </p>
              </div>
            </div>
          )}

          {/* CCCD Section */}
          <div className="text-left space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Xác minh danh tính (CCCD)
            </h3>

            <div className="space-y-1">
              {isEditing ? (
                <Input
                  label="Số CCCD (12 chữ số)"
                  type="text"
                  disabled={isIdentityLocked}
                  value={identityCardNumber}
                  onChange={(e) => setIdentityCardNumber(e.target.value)}
                  maxLength={12}
                  placeholder="012345678901"
                  leftIcon={<CreditCard size={15} />}
                />
              ) : (
                <p className="text-slate-500 text-sm font-medium">
                  {identityCardNumber ? `Số CCCD: ${identityCardNumber}` : 'Chưa cập nhật số CCCD'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <CccdUploadBox
                label="Mặt trước CCCD"
                url={cccdFrontUrl}
                isUploading={uploadingFront}
                inputRef={cccdFrontInputRef}
                onFileChange={(file) => handleFileUpload(file, setUploadingFront, setCccdFrontUrl)}
                onClear={() => setCccdFrontUrl('')}
                disabled={isIdentityLocked}
              />
              <CccdUploadBox
                label="Mặt sau CCCD"
                url={cccdBackUrl}
                isUploading={uploadingBack}
                inputRef={cccdBackInputRef}
                onFileChange={(file) => handleFileUpload(file, setUploadingBack, setCccdBackUrl)}
                onClear={() => setCccdBackUrl('')}
                disabled={isIdentityLocked}
              />
            </div>

            {/* Rejection Alert */}
            {hostVerificationStatus === HostVerificationStatus.Rejected && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-left space-y-1">
                <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-rose-600" />
                  Yêu cầu duyệt quyền tạo chuyến của bạn đã bị từ chối
                </p>
                <p className="text-xs text-rose-700 font-medium">
                  Lý do từ chối: <span className="font-bold text-rose-900">{hostRejectReason || currentUser?.hostRejectReason || 'Hồ sơ chưa đạt đủ yêu cầu xét duyệt.'}</span>
                </p>
              </div>
            )}

            {/* Blocked Alert */}
            {hostVerificationStatus === HostVerificationStatus.Blocked && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-100 border border-rose-300 text-left space-y-1">
                <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-rose-600" />
                  Quyền tạo chuyến đi của bạn đã bị khóa bởi Quản trị viên
                </p>
                <p className="text-xs text-rose-800 font-medium">
                  Trạng thái: <span className="font-bold text-rose-950">Bị khóa vĩnh viễn (Bạn không thể gửi lại yêu cầu duyệt)</span>
                </p>
              </div>
            )}

            {/* Request Host Button */}
            {!isEditing && (hostVerificationStatus === HostVerificationStatus.Unverified || hostVerificationStatus === HostVerificationStatus.Rejected) && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Send size={14} className="text-amber-600" />
                    Đăng ký quyền Tổ chức / Tạo chuyến đi (Organizer)
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                    Yêu cầu cập nhật đủ 7 thông tin: Họ tên, Ngày sinh, Giới tính, SĐT, Số CCCD, Ảnh CCCD mặt trước & mặt sau.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={handleRequestVerification}
                  isLoading={isSubmittingRequest}
                  className="w-full sm:w-auto shrink-0 font-bold text-xs px-4 py-2 cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Send size={14} /> Gửi yêu cầu duyệt
                </Button>
              </div>
            )}
          </div>

          {/* Bio Section */}
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlignLeft size={14} /> Tiểu sử cá nhân
            </h3>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-semibold resize-none leading-relaxed"
                placeholder="Giới thiệu bản thân..."
              />
            ) : (
              <p className="text-sm text-slate-600 font-normal leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">{bio}</p>
            )}
          </div>

          {/* Action Bar */}
          {isEditing && (
            <div className="pt-4 flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="font-bold text-xs px-4 py-2 border-slate-300 text-slate-700"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={isSaving}
                className="font-bold text-xs px-5 py-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                Lưu thay đổi
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Reverification Modal */}
      {showReverifyConfirmModal && (
        <Modal
          isOpen
          onClose={() => setShowReverifyConfirmModal(false)}
          title="Xác nhận yêu cầu cập nhật lại thông tin"
          maxWidth="md"
        >
          <div className="space-y-4 text-left">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-2">
              <p className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                Lưu ý quan trọng trước khi mở sửa thông tin xác thực:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                <li>Tài khoản của bạn đã được duyệt chính chủ trước đó.</li>
                <li>Khi mở sửa và bấm <strong>Lưu thay đổi</strong>, trạng thái duyệt Host sẽ tạm dừng và chuyển sang <strong>Chờ duyệt (Pending)</strong>.</li>
                <li>Bạn sẽ tạm thời không thể tạo chuyến đi mới cho đến khi Admin phê duyệt lại thông tin mới.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-600 font-semibold">
              Bạn có chắc chắn muốn mở chỉnh sửa thông tin xác thực (SĐT, Ngày sinh, CCCD) không?
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReverifyConfirmModal(false)}
                className="px-4 py-2 border-slate-300 text-slate-700 font-semibold"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={() => {
                  setShowReverifyConfirmModal(false);
                  setIsReverificationMode(true);
                  setIsEditing(true);
                  toast.info('Đã mở chỉnh sửa thông tin xác thực. Hãy bấm Lưu thay đổi sau khi cập nhật xong.');
                }}
                className="px-4 py-2 font-semibold"
              >
                Đồng ý & Mở chỉnh sửa
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ScrollToTop />
    </div>
  );
};

export default ProfilePage;
