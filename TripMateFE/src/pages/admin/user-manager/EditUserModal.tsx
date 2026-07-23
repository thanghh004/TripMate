import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { type AdminUserListItem, type AdminUpdateUserRequest } from '../../../types/admin';
import { Select, type SelectOption } from '../../../components/common/Select';
import { adminApi } from '../../../api/adminApi';
import { useToast } from '../../../context/ToastContext';
import { Loader2, Save } from 'lucide-react';

interface EditUserModalProps {
  user: AdminUserListItem;
  onClose: () => void;
  onSuccess: () => void;
}

const roleOptions: SelectOption[] = [
  { label: 'Thành viên (User)', value: 0 },
  { label: 'Quản trị viên (Admin)', value: 1 },
];

const statusOptions: SelectOption[] = [
  { label: 'Hoạt động (Active)', value: 0 },
  { label: 'Tạm khóa (Suspended)', value: 1 },
];

const hostStatusOptions: SelectOption[] = [
  { label: 'Chưa đăng ký (Unverified)', value: 0 },
  { label: 'Chờ duyệt (Pending)', value: 1 },
  { label: 'Đã phê duyệt (Approved)', value: 2 },
  { label: 'Bị từ chối (Rejected)', value: 3 },
];

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [editRole, setEditRole] = useState<number>(user.role === 'Admin' ? 1 : 0);
  const [editStatus, setEditStatus] = useState<number>(user.status);
  const [editHostStatus, setEditHostStatus] = useState<number>(user.hostVerificationStatus);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload: AdminUpdateUserRequest = {
        role: editRole,
        status: editStatus,
        hostVerificationStatus: editHostStatus,
      };
      await adminApi.updateUser(user.userId, payload);
      toast.success(`Đã cập nhật cài đặt quản trị cho ${user.fullName}.`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Cập nhật thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Chỉnh sửa thông tin quản trị — ${user.fullName}`}
      maxWidth="3xl"
      position="top"
    >
      {/* 1. Thông tin cá nhân Read-only */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Thông tin cá nhân (Read-only)
          </span>
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
            Không được sửa thông tin này
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Họ và tên', value: user.fullName },
            { label: 'Email', value: user.email },
            { label: 'Số điện thoại', value: user.phoneNumber || 'Chưa cập nhật' },
            { label: 'Giới tính', value: user.gender || 'Chưa chọn' },
            { label: 'Ngày sinh', value: user.birthDate ? String(user.birthDate).substring(0, 10) : 'Chưa nhập' },
            { label: 'Số CCCD', value: user.identityCardNumber || 'Chưa đăng ký', mono: true },
            { label: 'Đánh giá trung bình', value: `${user.avgRating.toFixed(1)} / 5.0` },
            { label: 'Tổng số chuyến đi', value: `${user.totalTrips} chuyến` },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
              <input
                type="text"
                disabled
                value={value}
                className={`w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 cursor-not-allowed ${mono ? 'font-mono' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Đường kẻ đứt */}
      <div className="border-t border-dashed border-slate-200 my-4" />

      {/* 2. Cài đặt quản trị */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Cài đặt quản trị (Được chỉnh sửa)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vai trò hệ thống</label>
            <Select options={roleOptions} value={editRole} onChange={(val) => setEditRole(Number(val))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái tài khoản</label>
            <Select options={statusOptions} value={editStatus} onChange={(val) => setEditStatus(Number(val))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quyền duyệt Host</label>
            <Select options={hostStatusOptions} value={editHostStatus} onChange={(val) => setEditHostStatus(Number(val))} />
          </div>
        </div>
      </div>

      {/* Đường kẻ đứt */}
      <div className="border-t border-dashed border-slate-200 my-4" />

      {/* 3. Ảnh CCCD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['front', 'back'] as const).map((side) => {
          const url = side === 'front' ? user.identityCardFrontUrl : user.identityCardBackUrl;
          const label = side === 'front' ? 'Ảnh CCCD Mặt trước' : 'Ảnh CCCD Mặt sau';
          return (
            <div key={side}>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">{label}</span>
              {url ? (
                <img src={url} alt={label}
                  className="w-full h-32 object-cover rounded-lg border border-slate-200 shadow-xs" />
              ) : (
                <div className="w-full h-32 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                  Chưa có ảnh
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 font-semibold text-xs transition cursor-pointer"
        >
          Đóng
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Lưu thay đổi</span>
        </button>
      </div>
    </Modal>
  );
};
