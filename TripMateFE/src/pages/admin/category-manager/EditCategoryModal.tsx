import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { Select, type SelectOption } from '../../../components/common/Select';
import { tripCategoryApi } from '../../../api/tripCategoryApi';
import { useToast } from '../../../context/ToastContext';
import type { TripCategory, UpdateTripCategoryRequest } from '../../../types/tripCategory';

interface EditCategoryModalProps {
  category: TripCategory;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions: SelectOption[] = [
  { label: 'Hoạt động', value: 'true' },
  { label: 'Dừng hoạt động', value: 'false' },
];

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ category, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [icon, setIcon] = useState(category.icon || '');
  const [description, setDescription] = useState(category.description || '');
  const [displayOrder] = useState<number>(category.displayOrder);
  const [isActive, setIsActive] = useState<boolean>(category.isActive);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên loại chuyến đi không được để trống.');
      return;
    }
    if (!slug.trim()) {
      toast.error('Slug không được để trống.');
      return;
    }

    try {
      setIsLoading(true);
      const req: UpdateTripCategoryRequest = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: icon.trim() || undefined,
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
        isActive,
      };
      await tripCategoryApi.updateCategory(category.id, req);
      toast.success(`Cập nhật loại chuyến đi "${name.trim()}" thành công!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật loại chuyến đi.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Chỉnh sửa — ${category.name}`} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên loại chuyến đi *"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Slug URL"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Icon biểu tượng"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="VD: 🏔️"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái hệ thống</label>
            <Select
              options={statusOptions}
              value={isActive ? 'true' : 'false'}
              onChange={(val) => setIsActive(val === 'true')}
              searchable={false}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition resize-none"
          />
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onClose}
            className="px-5 py-2 border-slate-300 text-slate-700 font-semibold"
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
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
