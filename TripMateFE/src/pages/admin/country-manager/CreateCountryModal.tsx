import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { locationApi } from '../../../api/locationApi';
import { useToast } from '../../../context/ToastContext';
import type { CreateCountryRequest } from '../../../types/location';

interface CreateCountryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCountryModal: React.FC<CreateCountryModalProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [flagIcon, setFlagIcon] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên quốc gia không được để trống.');
      return;
    }

    try {
      setIsLoading(true);
      const req: CreateCountryRequest = {
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        flagIcon: flagIcon.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
      };
      await locationApi.createCountry(req);
      toast.success(`Đã thêm mới quốc gia "${name.trim()}"!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo mới quốc gia.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Thêm quốc gia mới" maxWidth="lg" position="top">
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
            placeholder="VD: Việt Nam, Nhật Bản..."
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
              placeholder="VD: VN, JP..."
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Cờ / Biểu tượng Emoji</label>
          <input
            type="text"
            value={flagIcon}
            onChange={(e) => setFlagIcon(e.target.value)}
            placeholder="VD: 🇻🇳, 🇯🇵..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
          />
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
            {isLoading ? 'Đang xử lý...' : 'Tạo quốc gia'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
