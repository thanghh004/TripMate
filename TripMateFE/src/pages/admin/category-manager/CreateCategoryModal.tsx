import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { tripCategoryApi } from '../../../api/tripCategoryApi';
import { useToast } from '../../../context/ToastContext';
import type { CreateTripCategoryRequest } from '../../../types/tripCategory';

interface CreateCategoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tự động sinh slug từ tên (UX cơ bản)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên loại chuyến đi không được để trống.');
      return;
    }

    try {
      setIsLoading(true);
      const req: CreateTripCategoryRequest = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: icon.trim() || undefined,
        description: description.trim() || undefined,
        displayOrder: 0,
      };
      await tripCategoryApi.createCategory(req);
      toast.success(`Đã thêm mới loại chuyến đi "${name.trim()}"!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo mới loại chuyến đi.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Thêm loại chuyến đi mới" maxWidth="lg" position="top">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên loại chuyến đi <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="VD: Leo núi, Picnic, Du lịch biển..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="VD: leo-nui, picnic..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Icon biểu tượng</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="VD: 🏔️ hoặc tên class icon"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về loại chuyến đi..."
            rows={3}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition resize-none"
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
            {isLoading ? 'Đang xử lý...' : 'Tạo loại chuyến đi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
