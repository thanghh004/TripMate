import React from 'react';
import { Modal } from '../../../components/common/Modal';
import type { TripCategory } from '../../../types/tripCategory';
import { formatDate } from '../../../utils/formatters';

interface CategoryDetailModalProps {
  category: TripCategory;
  onClose: () => void;
}

const InfoField: React.FC<{ label: string; value?: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
    <div className={`bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>
      {value || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
    </div>
  </div>
);

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ category, onClose }) => {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Chi tiết loại chuyến đi — ${category.name}`}
      maxWidth="2xl"
      position="top"
    >
      <div className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoField label="Tên loại chuyến đi" value={category.name} />
          <InfoField label="Slug URL" value={category.slug} mono />
          <InfoField label="Icon biểu tượng" value={category.icon} />
          <InfoField label="Thứ tự hiển thị" value={category.displayOrder.toString()} />
          <InfoField
            label="Trạng thái hệ thống"
            value={category.isDeleted ? 'Đã xóa' : category.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
          />
          <InfoField label="Ngày tạo hệ thống" value={formatDate(category.createdAt)} />
          {category.description && (
            <div className="sm:col-span-2">
              <InfoField label="Mô tả" value={category.description} />
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 font-semibold text-xs transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
