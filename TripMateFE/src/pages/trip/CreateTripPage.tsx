import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Select, type SelectOption } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import { locationApi } from '../../api/locationApi';
import { tripCategoryApi } from '../../api/tripCategoryApi';
import { userApi } from '../../api/userApi';
import type { Country, City } from '../../types/location';
import type { TripCategory } from '../../types/tripCategory';
import type { CreateTripRequest } from '../../types/trip';
import { HostVerificationStatus } from '../../types/auth';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Info,
  ImagePlus,
  Loader2,
  Sparkles,
  ShieldAlert,
  X,
  UploadCloud,
  FileText,
  Eye
} from 'lucide-react';

export const CreateTripPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();
  const { toast } = useToast();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Categories & Location Master Data
  const [categories, setCategories] = useState<TripCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Start location & country/city
  const [startLocation, setStartLocation] = useState('');
  const [startCountryId, setStartCountryId] = useState('');
  const [startCityId, setStartCityId] = useState('');

  // Destination & country/city
  const [destination, setDestination] = useState('');
  const [destinationCountryId, setDestinationCountryId] = useState('');
  const [destinationCityId, setDestinationCityId] = useState('');

  // Dates & Description
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  // Cost & Members & Others
  const [maxMembers, setMaxMembers] = useState<number>(5);
  const [estimatedCost, setEstimatedCost] = useState<string>('');
  const [costNote, setCostNote] = useState('');
  const [requirements, setRequirements] = useState('');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Preview Image Modal state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Submitting & Uploading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // 1. Route Guard & Host Verification Check
  useEffect(() => {
    if (authContext && !authContext.isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const initData = async () => {
      try {
        setIsLoadingMasterData(true);
        // Check permissions
        const profileRes = await userApi.getProfile();
        const hostStatus = profileRes.data.hostVerificationStatus;
        if (hostStatus !== HostVerificationStatus.Approved) {
          toast.error('Bạn chưa được phê duyệt quyền Tạo chuyến. Vui lòng kiểm tra lại tài khoản.');
          navigate('/profile');
          return;
        }

        // Fetch categories, countries & active cities
        const [catsRes, countriesRes, citiesRes] = await Promise.all([
          tripCategoryApi.getCategories(true).catch(() => []),
          locationApi.getCountries().catch(() => []),
          locationApi.getCities().catch(() => []),
        ]);

        setCategories(catsRes || []);
        setCountries((countriesRes || []).filter((c) => c.isActive !== false));
        setCities((citiesRes || []).filter((c) => c.isActive !== false));
      } catch (err: any) {
        toast.error('Không thể tải dữ liệu cấu hình chuyến đi.');
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    if (isAuthenticated) {
      initData();
    }
  }, [isAuthenticated, authContext, navigate]);

  // Handle Cover Image Upload
  const handleCoverUpload = async (file: File) => {
    try {
      setUploadingCover(true);
      const res = await userApi.uploadFile(file);
      setCoverImageUrl(res.data.url);
      toast.success('Đã tải ảnh bìa lên thành công!');
    } catch {
      toast.error('Tải ảnh bìa thất bại.');
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Gallery Upload
  const handleGalleryUpload = async (file: File) => {
    try {
      setUploadingGallery(true);
      const res = await userApi.uploadFile(file);
      setImageUrls((prev) => [...prev, res.data.url]);
      toast.success('Đã thêm 1 ảnh vào bộ sưu tập!');
    } catch {
      toast.error('Tải ảnh thất bại.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Submit Form với Validate 100% tất cả các trường bắt buộc
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề chuyến đi.');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn loại hình chuyến đi.');
      return;
    }
    if (!startLocation.trim()) {
      toast.error('Vui lòng nhập địa điểm khởi hành cụ thể.');
      return;
    }
    if (!startCountryId) {
      toast.error('Vui lòng chọn Quốc gia khởi hành.');
      return;
    }
    if (!startCityId) {
      toast.error('Vui lòng chọn Thành phố / Tỉnh khởi hành.');
      return;
    }
    if (!destination.trim()) {
      toast.error('Vui lòng nhập địa điểm đến chính cụ thể.');
      return;
    }
    if (!destinationCountryId) {
      toast.error('Vui lòng chọn Quốc gia điểm đến.');
      return;
    }
    if (!destinationCityId) {
      toast.error('Vui lòng chọn Thành phố / Tỉnh điểm đến.');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả & kế hoạch chi tiết chuyến đi.');
      return;
    }
    if (!startDate) {
      toast.error('Vui lòng chọn ngày khởi hành.');
      return;
    }
    if (!endDate) {
      toast.error('Vui lòng chọn ngày kết thúc.');
      return;
    }
    if (!coverImageUrl) {
      toast.error('Vui lòng tải lên Ảnh bìa chính cho chuyến đi.');
      return;
    }
    if (!estimatedCost || isNaN(Number(estimatedCost)) || Number(estimatedCost) < 0) {
      toast.error('Vui lòng nhập chi phí ước tính hợp lệ.');
      return;
    }
    if (!costNote.trim()) {
      toast.error('Vui lòng nhập ghi chú chi phí.');
      return;
    }

    // Validate 7 days in advance for StartDate
    const start = new Date(startDate);
    const minAllowedStart = new Date();
    minAllowedStart.setDate(minAllowedStart.getDate() + 6); // ít nhất 7 ngày
    if (start < minAllowedStart) {
      toast.error('Ngày khởi hành phải cách thời điểm hiện tại ít nhất 7 ngày để chuẩn bị và duyệt chuyến.');
      return;
    }

    if (new Date(endDate) < start) {
      toast.error('Ngày kết thúc phải trùng hoặc sau ngày khởi hành.');
      return;
    }

    if (minAge && maxAge && Number(maxAge) < Number(minAge)) {
      toast.error('Độ tuổi tối đa phải lớn hơn hoặc bằng độ tuổi tối thiểu.');
      return;
    }

    try {
      setIsSubmitting(true);
      const req: CreateTripRequest = {
        title: title.trim(),
        categoryId,
        startLocation: startLocation.trim(),
        startCountryId,
        startCityId,
        destination: destination.trim(),
        destinationCountryId,
        destinationCityId,
        startDate: `${startDate}T00:00:00Z`,
        endDate: `${endDate}T23:59:59Z`,
        maxMembers: Number(maxMembers) || 5,
        estimatedCost: Number(estimatedCost),
        costNote: costNote.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        coverImageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await tripApi.createTrip(req);
      toast.success('Tạo chuyến đi mới thành công! Chuyến đi đang chờ Admin phê duyệt.');
      navigate('/my-trips');
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors && typeof data.errors === 'object') {
          const messages = Object.values(data.errors).flat().join(' ');
          toast.error(messages || data.message || 'Tạo chuyến đi thất bại.');
        } else {
          toast.error(data.message || 'Tạo chuyến đi thất bại.');
        }
      } else {
        toast.error('Không thể kết nối đến hệ thống server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions: SelectOption[] = [
    { label: '-- Chọn loại hình chuyến đi --', value: '' },
    ...categories.map((cat) => ({
      label: `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`,
      value: cat.id,
    })),
  ];

  const countryOptions: SelectOption[] = [
    { label: '-- Chọn Quốc gia --', value: '' },
    ...countries.map((c) => ({
      label: `${c.flagIcon ? c.flagIcon + ' ' : ''}${c.name}`,
      value: c.id,
    })),
  ];

  // Options Thành phố dựa trên Quốc gia chọn
  const getCityOptionsForCountry = (countryId: string): SelectOption[] => {
    if (!countryId) {
      return [{ label: '-- Vui lòng chọn Quốc gia trước --', value: '' }];
    }
    const filteredCities = cities.filter((ct) => ct.countryId === countryId);
    return [
      { label: '-- Chọn Thành phố / Tỉnh --', value: '' },
      ...filteredCities.map((ct) => ({
        label: ct.name,
        value: ct.id,
      })),
    ];
  };

  if (isLoadingMasterData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-medium text-sm">Đang nạp cấu hình chuyến đi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      {/* Container mở rộng rộng rãi tràn đều 2 bên (max-w-[1400px]) */}
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1400px] mx-auto w-full">
        {/* Header Title Seamless */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-4 sm:p-6 rounded-3xl">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              Tạo chuyến đi mới <Sparkles size={24} className="text-coral-500 fill-coral-500/20" />
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Đăng tin tuyển thành viên đồng hành cho hành trình tuyệt vời sắp tới của bạn.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-100/80 p-3 rounded-2xl">
            <ShieldAlert size={20} className="text-coral-500 shrink-0" />
            <div className="text-[11px] text-slate-600 font-semibold">
              <p className="text-slate-800 font-bold">Xác thực quyền Host: Đã phê duyệt</p>
              <p className="text-slate-400">Chuyến đi sẽ được duyệt trong vòng 24h sau khi gửi.</p>
            </div>
          </div>
        </div>

        {/* Form Tạo Chuyến Đi */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* CỘT TRÁI (MAIN FORM - 7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box 1: Thông tin cơ bản */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800">
                  <Info size={18} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                </span>
                <span className="text-[11px] font-bold text-coral-600 bg-coral-50 px-2.5 py-0.5 rounded-full">
                  Bước 1/2
                </span>
              </h2>

              {/* Hàng 1: Tiêu đề chuyến đi & Loại hình chuyến đi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tiêu đề chuyến đi <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Phượt Hà Giang 3N2Đ..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Loại hình chuyến đi <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    options={categoryOptions}
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
                  />
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
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Địa điểm cụ thể <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      placeholder="VD: Bến xe Mỹ Đình..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Quốc gia <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        options={countryOptions}
                        value={startCountryId}
                        onChange={(val) => {
                          setStartCountryId(val);
                          setStartCityId('');
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Thành phố / Tỉnh <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        options={getCityOptionsForCountry(startCountryId)}
                        value={startCityId}
                        onChange={(val) => setStartCityId(val)}
                      />
                    </div>
                  </div>
                </div>

                {/* Điểm đến */}
                <div className="space-y-3.5 p-5 rounded-2xl bg-white">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    <MapPin size={16} className="text-coral-500" /> Điểm đến chính
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Địa điểm cụ thể <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="VD: Cột cờ Lũng Cú..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Quốc gia <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        options={countryOptions}
                        value={destinationCountryId}
                        onChange={(val) => {
                          setDestinationCountryId(val);
                          setDestinationCityId('');
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Thành phố / Tỉnh <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        options={getCityOptionsForCountry(destinationCountryId)}
                        value={destinationCityId}
                        onChange={(val) => setDestinationCityId(val)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mô tả chuyến đi */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText size={15} className="text-slate-500" /> Mô tả & Kế hoạch chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Viết mô tả lịch trình dự kiến từng ngày, điểm lưu trú, phương tiện di chuyển..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Box 2: Thời gian chuyến đi */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <Calendar size={18} className="text-coral-500" /> 2. Thời gian chuyến đi
              </h2>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs font-medium text-amber-900 flex items-start gap-2.5">
                <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Lưu ý nghiệp vụ: Ngày khởi hành phải cách thời điểm tạo <strong>ít nhất 7 ngày</strong> để hệ thống kiểm duyệt và người tham gia chuẩn bị.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày khởi hành <span className="text-rose-500">*</span>
                  </label>
                  <DatePicker value={startDate} onChange={setStartDate} placeholder="Chọn ngày bắt đầu" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <DatePicker value={endDate} onChange={setEndDate} placeholder="Chọn ngày kết thúc" />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (SIDEBAR FORM - 5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box 3: Ảnh bìa & Bộ sưu tập */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <ImagePlus size={18} className="text-coral-500" /> Ảnh bìa & Hình ảnh
              </h2>

              {/* Upload Ảnh Bìa */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCoverUpload(f);
                  e.target.value = '';
                }}
              />
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Ảnh bìa chính <span className="text-rose-500">*</span>
                </label>
                {coverImageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-white cursor-pointer shadow-xs">
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      onClick={() => setPreviewImageUrl(coverImageUrl)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImageUrl(coverImageUrl);
                        }}
                        className="p-2.5 bg-white/90 rounded-full text-slate-700 hover:bg-white cursor-pointer shadow-xs"
                        title="Xem ảnh phóng to"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          coverInputRef.current?.click();
                        }}
                        className="p-2.5 bg-white/90 rounded-full text-slate-700 hover:bg-white cursor-pointer shadow-xs"
                        title="Đổi ảnh"
                      >
                        <UploadCloud size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverImageUrl('');
                        }}
                        className="p-2.5 bg-white/90 rounded-full text-rose-500 hover:bg-white cursor-pointer shadow-xs"
                        title="Xóa ảnh"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                  >
                    {uploadingCover ? (
                      <Loader2 size={24} className="animate-spin text-coral-500" />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <UploadCloud size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Tải ảnh bìa chính *</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Upload Bộ sưu tập ảnh */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleGalleryUpload(f);
                  e.target.value = '';
                }}
              />
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Bộ sưu tập ảnh ({imageUrls.length})</label>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingGallery}
                    className="text-xs font-bold text-coral-600 hover:text-coral-700 cursor-pointer flex items-center gap-1"
                  >
                    {uploadingGallery ? <Loader2 size={13} className="animate-spin" /> : '+ Thêm ảnh'}
                  </button>
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white cursor-pointer">
                        <img
                          src={url}
                          alt={`Gallery ${idx}`}
                          onClick={() => setPreviewImageUrl(url)}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImageUrl(url);
                            }}
                            className="p-1.5 bg-white/90 rounded-full text-slate-700 hover:bg-white cursor-pointer"
                            title="Xem ảnh"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(idx);
                            }}
                            className="p-1.5 bg-white/90 rounded-full text-rose-500 hover:bg-white cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Box 4: Chi phí & Thành viên */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-4 font-sans">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                <DollarSign size={18} className="text-coral-500" /> Chi phí & Thành viên
              </h2>

              {/* Chi phí ước tính */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chi phí ước tính / người (VND) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="VD: 2500000"
                />
              </div>

              {/* Ghi chú chi phí */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ghi chú chi phí <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={costNote}
                  onChange={(e) => setCostNote(e.target.value)}
                  placeholder="VD: Chi phí gồm xe khách, nhà sàn, ăn uống..."
                />
              </div>

              {/* Số lượng thành viên tối đa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số lượng thành viên tối đa <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  rightIcon={<Users size={18} className="text-slate-400 shrink-0" />}
                />
              </div>

              {/* Giới hạn độ tuổi */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Yêu cầu độ tuổi (Nếu có)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Min (VD: 18)"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Max (VD: 40)"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                  />
                </div>
              </div>

              {/* Yêu cầu khác đối với thành viên */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Yêu cầu khác đối với thành viên</label>
                <textarea
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="VD: Cần có sức khỏe tốt, chủ động phương tiện xe máy..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition resize-none"
                />
              </div>
            </div>

            {/* Nút Submit Form */}
            <div className="pt-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-coral-500 hover:bg-coral-600 text-white font-black text-xs py-4 rounded-2xl cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Đang tạo chuyến đi...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Hoàn tất & Gửi duyệt chuyến đi
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>

      {/* Modal Xem Ảnh Phóng To (Image Preview Modal) */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer z-10"
            >
              <X size={20} />
            </button>
            <img
              src={previewImageUrl}
              alt="Preview Fullsize"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
};

export default CreateTripPage;
