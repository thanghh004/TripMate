import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Select, type SelectOption } from '../../../components/common/Select';
import { locationApi } from '../../../api/locationApi';
import { useToast } from '../../../context/ToastContext';
import type { City, Country, UpdateCityRequest } from '../../../types/location';

interface EditCityModalProps {
  city: City;
  countries: Country[];
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions: SelectOption[] = [
  { label: 'Hoạt động', value: 'true' },
  { label: 'Dừng hoạt động', value: 'false' },
];

export const EditCityModal: React.FC<EditCityModalProps> = ({ city, countries, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [countryId, setCountryId] = useState(city.countryId);
  const [name, setName] = useState(city.name);
  const [slug, setSlug] = useState(city.slug || '');
  const [displayOrder] = useState<number>(city.displayOrder || 0);
  const [isActive, setIsActive] = useState<boolean>(city.isActive);
  const [isLoading, setIsLoading] = useState(false);

  const countryOptions: SelectOption[] = countries
    .filter((c) => c.isActive || c.id === city.countryId)
    .map((c) => ({
      label: `${c.flagIcon ? c.flagIcon + ' ' : ''}${c.name}${!c.isActive ? ' (Đang dừng hoạt động)' : ''}`,
      value: c.id,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryId) {
      toast.error('Vui lòng chọn quốc gia.');
      return;
    }
    if (!name.trim()) {
      toast.error('Tên thành phố / tỉnh không được để trống.');
      return;
    }

    try {
      setIsLoading(true);
      const req: UpdateCityRequest = {
        countryId,
        name: name.trim(),
        slug: slug.trim().toLowerCase() || undefined,
        displayOrder: Number(displayOrder) || 0,
        isActive,
      };
      await locationApi.updateCity(city.id, req);
      toast.success(`Cập nhật thành phố "${name.trim()}" thành công!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật thành phố.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Chỉnh sửa thành phố — ${city.name}`} maxWidth="lg" position="top">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Hàng 1: Quốc gia thuộc về */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quốc gia thuộc về <span className="text-rose-500">*</span>
          </label>
          <Select
            options={countryOptions}
            value={countryId}
            onChange={(val) => setCountryId(val)}
          />
        </div>

        {/* Hàng 2: Tên Thành phố / Tỉnh + Slug URL cùng 1 hàng 2 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên Thành phố / Tỉnh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL (Viết thường)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>
        </div>

        {/* Hàng 3: Trạng thái hệ thống */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái hệ thống</label>
          <Select
            options={statusOptions}
            value={isActive ? 'true' : 'false'}
            onChange={(val) => setIsActive(val === 'true')}
          />
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold text-xs transition cursor-pointer"
          >
            {isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
