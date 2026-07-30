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
  Sparkles,
  FileText,
  Save,
  ArrowLeft
} from 'lucide-react';

export const EditTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | string>('');
  const [costNote, setCostNote] = useState('');
  const [maxMembers, setMaxMembers] = useState<number>(10);
  const [minAge, setMinAge] = useState<number | string>('');
  const [maxAge, setMaxAge] = useState<number | string>('');
  const [requirements, setRequirements] = useState('');

  // Load danh mục chuyến đi & thông tin chuyến đi
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

        setTitle(tripData.title || '');
        setCategoryId(tripData.categoryId || '');
        setStartLocation(tripData.startLocation || '');
        setDestination(tripData.destination || '');
        setStartDate(tripData.startDate ? tripData.startDate.substring(0, 10) : '');
        setEndDate(tripData.endDate ? tripData.endDate.substring(0, 10) : '');
        setDescription(tripData.description || '');
        setCoverImageUrl(tripData.coverImageUrl || '');
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Header Top */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => navigate('/my-trips')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer mb-1"
                >
                  <ArrowLeft size={15} /> Quay lại danh sách
                </button>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  Chỉnh sửa chuyến đi <Sparkles size={24} className="text-coral-500 fill-coral-500/20" />
                </h1>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Cập nhật thông tin chi tiết cho kế hoạch hành trình của bạn trước khi được phê duyệt.
                </p>
              </div>
            </div>

            {/* BỐ CỤC 2 CỘT (7 COLS MAIN + 5 COLS SIDEBAR) KHỚP 100% TRANG CHI TIẾT */}
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

              </div>

              {/* CỘT PHẢI (SIDEBAR FORM - 5 COLS) */}
              <div className="lg:col-span-5 space-y-6">

                {/* Box 1: Ảnh bìa chính */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-5 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <ImagePlus size={18} className="text-coral-500" /> Ảnh bìa chuyến đi
                  </h2>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Link URL Ảnh bìa chính</label>
                    <Input
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />

                    {coverImageUrl ? (
                      <div className="rounded-2xl overflow-hidden aspect-video bg-white border border-slate-200 shadow-2xs">
                        <Image
                          src={coverImageUrl}
                          alt="Cover preview"
                          containerClassName="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-400 font-medium">
                        Chưa chọn ảnh bìa
                      </div>
                    )}
                  </div>
                </div>

                {/* Box 2: Chi phí & Thành viên */}
                <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl space-y-4 font-sans">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-3.5 flex items-center gap-2">
                    <DollarSign size={18} className="text-coral-500" /> Chi phí & Quy mô
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
