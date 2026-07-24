import React from 'react';
import { Modal } from '../../../components/common/Modal';
import type { Country } from '../../../types/location';
import { formatDate } from '../../../utils/formatters';

interface CountryDetailModalProps {
  country: Country;
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

export const CountryDetailModal: React.FC<CountryDetailModalProps> = ({ country, onClose }) => {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Chi tiết quốc gia — ${country.name}`}
      maxWidth="2xl"
      position="top"
    >
      <div className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoField label="Tên quốc gia" value={country.name} />
          <InfoField label="Mã quốc gia (ISO)" value={country.code} mono />
          <InfoField label="Cờ / Biểu tượng" value={country.flagIcon} />
          <InfoField label="Thứ tự hiển thị" value={country.displayOrder.toString()} />
          <InfoField label="Trạng thái hệ thống" value={country.isDeleted ? 'Đã xóa' : country.isActive ? 'Hoạt động' : 'Dừng hoạt động'} />
          <InfoField label="Ngày tạo hệ thống" value={formatDate(country.createdAt)} />
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
