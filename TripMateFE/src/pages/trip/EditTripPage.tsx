import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { tripCategoryApi } from '../../api/tripCategoryApi';
import type { Trip } from '../../types/trip';
import { TripStatus } from '../../types/trip';
import {
  MapPin,
  Users,
  DollarSign,
  Info,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Star,
  Sparkles,
  FileText,
  Save,
  Trash2,
  Plus
} from 'lucide-react';

export const EditTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);

  // Form States - Cho phép sửa TẤT CẢ
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | string>('');
  const [costNote, setCostNote] = useState('');
  const [maxMembers, setMaxMembers] = useState<number>(10);
  const [minAge, setMinAge] = useState<number | string>('');
  const [maxAge, setMaxAge] = useState<number | string>('');
  const [requirements, setRequirements] = useState('');

  // Load danh mục & chi tiết chuyến đi
  useEffect(() => {
    const initData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        // 1. Fetch categories
        const cats = await tripCategoryApi.getCategories(true);
        const catOptions = cats.map((c) => ({
          value: c.id,
          label: c.name,
        }));
        setCategories(catOptions);

        // 2. Fetch Trip Detail
        const tripData: Trip = await tripApi.getTripById(id);
        
        // Kiểm tra điều kiện: CHỈ CHO PHÉP SỬA KHI PENDING REVIEW (0)
        if (tripData.status !== TripStatus.PendingReview) {
          toast.error('Chỉ có thể chỉnh sửa chuyến đi khi đang ở trạng thái Chờ duyệt.');
          navigate('/my-trips');
          return;
        }

        setTrip(tripData);
        setTitle(tripData.title || '');
        setCategoryId(tripData.categoryId || '');
        setStartLocation(tripData.startLocation || '');
        setDestination(tripData.destination || '');
        setStartDate(tripData.startDate ? tripData.startDate.substring(0, 10) : '');
        setEndDate(tripData.endDate ? tripData.endDate.substring(0, 10) : '');
        setDescription(tripData.description || '');
        setCoverImageUrl(tripData.coverImageUrl || '');
        setImageUrls(tripData.imageUrls || []);
        setEstimatedCost(tripData.estimatedCost ?? '');
        setCostNote(tripData.costNote || '');
        setMaxMembers(tripData.maxMembers || 10);
        setMinAge(tripData.minAge ?? '');
        setMaxAge(tripData.maxAge ?? '');
        setRequirements(tripData.requirements || '');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Không thể tải thông tin chuyến đi.');
        navigate('/my-trips');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id, navigate]);

  // Chọn/Tải ảnh bìa mới từ máy tính
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrl(reader.result as string);
        toast.success('Đã chọn ảnh bìa mới thành công.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm ảnh vào bộ sưu tập (Gallery)
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setImageUrls([...imageUrls, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
    toast.success('Đã thêm ảnh vào bộ sưu tập.');
  };

  // Thêm ảnh vào bộ sưu tập từ tệp máy tính
  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      toast.success('Đã thêm ảnh vào bộ sưu tập.');
    }
  };

  // Xóa ảnh khỏi bộ sưu tập
  const handleRemoveGalleryImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  // Submit form chỉnh sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề chuyến đi.');
      return;
    }
    if (!startLocation.trim()) {
      toast.error('Vui lòng nhập điểm khởi hành.');
      return;
    }
    if (!destination.trim()) {
      toast.error('Vui lòng nhập điểm đến.');
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

    try {
      setIsSaving(true);
      await tripApi.updateTrip(id, {
        categoryId,
        title: title.trim(),
        description: description.trim(),
        startLocation: startLocation.trim(),
        destination: destination.trim(),
        coverImageUrl: coverImageUrl.trim(),
        startDate,
        endDate,
        maxMembers: Number(maxMembers),
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        costNote: costNote.trim(),
        requirements: requirements.trim(),
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        imageUrls,
      });

      toast.success('Cập nhật chuyến đi thành công!');
      navigate('/my-trips');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật chuyến đi thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1400px] mx-auto w-full">
        {isLoading ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={36} className="animate-spin text-coral-500" />
            <span className="text-sm font-semibold">Đang tải dữ liệu chuyến đi...</span>
          </div>
        ) : !trip ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Không tìm thấy chuyến đi</h2>
            <Button onClick={() => navigate('/my-trips')} className="bg-coral-500 text-white font-bold py-2.5 px-6 rounded-xl">
              Quay lại danh sách chuyến đi
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Header Title Top - GIỐNG HỆT TRANG XEM CHI TIẾT & BỎ NÚT QUAY LẠI */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  Chỉnh sửa: {title || trip.title} <Sparkles size={24} className="text-coral-500 fill-coral-500/20" />
                </h1>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Cập nhật tất cả các thông tin chuyến đi của bạn trước khi được phê duyệt.
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

            {/* BỐ CỤC 2 CỘT (7 COLS MAIN + 5 COLS SIDEBAR) GIỐNG HỆT TRANG XEM CHI TIẾT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">

              {/* CỘT TRÁI (MAIN FORM - 7 COLS) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Box 1: Thông tin chung về chuyến đi */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-800">
                      <Info size={18} className="text-coral-500" /> 1. Thông tin chung về chuyến đi
                    </span>
                    <span className="text-[11px] font-black text-amber-700 bg-amber-100/90 px-3 py-1 rounded-full uppercase tracking-wider">
                      Đang chờ duyệt
                    </span>
                  </h2>

                  {/* Tiêu đề & Loại hình */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tiêu đề chuyến đi <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề chuyến đi..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại hình chuyến đi</label>
                      <Select
                        options={categories}
                        value={categoryId}
                        onChange={(val) => setCategoryId(val as string)}
                        placeholder="Chọn loại hình"
                      />
                    </div>
                  </div>

                  {/* Điểm khởi hành & Điểm đến */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Địa điểm khởi hành <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                        placeholder="VD: Bến xe Mỹ Đình, Hà Nội"
                        leftIcon={<MapPin size={18} className="text-coral-500 shrink-0" />}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Địa điểm đến chính <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="VD: Hà Giang"
                        leftIcon={<MapPin size={18} className="text-emerald-500 shrink-0" />}
                        required
                      />
                    </div>
                  </div>

                  {/* Ngày khởi hành & Ngày kết thúc */}
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

                {/* Box 2: Kế hoạch & Mô tả chi tiết */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <FileText size={18} className="text-coral-500" /> 2. Kế hoạch & Mô tả chi tiết
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nội dung chi tiết chuyến đi</label>
                    <textarea
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả chi tiết lịch trình, dụng cụ cần mang theo, điểm tập kết..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-coral-400 transition resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Box 3: Danh sách Thành viên tham gia */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Users size={18} className="text-coral-500" /> Thành viên đã tham gia ({trip.currentMembers}/{maxMembers})
                    </h2>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Còn trống {Math.max(0, maxMembers - trip.currentMembers)} chỗ
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

                {/* Box 1: Ảnh bìa chính & Bộ sưu tập ảnh (CHO PHÉP ĐỔI & THÊM XÓA ẢNH) */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-5 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <ImagePlus size={18} className="text-coral-500" /> Ảnh bìa & Bộ sưu tập ảnh
                  </h2>

                  {/* Ảnh bìa chính */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Ảnh bìa chính</label>
                      <label className="text-xs font-bold text-coral-600 hover:text-coral-700 cursor-pointer bg-coral-50 px-2.5 py-1 rounded-lg border border-coral-200/80">
                        Chọn tệp từ máy...
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <Input
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh bìa chính vào đây..."
                    />

                    {coverImageUrl ? (
                      <div className="rounded-2xl overflow-hidden aspect-video bg-white border border-slate-200 shadow-2xs relative group">
                        <Image
                          src={coverImageUrl}
                          alt="Cover preview"
                          previewable
                          containerClassName="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-400 font-medium">
                        Chưa có ảnh bìa
                      </div>
                    )}
                  </div>

                  {/* Bộ sưu tập ảnh (Gallery) */}
                  <div className="space-y-3 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Bộ sưu tập ảnh ({imageUrls.length})
                      </label>
                      <label className="text-xs font-bold text-coral-600 hover:text-coral-700 cursor-pointer bg-coral-50 px-2.5 py-1 rounded-lg border border-coral-200/80">
                        Tải nhiều ảnh từ máy...
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleGalleryFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="Dán URL ảnh gallery mới..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        className="bg-coral-500 text-white font-bold text-xs px-3 rounded-xl shrink-0"
                      >
                        <Plus size={16} /> Thêm
                      </Button>
                    </div>

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
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-xs"
                              title="Xóa ảnh này"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Box 2: Chi phí & Quy mô */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-4 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <DollarSign size={18} className="text-coral-500" /> Chi phí & Thành viên
                  </h2>

                  {/* Chi phí ước tính */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Chi phí ước tính / người (VND)</label>
                    <Input
                      type="number"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="VD: 1500000"
                    />
                  </div>

                  {/* Ghi chú chi phí */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chú chi phí</label>
                    <Input
                      value={costNote}
                      onChange={(e) => setCostNote(e.target.value)}
                      placeholder="VD: Đã bao gồm xe đưa đón và lều trại..."
                    />
                  </div>

                  {/* Số lượng thành viên tối đa */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Số lượng thành viên tối đa</label>
                    <Input
                      type="number"
                      min={2}
                      max={100}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      rightIcon={<Users size={18} className="text-slate-400 shrink-0" />}
                    />
                  </div>

                  {/* Yêu cầu độ tuổi */}
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

                  {/* Yêu cầu khác */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-slate-700">Yêu cầu khác đối với thành viên</label>
                    <textarea
                      rows={3}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="VD: Cần có sức khỏe tốt, chuẩn bị giày leo núi..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-coral-400 transition resize-none"
                    />
                  </div>
                </div>

                {/* Box 3: Action Buttons */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-3 font-sans">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/my-trips')}
                      disabled={isSaving}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3.5 rounded-2xl cursor-pointer shadow-2xs transition"
                    >
                      Hủy bỏ
                    </button>

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs py-3.5 rounded-2xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {isSaving ? (
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
