import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Select, type SelectOption } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import Image from '../../components/common/Image';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import { locationApi } from '../../api/locationApi';
import { tripCategoryApi } from '../../api/tripCategoryApi';
import type { Country, City } from '../../types/location';
import type { TripCategory } from '../../types/tripCategory';
import type { Trip, CreateTripRequest } from '../../types/trip';
import { TripStatus } from '../../types/trip';
import { CreateTripSkeleton } from '../../components/skeleton/CreateTripSkeleton';
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
  Save,
} from 'lucide-react';

export const EditTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  // Submitting & Uploading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // 1. Fetch Master Data & Pre-fill Trip Detail
  useEffect(() => {
    if (authContext && !authContext.isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const initData = async () => {
      if (!id) return;
      try {
        setIsLoadingMasterData(true);

        // Fetch categories, countries & active cities
        const [catsRes, countriesRes, citiesRes] = await Promise.all([
          tripCategoryApi.getCategories(true).catch(() => []),
          locationApi.getCountries().catch(() => []),
          locationApi.getCities().catch(() => []),
        ]);

        setCategories(catsRes || []);
        setCountries((countriesRes || []).filter((c) => c.isActive !== false));
        setCities((citiesRes || []).filter((c) => c.isActive !== false));

        // Fetch Trip Detail to Pre-fill
        const tripData: Trip = await tripApi.getTripById(id);

        if (tripData.status !== TripStatus.PendingReview) {
          toast.error('Chỉ có thể chỉnh sửa chuyến đi khi đang ở trạng thái Chờ duyệt.');
          navigate('/my-trips');
          return;
        }

        // Fill Form Data
        setTitle(tripData.title || '');
        setCategoryId(tripData.categoryId || '');
        setStartLocation(tripData.startLocation || '');
        setStartCountryId(tripData.startCountryId || '');
        setStartCityId(tripData.startCityId || '');
        setDestination(tripData.destination || '');
        setDestinationCountryId(tripData.destinationCountryId || '');
        setDestinationCityId(tripData.destinationCityId || '');
        setStartDate(tripData.startDate ? tripData.startDate.substring(0, 10) : '');
        setEndDate(tripData.endDate ? tripData.endDate.substring(0, 10) : '');
        setDescription(tripData.description || '');
        setCoverImageUrl(tripData.coverImageUrl || '');
        setImageUrls(tripData.imageUrls || []);
        setEstimatedCost(tripData.estimatedCost !== undefined && tripData.estimatedCost !== null ? String(tripData.estimatedCost) : '');
        setCostNote(tripData.costNote || '');
        setMaxMembers(tripData.maxMembers || 5);
        setMinAge(tripData.minAge ? String(tripData.minAge) : '');
        setMaxAge(tripData.maxAge ? String(tripData.maxAge) : '');
        setRequirements(tripData.requirements || '');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Không thể lấy thông tin chuyến đi.');
        navigate('/my-trips');
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    if (isAuthenticated) {
      initData();
    }
  }, [id, isAuthenticated, authContext, navigate]);

  // Upload Cover Image
  const handleCoverUpload = (file: File) => {
    setUploadingCover(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImageUrl(reader.result as string);
      setUploadingCover(false);
      toast.success('Đã tải ảnh bìa chính thành công.');
    };
    reader.readAsDataURL(file);
  };

  // Upload Gallery Image
  const handleGalleryUpload = (file: File) => {
    setUploadingGallery(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImageUrls((prev) => [...prev, reader.result as string]);
        setUploadingGallery(false);
        toast.success('Đã thêm 1 ảnh vào bộ sưu tập.');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Submit Form với Validate 100% tất cả các trường bắt buộc
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề chuyến đi.');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn Loại hình chuyến đi.');
      return;
    }
    if (!startLocation.trim()) {
      toast.error('Vui lòng nhập Địa điểm cụ thể cho điểm khởi hành.');
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
      toast.error('Vui lòng nhập Địa điểm cụ thể cho điểm đến.');
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
      toast.error('Vui lòng nhập Mô tả & Kế hoạch chi tiết chuyến đi.');
      return;
    }
    if (!startDate) {
      toast.error('Vui lòng chọn Ngày khởi hành.');
      return;
    }
    if (!endDate) {
      toast.error('Vui lòng chọn Ngày kết thúc.');
      return;
    }
    if (!coverImageUrl) {
      toast.error('Vui lòng tải lên Ảnh bìa chính cho chuyến đi.');
      return;
    }
    if (!estimatedCost || isNaN(Number(estimatedCost)) || Number(estimatedCost) < 0) {
      toast.error('Vui lòng nhập Chi phí ước tính hợp lệ.');
      return;
    }
    if (!costNote.trim()) {
      toast.error('Vui lòng nhập Ghi chú chi phí.');
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

      await tripApi.updateTrip(id, req);
      toast.success('Cập nhật chuyến đi thành công!');
      navigate('/my-trips');
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors && typeof data.errors === 'object') {
          const messages = Object.values(data.errors).flat().join(' ');
          toast.error(messages || data.message || 'Cập nhật chuyến đi thất bại.');
        } else {
          toast.error(data.message || 'Cập nhật chuyến đi thất bại.');
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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Header />
        <CreateTripSkeleton />
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
              Chỉnh sửa chuyến đi <Sparkles size={24} className="text-coral-500 fill-coral-500/20" />
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Cập nhật thông tin chi tiết hành trình của bạn trước khi được duyệt.
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

        {/* Form Chỉnh Sửa Chuyến Đi */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* CỘT TRÁI (MAIN FORM - 7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box 1: Thông tin cơ bản */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800">
                  <Info size={18} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                </span>
                <span className="text-[11px] font-black text-amber-700 bg-amber-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
                  Đang chờ duyệt
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
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Ảnh bìa chính <span className="text-rose-500">*</span>
                </label>
                {coverImageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-white cursor-pointer shadow-xs border border-slate-200">
                    <Image
                      src={coverImageUrl}
                      alt="Ảnh bìa chuyến đi"
                      previewable
                      containerClassName="w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer z-20 opacity-0 group-hover:opacity-100"
                      title="Xóa ảnh bìa"
                    >
                      <X size={16} />
                    </button>
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
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white">
                        <Image
                          src={url}
                          alt={`Gallery ${idx}`}
                          previewable
                          containerClassName="w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition cursor-pointer opacity-0 group-hover:opacity-100 z-20"
                          title="Xóa ảnh"
                        >
                          <X size={13} />
                        </button>
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

            {/* Nút Thao Tác Cuối Form */}
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => navigate('/my-trips')}
                  className="w-full font-bold text-xs py-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Hủy bỏ
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default EditTripPage;
