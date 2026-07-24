import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { DatePicker } from '../../components/common/DatePicker';
import { Modal } from '../../components/common/Modal';
import { HostVerificationStatus } from '../../types/auth';
import {
  ShieldCheck, Star, Award,
  AlignLeft, Camera, Loader2, ImagePlus, X, Phone, UserCheck, ChevronDown, Check, CreditCard, Clock, AlertCircle, Send, RefreshCw, Lock
} from 'lucide-react';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

// Custom Gender Select Dropdown Component
const GenderSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = ['Nam', 'Nữ', 'Khác'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border rounded-xl pl-10 pr-9 py-2.5 text-sm transition-all font-semibold text-left flex items-center justify-between ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 cursor-pointer'
        }`}
      >
        <span className={value ? (disabled ? 'text-slate-500 font-semibold' : 'text-slate-900 font-semibold') : 'text-slate-400'}>
          {value || 'Chọn giới tính'}
        </span>
        {!disabled && <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      <UserCheck size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-900/[0.08] z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${value === opt ? 'bg-coral-50 text-coral-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span>{opt}</span>
              {value === opt && <Check size={14} className="text-coral-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};



const ProfilePage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Refs cho file inputs ẩn
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cccdFrontInputRef = useRef<HTMLInputElement>(null);
  const cccdBackInputRef = useRef<HTMLInputElement>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isReverificationMode, setIsReverificationMode] = useState(false);
  const [showReverifyConfirmModal, setShowReverifyConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Lưu trữ dữ liệu profile gốc tải từ Backend để khi bấm Hủy sẽ khôi phục chính xác 100%
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

  // Form fields state
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

  // Profile Stats from DB
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);

  // Upload loading state per field
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Route Guard: nếu chưa đăng nhập hoặc đăng xuất thì về Trang chủ
  useEffect(() => {
    if (authContext && !authContext.isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authContext, isAuthenticated, navigate]);

  // Fetch hồ sơ đầy đủ từ DB khi trang load (để lấy bio và các trường mới nhất)
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
        setAvgRating(profile.avgRating || 0);
        setTotalReviews(profile.totalReviews || 0);
        setTotalTrips(profile.totalTrips || 0);

        // Đồng bộ dữ liệu mới nhất từ DB vào AuthContext & LocalStorage
        authContext?.updateUser({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          avatarUrl: profile.avatarUrl,
        });
      } catch {
        // Fallback to local state nếu API lỗi
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

  // Validate và upload 1 file ảnh lên server
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
    if (!fullName.trim()) {
      toast.error('Họ tên không được để trống.');
      return;
    }

    try {
      setIsSaving(true);
      await userApi.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender || undefined,
        birthDate: birthDate ? `${birthDate}T00:00:00Z` : undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        identityCardFrontUrl: cccdFrontUrl || undefined,
        identityCardBackUrl: cccdBackUrl || undefined,
        identityCardNumber: identityCardNumber.trim() || undefined,
      });

      // Cập nhật lại state cục bộ trong AuthContext
      authContext?.updateUser({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        identityCardFrontUrl: cccdFrontUrl || undefined,
        identityCardBackUrl: cccdBackUrl || undefined,
      });

      // Cập nhật lại cache dữ liệu gốc
      profileDataRef.current = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        avatarUrl: avatarUrl || '',
        cccdFrontUrl: cccdFrontUrl || '',
        cccdBackUrl: cccdBackUrl || '',
        identityCardNumber: identityCardNumber.trim(),
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

  // Component hiển thị ô upload ảnh CCCD
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
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white/90 rounded-full text-slate-700 hover:bg-white transition cursor-pointer"
                title="Thay ảnh"
              >
                <ImagePlus size={16} />
              </button>
              <button
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

          {/* ─── Header: Avatar + Details + Edit Button ─── */}
          <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-slate-100 pb-8">

            {/* Avatar with edit overlay */}
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-coral-500 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center border-4 border-slate-100 shadow-sm overflow-hidden select-none">
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

              {/* Camera overlay – chỉ hiển thị khi đang edit */}
              {isEditing && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-wait"
                  title="Đổi ảnh đại diện"
                >
                  {uploadingAvatar
                    ? <Loader2 size={20} className="text-white animate-spin" />
                    : <Camera size={20} className="text-white" />
                  }
                </button>
              )}
              {/* Online dot */}
              <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
            </div>

            {/* Identity info */}
            <div className="flex-1 space-y-3 w-full">
              {/* Họ và Tên */}
              {isEditing ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Họ và Tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-semibold"
                    placeholder="Nhập họ và tên..."
                  />
                </div>
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

              {/* Email (Hàng riêng) */}
              <div className="space-y-1">
                {isEditing && (
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email</label>
                )}
                <div className={isEditing
                  ? 'w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 font-semibold flex items-center gap-2 select-none cursor-not-allowed'
                  : 'text-slate-500 text-sm font-medium'
                }>
                  <span>{currentUser.email}</span>
                  {isEditing && <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">Không thể sửa</span>}
                </div>
              </div>

              {/* Số điện thoại (Hàng riêng) */}
              <div className="space-y-1">
                {isEditing && (
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Số điện thoại</span>
                    {isIdentityLocked && <span className="text-[10px] text-sky-700 font-bold flex items-center gap-1"><Lock size={11} /> Đã duyệt (Đã khóa)</span>}
                  </label>
                )}
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isIdentityLocked}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={isIdentityLocked
                        ? 'w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-500 font-semibold cursor-not-allowed select-none'
                        : 'w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-semibold'
                      }
                      placeholder="0912345678"
                    />
                    <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm font-medium">
                    {phoneNumber || currentUser.phoneNumber || 'Chưa cập nhật số điện thoại'}
                  </p>
                )}
              </div>

              {/* Giới tính & Ngày sinh (Hàng 2 Cột) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Giới tính */}
                <div className="space-y-1">
                  {isEditing && (
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Giới tính</label>
                  )}
                  {isEditing ? (
                    <GenderSelect value={gender} onChange={setGender} disabled={isIdentityLocked} />
                  ) : (
                    <p className="text-slate-500 text-sm font-medium">
                      {gender ? `Giới tính: ${gender}` : 'Chưa cập nhật giới tính'}
                    </p>
                  )}
                </div>

                {/* Ngày sinh */}
                <div className="space-y-1">
                  {isEditing && (
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ngày sinh</label>
                  )}
                  {isEditing ? (
                    <DatePicker value={birthDate} onChange={setBirthDate} placeholder="Chọn ngày sinh" disabled={isIdentityLocked} />
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

            {/* Action buttons ở góc trên khi xem */}
            {!isEditing && (
              <div className="self-start shrink-0 flex flex-col items-stretch sm:items-end gap-2.5">
                <Button
                  onClick={() => {
                    setIsReverificationMode(false);
                    setIsEditing(true);
                  }}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Chỉnh sửa hồ sơ
                </Button>

                {isApproved && (
                  <Button
                    onClick={() => setShowReverifyConfirmModal(true)}
                    variant="outline"
                    leftIcon={<RefreshCw size={14} className="text-amber-600 shrink-0" />}
                    className="border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100/70 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Yêu cầu cập nhật lại thông tin xác thực
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Quick Stats ─── */}
        <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-8 pt-6 text-center">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đánh giá</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-base font-black text-slate-900">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</span>
              <Star size={14} className="text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="space-y-1 border-x border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lượt Review</p>
            <p className="text-base font-black text-slate-900">{totalReviews}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuyến đi</p>
            <p className="text-base font-black text-slate-900">{totalTrips}</p>
          </div>
        </div>

        {/* ─── Profile Details ─── */}
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

          {/* ─── CCCD Section ─── */}
          <div className="text-left space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Xác minh danh tính (CCCD)
            </h3>

            {/* Ô nhập/hiển thị Số CCCD */}
            <div className="space-y-1">
              {isEditing && (
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Số CCCD</label>
              )}
              {isEditing ? (
                <div className="relative">
                  <input
                    type="text"
                    disabled={isIdentityLocked}
                    value={identityCardNumber}
                    onChange={(e) => setIdentityCardNumber(e.target.value)}
                    maxLength={12}
                    className={isIdentityLocked
                      ? 'w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-500 font-semibold cursor-not-allowed select-none'
                      : 'w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-semibold'
                    }
                    placeholder="012345678901"
                  />
                  <CreditCard size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
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
            {!isEditing && !cccdFrontUrl && !cccdBackUrl && !identityCardNumber && (
              <p className="text-xs text-slate-400 mt-2 italic">Chưa cung cấp thông tin CCCD. Nhấn chỉnh sửa hồ sơ để thêm.</p>
            )}

            {/* Cảnh báo lý do bị từ chối khi HostVerificationStatus === Rejected */}
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

            {/* Cảnh báo khi bị khóa quyền tạo chuyến vĩnh viễn (HostVerificationStatus === Blocked) */}
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

            {/* Nút gửi yêu cầu duyệt tạo chuyến khi không trong chế độ chỉnh sửa */}
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
                  onClick={handleRequestVerification}
                  isLoading={isSubmittingRequest}
                  className="w-full sm:w-auto shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Send size={14} /> Gửi yêu cầu duyệt
                </Button>
              </div>
            )}
          </div>

          {/* Tiểu sử */}
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
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-medium resize-none leading-relaxed"
                placeholder="Giới thiệu bản thân..."
              />
            ) : (
              <p className="text-sm text-slate-600 font-normal leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">{bio}</p>
            )}
          </div>

          {/* Action Bar ngay bên dưới phần tiểu sử cá nhân khi chỉnh sửa */}
          {isEditing && (
            <div className="pt-4 flex items-center justify-end gap-3">
              <Button
                onClick={handleCancel}
                disabled={isSaving}
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {isSaving && <Loader2 size={15} className="animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          )}

          {/* Vai trò + Danh hiệu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vai trò tài khoản</h3>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-teal-50/50 border border-teal-100">
                <ShieldCheck size={18} className="text-teal-600" />
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
                    {currentUser.role === 'Admin' ? 'Quản trị viên' : 'Thành viên'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Xác thực chính chủ bởi hệ thống TripMate</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Danh hiệu đạt được</h3>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                <Award size={18} className="text-amber-600" />
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Thành viên tích cực</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hoàn thành hơn 5 chuyến đi xuất sắc</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Xác nhận cập nhật thông tin xác thực */}
      {showReverifyConfirmModal && (
        <Modal
          isOpen
          onClose={() => setShowReverifyConfirmModal(false)}
          title="Xác nhận cập nhật thông tin xác thực"
          maxWidth="md"
        >
          <div className="space-y-4 text-slate-700 text-sm font-medium">
            <p className="leading-relaxed">
              Khi cập nhật lại thông tin xác thực mới (Số điện thoại, Số CCCD, Ảnh CCCD...), quyền tạo chuyến của bạn sẽ được <span className="font-bold text-amber-700">tạm chuyển về trạng thái Chờ duyệt (Pending)</span> để Admin xét duyệt lại bộ hồ sơ mới.
            </p>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
              ⚠️ Bạn có đồng ý mở khóa thông tin xác thực để chỉnh sửa không?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowReverifyConfirmModal(false)}
                className="text-xs font-bold px-4 py-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={() => {
                  setShowReverifyConfirmModal(false);
                  setIsReverificationMode(true);
                  setIsEditing(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
              >
                Đồng ý & Mở khóa
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
