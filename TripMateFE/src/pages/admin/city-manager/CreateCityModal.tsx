import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Select, type SelectOption } from '../../../components/common/Select';
import { locationApi } from '../../../api/locationApi';
import { useToast } from '../../../context/ToastContext';
import type { Country, CreateCityRequest } from '../../../types/location';

interface CreateCityModalProps {
  countries: Country[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCityModal: React.FC<CreateCityModalProps> = ({ countries, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [countryId, setCountryId] = useState(countries.length > 0 ? countries[0].id : '');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const countryOptions: SelectOption[] = countries
    .filter((c) => c.isActive)
    .map((c) => ({
      label: `${c.flagIcon ? c.flagIcon + ' ' : ''}${c.name}`,
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
      const req: CreateCityRequest = {
        countryId,
        name: name.trim(),
        slug: slug.trim().toLowerCase() || undefined,
        displayOrder: Number(displayOrder) || 0,
      };
      await locationApi.createCity(req);
      toast.success(`Đã thêm mới thành phố "${name.trim()}"!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo mới thành phố.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Thêm thành phố / tỉnh mới" maxWidth="lg" position="top">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên Thành phố / Tỉnh <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Hà Nội, Đà Nẵng, Sa Pa..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL (Viết thường)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="VD: ha-noi, da-nang..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thứ tự hiển thị</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>
        </div>

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
            {isLoading ? 'Đang xử lý...' : 'Tạo thành phố'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
