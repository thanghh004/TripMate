import React from 'react';
import { Modal } from '../../../components/common/Modal';
import type { City } from '../../../types/location';
import { formatDate } from '../../../utils/formatters';

interface CityDetailModalProps {
  city: City;
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

export const CityDetailModal: React.FC<CityDetailModalProps> = ({ city, onClose }) => {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Chi tiết thành phố — ${city.name}`}
      maxWidth="2xl"
      position="top"
    >
      <div className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoField label="Tên Thành phố / Tỉnh" value={city.name} />
          <InfoField label="Quốc gia chủ quản" value={city.countryName} />
          <InfoField label="Slug URL" value={city.slug} mono />
          <InfoField label="Thứ tự hiển thị" value={city.displayOrder.toString()} />
          <InfoField label="Trạng thái hệ thống" value={city.isDeleted ? 'Đã xóa' : city.isActive ? 'Hoạt động' : 'Dừng hoạt động'} />
          <InfoField label="Ngày tạo hệ thống" value={formatDate(city.createdAt)} />
        </div>

        {/* Footer matching UserDetailModal */}
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
