import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Select, type SelectOption } from '../../../components/common/Select';
import { locationApi } from '../../../api/locationApi';
import { useToast } from '../../../context/ToastContext';
import type { Country, UpdateCountryRequest } from '../../../types/location';

interface EditCountryModalProps {
  country: Country;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions: SelectOption[] = [
  { label: 'Hoạt động', value: 'true' },
  { label: 'Dừng hoạt động', value: 'false' },
];

export const EditCountryModal: React.FC<EditCountryModalProps> = ({ country, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [name, setName] = useState(country.name);
  const [code, setCode] = useState(country.code || '');
  const [flagIcon, setFlagIcon] = useState(country.flagIcon || '');
  const [displayOrder, setDisplayOrder] = useState<number>(country.displayOrder || 0);
  const [isActive, setIsActive] = useState<boolean>(country.isActive);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên quốc gia không được để trống.');
      return;
    }

    try {
      setIsLoading(true);
      const req: UpdateCountryRequest = {
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        flagIcon: flagIcon.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
        isActive,
      };
      await locationApi.updateCountry(country.id, req);
      toast.success(`Cập nhật quốc gia "${name.trim()}" thành công!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật quốc gia.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Chỉnh sửa quốc gia — ${country.name}`} maxWidth="lg" position="top">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên quốc gia <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã ISO (Viết hoa)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={10}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cờ / Biểu tượng Emoji</label>
            <input
              type="text"
              value={flagIcon}
              onChange={(e) => setFlagIcon(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái hệ thống</label>
            <Select
              options={statusOptions}
              value={isActive ? 'true' : 'false'}
              onChange={(val) => setIsActive(val === 'true')}
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
            {isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
