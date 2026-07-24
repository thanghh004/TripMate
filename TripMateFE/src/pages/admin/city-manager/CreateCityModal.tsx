import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
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
  const [isLoading, setIsLoading] = useState(false);

  const countryOptions: SelectOption[] = countries
    .filter((c) => c.isActive)
    .map((c) => ({
      label: `${c.flagIcon ? c.flagIcon + ' ' : ''}${c.name}`,
      value: c.id,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryId) { toast.error('Vui lòng chọn quốc gia.'); return; }
    if (!name.trim()) { toast.error('Tên thành phố / tỉnh không được để trống.'); return; }

    try {
      setIsLoading(true);
      const req: CreateCityRequest = {
        countryId,
        name: name.trim(),
        slug: slug.trim().toLowerCase() || undefined,
        displayOrder: 0,
      };
      await locationApi.createCity(req);
      toast.success(`Đã thêm mới thành phố "${name.trim()}"!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo mới thành phố.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Thêm thành phố / tỉnh mới" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quốc gia thuộc về <span className="text-rose-500">*</span>
          </label>
          <Select options={countryOptions} value={countryId} onChange={(val) => setCountryId(val)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên Thành phố / Tỉnh *"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Hà Nội, Đà Nẵng..."
          />

          <Input
            label="Slug URL (Viết thường)"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="VD: ha-noi, da-nang..."
            className="font-mono"
          />
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" type="button" onClick={onClose} className="px-5 py-2 border-slate-300 text-slate-700 font-semibold">
            Hủy
          </Button>
          <Button size="sm" variant="warning" type="submit" isLoading={isLoading} disabled={isLoading} className="px-5 py-2 font-semibold disabled:opacity-60">
            Tạo thành phố
          </Button>
        </div>
      </form>
    </Modal>
  );
};
