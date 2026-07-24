import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
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
        displayOrder: 0,
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
    <Modal isOpen onClose={onClose} title="Thêm quốc gia mới" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Tên quốc gia *"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Việt Nam, Nhật Bản..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mã ISO (Viết hoa)"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VD: VN, JP..."
            maxLength={10}
            className="font-mono uppercase"
          />

          <Input
            label="Cờ / Biểu tượng Emoji"
            type="text"
            value={flagIcon}
            onChange={(e) => setFlagIcon(e.target.value)}
            placeholder="VD: 🇻🇳, 🇯🇵..."
          />
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onClose}
            className="px-5 py-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            variant="warning"
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
            className="px-5 py-2 font-semibold disabled:opacity-60"
          >
            Tạo quốc gia
          </Button>
        </div>
      </form>
    </Modal>
  );
};
