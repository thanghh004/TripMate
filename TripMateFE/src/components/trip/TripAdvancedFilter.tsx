import React, { useEffect, useState } from 'react';
import { locationApi } from '../../api/locationApi';
import { tripCategoryApi } from '../../api/tripCategoryApi';
import type { City } from '../../types/location';
import type { TripCategory } from '../../types/tripCategory';
import Select from '../common/Select';
import Input from '../common/Input';
import { DatePicker } from '../common/DatePicker';
import { Filter, RotateCcw, Search } from 'lucide-react';

export interface TripFilterCriteria {
  startCityId: string;
  destinationCityId: string;
  minCost: string;
  maxCost: string;
  categoryId: string;
  startDate: string;
  endDate: string;
}

interface TripAdvancedFilterProps {
  onFilterApply: (filters: TripFilterCriteria) => void;
}

const initialFilters: TripFilterCriteria = {
  startCityId: '',
  destinationCityId: '',
  minCost: '',
  maxCost: '',
  categoryId: '',
  startDate: '',
  endDate: '',
};

export const TripAdvancedFilter: React.FC<TripAdvancedFilterProps> = ({ onFilterApply }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<TripCategory[]>([]);
  
  // State quản lý giá trị nhập liệu tạm thời (chưa lọc)
  const [localFilters, setLocalFilters] = useState<TripFilterCriteria>(initialFilters);

  // Nạp Master Data (Thành phố/Tỉnh & Danh mục)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [citiesData, categoriesData] = await Promise.all([
          locationApi.getCities(),
          tripCategoryApi.getCategories(),
        ]);
        setCities(citiesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Lỗi khi nạp Master Data bộ lọc:', err);
      }
    };

    fetchMasterData();
  }, []);

  const handleChange = (field: keyof TripFilterCriteria, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters(initialFilters);
    onFilterApply(initialFilters);
  };

  const cityOptions = [
    { label: '-- Tất cả --', value: '' },
    ...cities.map((city) => ({ label: city.name, value: city.id })),
  ];

  const categoryOptions = [
    { label: '-- Tất cả --', value: '' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ];

  return (
    <form onSubmit={handleApply} className="space-y-3 font-sans text-left w-full max-w-[320px] pr-1">
      {/* Header Phẳng: NÚT LỌC VÀ NÚT XÓA BỎ VIỀN, BỎ NỀN */}
      <div className="flex items-center justify-between pb-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter size={13} className="text-coral-500" />
          <span>Tìm chuyến đi chi tiết</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Nút Lọc Phẳng (Bỏ viền, bỏ nền) */}
          <button
            type="button"
            onClick={handleApply}
            className="text-[11px] font-bold text-coral-600 hover:text-coral-700 transition cursor-pointer flex items-center gap-1"
          >
            <Search size={12} /> Lọc
          </button>

          {/* Nút Xóa Phẳng (Bỏ viền, bỏ nền) */}
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition flex items-center gap-1 cursor-pointer"
            title="Xóa bộ lọc"
          >
            <RotateCcw size={11} /> Xóa
          </button>
        </div>
      </div>

      {/* HÀNG 1: Điểm đi CÙNG HÀNG Điểm đến */}
      <div className="grid grid-cols-2 gap-2">
        <div className="w-full">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Điểm đi</label>
          <Select
            options={cityOptions}
            value={localFilters.startCityId}
            onChange={(val) => handleChange('startCityId', val)}
          />
        </div>
        <div className="w-full">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Điểm đến</label>
          <Select
            options={cityOptions}
            value={localFilters.destinationCityId}
            onChange={(val) => handleChange('destinationCityId', val)}
          />
        </div>
      </div>

      {/* HÀNG 2: Chi phí CÙNG HÀNG Loại hình */}
      <div className="grid grid-cols-2 gap-2">
        <div className="w-full">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Chi phí tối đa</label>
          <Input
            type="number"
            min={0}
            placeholder="VD: 5000000"
            value={localFilters.maxCost}
            onChange={(e) => handleChange('maxCost', e.target.value)}
          />
        </div>
        <div className="w-full">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Loại hình</label>
          <Select
            options={categoryOptions}
            value={localFilters.categoryId}
            onChange={(val) => handleChange('categoryId', val)}
          />
        </div>
      </div>

      {/* HÀNG 3: Ngày bắt đầu NẰM Ở DƯỚI CÙNG */}
      <div className="w-full">
        <label className="block text-[11px] font-bold text-slate-600 mb-1">Ngày bắt đầu</label>
        <DatePicker
          value={localFilters.startDate}
          onChange={(val) => handleChange('startDate', val)}
          onClear={() => handleChange('startDate', '')}
          placeholder="Từ ngày"
        />
      </div>
    </form>
  );
};

export default TripAdvancedFilter;
