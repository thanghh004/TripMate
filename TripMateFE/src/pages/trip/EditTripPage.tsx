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
import type { Trip } from '../../types/trip';
import { TripStatus } from '../../types/trip';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Info,
  ImagePlus,
  Loader2,
  Sparkles,
  X,
  UploadCloud,
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

  // Load master data & trip data
  useEffect(() => {
    if (authContext && !authContext.isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const initData = async () => {
      if (!id) return;
      try {
        setIsLoadingMasterData(true);

        // Fetch master data: categories, countries, cities
        const [catsRes, countriesRes, citiesRes] = await Promise.all([
          tripCategoryApi.getCategories(true),
          locationApi.getCountries(true),
          locationApi.getCities(undefined, true),
        ]);
        setCategories(catsRes);
        setCountries(countriesRes);
        setCities(citiesRes);

        // Fetch Trip Detail
        const tripData: Trip = await tripApi.getTripById(id);

        if (tripData.status !== TripStatus.PendingReview) {
          toast.error('Chỉ có thể chỉnh sửa chuyến đi khi đang ở trạng thái Chờ duyệt.');
          navigate('/my-trips');
          return;
        }

        // Fill Data
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
        setEstimatedCost(tripData.estimatedCost ? String(tripData.estimatedCost) : '');
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

    initData();
  }, [id, authContext, isAuthenticated, navigate]);

  // Upload Single Cover Image
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImageUrl(reader.result as string);
      setUploadingCover(false);
      toast.success('Đã tải ảnh bìa chính mới thành công.');
    };
    reader.readAsDataURL(file);
  };

  // Upload Multiple Gallery Images
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newImgs: string[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImgs.push(reader.result as string);
        }
        processedCount++;
        if (processedCount === files.length) {
          setImageUrls((prev) => [...prev, ...newImgs]);
          setUploadingGallery(false);
          toast.success(`Đã thêm thành công ${newImgs.length} ảnh vào bộ sưu tập.`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove Cover
  const removeCoverImage = () => {
    setCoverImageUrl('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Remove Gallery Image
  const removeGalleryImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  // VALIDATION & SUBMIT HANDLER CHUẨN XÁC GIỐNG HỆT CREATE TRIP PAGE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề chuyến đi.');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục loại hình chuyến đi.');
      return;
    }
    if (!startLocation.trim()) {
      toast.error('Vui lòng nhập địa điểm khởi hành cụ thể.');
      return;
    }
    if (!startCountryId) {
      toast.error('Vui lòng chọn quốc gia cho điểm khởi hành.');
      return;
    }
    if (!startCityId) {
      toast.error('Vui lòng chọn thành phố/tỉnh cho điểm khởi hành.');
      return;
    }
    if (!destination.trim()) {
      toast.error('Vui lòng nhập địa điểm đến chính cụ thể.');
      return;
    }
    if (!destinationCountryId) {
      toast.error('Vui lòng chọn quốc gia cho điểm đến chính.');
      return;
    }
    if (!destinationCityId) {
      toast.error('Vui lòng chọn thành phố/tỉnh cho điểm đến chính.');
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
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('Ngày kết thúc phải trùng hoặc sau ngày khởi hành.');
      return;
    }
    if (!coverImageUrl) {
      toast.error('Vui lòng tải lên ảnh bìa chính cho chuyến đi.');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả & kế hoạch chi tiết cho chuyến đi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await tripApi.updateTrip(id, {
        categoryId,
        title: title.trim(),
        description: description.trim(),
        startLocation: startLocation.trim(),
        startCountryId,
        startCityId,
        destination: destination.trim(),
        destinationCountryId,
        destinationCityId,
        coverImageUrl,
        startDate,
        endDate,
        maxMembers,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        costNote: costNote.trim() || undefined,
        requirements: requirements.trim() || undefined,
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        imageUrls,
      });

      toast.success('Cập nhật chuyến đi thành công!');
      navigate('/my-trips');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật chuyến đi thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert categories to SelectOptions
  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Convert master data locations to SelectOptions
  const countryOptions: SelectOption[] = countries.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const startCityOptions: SelectOption[] = cities
    .filter((c) => !startCountryId || c.countryId === startCountryId)
    .map((c) => ({
      value: c.id,
      label: c.name,
    }));

  const destCityOptions: SelectOption[] = cities
    .filter((c) => !destinationCountryId || c.countryId === destinationCountryId)
    .map((c) => ({
      value: c.id,
      label: c.name,
    }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1400px] mx-auto w-full">
        {isLoadingMasterData ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={36} className="animate-spin text-coral-500" />
            <span className="text-sm font-semibold">Đang tải dữ liệu chuyến đi...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6 text-left">
            {/* Header Top - GIỐNG HỆT CREATE TRIP PAGE */}
            <div className="space-y-1 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                Chỉnh sửa chuyến đi <Sparkles size={24} className="text-coral-500 fill-coral-500/20" />
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Cập nhật thông tin chi tiết hành trình của bạn trước khi được duyệt.
              </p>
            </div>

            {/* BỐ CỤC 2 CỘT (MAIN FORM 7 COLS + SIDEBAR 5 COLS) GIỐNG HỆT TRANG TẠO MỚI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">

              {/* CỘT TRÁI (MAIN FORM - 7 COLS) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Box 1: Thông tin chung */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Info size={18} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tiêu đề chuyến đi <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="VD: Chinh phục đỉnh Fansipan 3 ngày 2 đêm..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Loại hình chuyến đi <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        options={categoryOptions}
                        value={categoryId}
                        onChange={(val) => setCategoryId(val as string)}
                        placeholder="-- Chọn loại hình --"
                      />
                    </div>
                  </div>

                  {/* Điểm khởi hành */}
                  <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin size={15} className="text-coral-500" /> Điểm khởi hành
                    </h3>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Địa điểm cụ thể <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                        placeholder="VD: Bến xe Mỹ Đình, Hà Nội..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Quốc gia <span className="text-rose-500">*</span>
                        </label>
                        <Select
                          options={countryOptions}
                          value={startCountryId}
                          onChange={(val) => {
                            setStartCountryId(val as string);
                            setStartCityId('');
                          }}
                          placeholder="-- Chọn Quốc gia --"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Thành phố / Tỉnh <span className="text-rose-500">*</span>
                        </label>
                        <Select
                          options={startCityOptions}
                          value={startCityId}
                          onChange={(val) => setStartCityId(val as string)}
                          placeholder="-- Vui lòng chọn --"
                          disabled={!startCountryId}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Điểm đến chính */}
                  <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin size={15} className="text-emerald-500" /> Điểm đến chính
                    </h3>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Địa điểm cụ thể <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="VD: Cột cờ Lũng Cú, Hà Giang..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Quốc gia <span className="text-rose-500">*</span>
                        </label>
                        <Select
                          options={countryOptions}
                          value={destinationCountryId}
                          onChange={(val) => {
                            setDestinationCountryId(val as string);
                            setDestinationCityId('');
                          }}
                          placeholder="-- Chọn Quốc gia --"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Thành phố / Tỉnh <span className="text-rose-500">*</span>
                        </label>
                        <Select
                          options={destCityOptions}
                          value={destinationCityId}
                          onChange={(val) => setDestinationCityId(val as string)}
                          placeholder="-- Vui lòng chọn --"
                          disabled={!destinationCountryId}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mô tả & Kế hoạch */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mô tả & Kế hoạch chi tiết <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Viết mô tả lịch trình dự kiến từng ngày, điểm lưu trú, phương tiện di chuyển..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-coral-400 focus:bg-white transition resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Box 2: Thời gian chuyến đi */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-coral-500" /> 2. Thời gian chuyến đi
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Ngày khởi hành <span className="text-rose-500">*</span>
                      </label>
                      <DatePicker
                        value={startDate}
                        onChange={(val) => setStartDate(val)}
                        onClear={() => setStartDate('')}
                        placeholder="Chọn ngày khởi hành"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Ngày kết thúc <span className="text-rose-500">*</span>
                      </label>
                      <DatePicker
                        value={endDate}
                        onChange={(val) => setEndDate(val)}
                        onClear={() => setEndDate('')}
                        placeholder="Chọn ngày kết thúc"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI (SIDEBAR FORM - 5 COLS) */}
              <div className="lg:col-span-5 space-y-6">

                {/* Box 1: Ảnh bìa & Hình ảnh */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <ImagePlus size={18} className="text-coral-500" /> Ảnh bìa & Hình ảnh
                  </h2>

                  {/* Single Cover Image */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Ảnh bìa chính <span className="text-rose-500">*</span>
                    </label>

                    {coverImageUrl ? (
                      <div className="rounded-2xl overflow-hidden aspect-video bg-white border border-slate-200 shadow-2xs relative group">
                        <Image
                          src={coverImageUrl}
                          alt="Cover main preview"
                          previewable
                          containerClassName="w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="absolute top-2.5 right-2.5 bg-black/80 hover:bg-black text-white w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer shadow-md"
                          title="Xóa ảnh bìa chính"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-coral-400 bg-slate-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 group-hover:bg-coral-50 group-hover:text-coral-500 flex items-center justify-center transition">
                          {uploadingCover ? <Loader2 size={20} className="animate-spin text-coral-500" /> : <UploadCloud size={20} />}
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-coral-600 transition">
                          Tải ảnh bìa chính *
                        </span>
                        <input
                          type="file"
                          ref={coverInputRef}
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Multiple Gallery Images */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Bộ sưu tập ảnh ({imageUrls.length})
                      </label>
                      <label className="text-xs font-bold text-coral-600 hover:text-coral-700 cursor-pointer flex items-center gap-1">
                        + Thêm ảnh
                        <input
                          type="file"
                          ref={galleryInputRef}
                          multiple
                          accept="image/*"
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploadingGallery && (
                      <div className="text-xs text-coral-500 font-semibold flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" /> Đang tải ảnh...
                      </div>
                    )}

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        {imageUrls.map((url, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white relative group">
                            <Image
                              src={url}
                              alt={`Gallery ${idx}`}
                              previewable
                              containerClassName="w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-black text-white w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer shadow-xs"
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

                {/* Box 2: Chi phí & Thành viên */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <DollarSign size={18} className="text-coral-500" /> Chi phí & Thành viên
                  </h2>

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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Số lượng thành viên tối đa <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={2}
                      max={100}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      rightIcon={<Users size={18} className="text-slate-400 shrink-0" />}
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Yêu cầu độ tuổi (Tùy chọn)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        placeholder="Tuổi tối thiểu"
                      />
                      <Input
                        type="number"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        placeholder="Tuổi tối đa"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Yêu cầu khác đối với thành viên</label>
                    <textarea
                      rows={3}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="VD: Cần có sức khỏe tốt, chuẩn bị giày leo núi..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-coral-400 focus:bg-white transition resize-none"
                    />
                  </div>
                </div>

                {/* Box 3: Action Buttons */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 font-sans">
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

            </div>
          </form>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default EditTripPage;
