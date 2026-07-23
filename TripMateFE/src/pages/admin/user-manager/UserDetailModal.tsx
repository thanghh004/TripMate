import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { type AdminUserListItem } from '../../../types/admin';

interface UserDetailModalProps {
  user: AdminUserListItem;
  onClose: () => void;
}

const getHostStatusLabel = (status: number): string => {
  switch (status) {
    case 2: return 'Đã phê duyệt Host';
    case 1: return 'Chờ duyệt Host';
    case 3: return 'Bị từ chối Host';
    default: return 'Chưa đăng ký Host';
  }
};

const InfoField: React.FC<{ label: string; value?: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
    <div className={`bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>
      {value || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
    </div>
  </div>
);

const CccdPhotos: React.FC<{ frontUrl?: string; backUrl?: string }> = ({ frontUrl, backUrl }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {(['front', 'back'] as const).map((side) => {
      const url = side === 'front' ? frontUrl : backUrl;
      const label = side === 'front' ? 'Ảnh CCCD Mặt trước' : 'Ảnh CCCD Mặt sau';
      return (
        <div key={side}>
          <span className="text-xs font-semibold text-slate-700 block mb-1.5">{label}</span>
          {url ? (
            <img src={url} alt={label}
              className="w-full h-36 object-cover rounded-lg border border-slate-200 shadow-xs" />
          ) : (
            <div className="w-full h-36 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
              Chưa có ảnh
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${user.fullName} — Chi tiết thông tin thành viên`}
      maxWidth="3xl"
      position="top"
    >
      {/* Grid 3 cột thông tin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoField label="Họ và tên" value={user.fullName} />
        <InfoField label="Địa chỉ Email" value={user.email} />
        <InfoField label="Số điện thoại" value={user.phoneNumber} />
        <InfoField label="Giới tính" value={user.gender} />
        <InfoField label="Ngày sinh" value={user.birthDate ? String(user.birthDate).substring(0, 10) : undefined} />
        <InfoField label="Số CCCD" value={user.identityCardNumber} mono />
        <InfoField label="Vai trò hệ thống" value={user.role === 'Admin' ? 'Quản trị viên (Admin)' : 'Thành viên (User)'} />
        <InfoField label="Trạng thái tài khoản" value={user.status === 1 ? 'Tạm khóa (Suspended)' : 'Đang hoạt động (Active)'} />
        <InfoField label="Trạng thái Host" value={getHostStatusLabel(user.hostVerificationStatus)} />
        <InfoField label="Đánh giá trung bình" value={`${user.avgRating.toFixed(1)} / 5.0`} />
        <InfoField label="Tổng số chuyến đi" value={`${user.totalTrips} chuyến`} />
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Bio cá nhân</label>
          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-700 min-h-[60px]">
            {user.bio}
          </div>
        </div>
      )}

      {/* Đường kẻ đứt */}
      <div className="border-t border-dashed border-slate-200 my-5" />

      {/* Ảnh CCCD */}
      <CccdPhotos frontUrl={user.identityCardFrontUrl} backUrl={user.identityCardBackUrl} />

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 font-semibold text-xs transition cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};
