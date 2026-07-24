import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { type PendingHostVerification } from '../../types/adminHost';
import { Modal } from '../../components/common/Modal';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Phone,
  Mail,
  CreditCard,
  UserCheck,
} from 'lucide-react';

const PRESET_REASON_OPTIONS = [
  'Ảnh CCCD bị mờ, lóa hoặc không rõ chữ',
  'Số CCCD không chính xác hoặc không trùng khớp',
  'Ảnh CCCD bị mất góc, mờ nhòe hoặc có dấu hiệu chỉnh sửa',
  'Thông tin cá nhân trong hồ sơ chưa đầy đủ',
];

const HostVerificationPage: React.FC = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingHostVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingHostVerification | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPendingVerifications();
      setRequests(res.data || []);
    } catch {
      toast.error('Không thể kết nối đến máy chủ Backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      setIsProcessing(true);
      await adminApi.approveHostVerification(userId);
      toast.success('Đã phê duyệt thành công! Người dùng có thể tạo chuyến đi.');
      setSelectedUser(null);
      fetchRequests();
    } catch {
      toast.error('Phê duyệt thất bại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng chọn hoặc nhập lý do từ chối.');
      return;
    }
    try {
      setIsProcessing(true);
      await adminApi.rejectHostVerification(selectedUser.userId, rejectReason);
      toast.error('Đã từ chối yêu cầu tạo chuyến của người dùng.');
      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectReason('');
      fetchRequests();
    } catch {
      toast.error('Từ chối thất bại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchQuery)) ||
      (u.identityCardNumber && u.identityCardNumber.includes(searchQuery))
  );

  return (
    <AdminLayout pendingCount={requests.length}>
      {/* Title & Top Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-0.5 text-left">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck size={20} className="text-amber-500" />
            Duyệt quyền tạo chuyến (Host Verification)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kiểm tra thông tin cá nhân và 2 mặt CCCD trước khi cấp quyền tạo chuyến.
          </p>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm theo Tên, Email, SĐT, CCCD..."
          containerClassName="w-full sm:w-72"
        />
      </div>

      {/* Content Cards */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-semibold text-xs">Đang tải danh sách yêu cầu chờ duyệt...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <CheckCircle2 size={40} className="mx-auto text-emerald-500/80" />
          <h3 className="text-sm font-bold text-slate-800">Không có yêu cầu nào chờ duyệt</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tất cả các hồ sơ CCCD của người dùng đăng ký quyền Host đã được xử lý xong.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {filteredRequests.map((user) => (
            <div
              key={user.userId}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header User info */}
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-coral-50 text-coral-600 font-bold text-base flex items-center justify-center shrink-0">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{user.fullName}</h4>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <Mail size={12} /> {user.email}
                    </p>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone size={13} /> SĐT:
                    </span>
                    <span className="font-bold text-slate-800">{user.phoneNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <CreditCard size={13} /> Số CCCD:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{user.identityCardNumber || 'Chưa đăng ký'}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <Button
                size="sm"
                variant="info"
                leftIcon={<Eye size={15} />}
                onClick={() => setSelectedUser(user)}
                className="text-xs font-bold py-2 px-4 rounded-lg cursor-pointer shadow-2xs"
              >
                Soi hồ sơ & Duyệt
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 1. Modal Chi Tiết Soi Hồ Sơ CCCD */}
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={`Xét duyệt quyền Host - ${selectedUser.fullName}`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* Header User Status */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {selectedUser.avatarUrl ? (
                <img src={selectedUser.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedUser.fullName}</h3>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Đang chờ xét duyệt
                </span>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  {selectedUser.fullName}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 truncate">
                  {selectedUser.email}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  {selectedUser.phoneNumber || 'Chưa cập nhật'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  {selectedUser.gender || 'Chưa chọn'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  {formatDate(selectedUser.birthDate) || 'Chưa nhập'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số CCCD</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800">
                  {selectedUser.identityCardNumber || 'Chưa đăng ký'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đánh giá trung bình</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  {selectedUser.avgRating?.toFixed(1) || '0.0'} / 5.0
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tổng số chuyến đi</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  {selectedUser.totalTrips || 0} chuyến
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày gửi yêu cầu</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  {formatDate(selectedUser.requestDate) || 'Chưa có'}
                </div>
              </div>
            </div>

            {/* Bio cá nhân */}
            {selectedUser.bio && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio cá nhân</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 min-h-[50px]">
                  {selectedUser.bio}
                </div>
              </div>
            )}

            {/* 2 Ảnh CCCD Mặt Trước & Mặt Sau */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">Ảnh CCCD Mặt trước & Mặt sau</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Mặt trước</span>
                  {selectedUser.identityCardFrontUrl ? (
                    <img
                      src={selectedUser.identityCardFrontUrl}
                      alt="CCCD Mặt trước"
                      className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 font-semibold">
                      Thiếu ảnh mặt trước
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Mặt sau</span>
                  {selectedUser.identityCardBackUrl ? (
                    <img
                      src={selectedUser.identityCardBackUrl}
                      alt="CCCD Mặt sau"
                      className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 font-semibold">
                      Thiếu ảnh mặt sau
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons trong Modal */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {/* Nút Đóng (Nền trắng viền xám) */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
              >
                Đóng
              </Button>

              {/* Nút Từ chối (Màu Đỏ Tươi) */}
              <Button
                size="sm"
                variant="danger"
                leftIcon={<XCircle size={15} />}
                onClick={() => {
                  setRejectReason('');
                  setShowRejectModal(true);
                }}
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
              >
                Từ chối
              </Button>

              {/* Nút Phê duyệt tạo chuyến (Màu Xanh Lá Tươi) */}
              <Button
                size="sm"
                variant="success"
                isLoading={isProcessing}
                leftIcon={<CheckCircle2 size={15} />}
                onClick={() => handleApprove(selectedUser.userId)}
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-bold rounded-xl cursor-pointer shadow-2xs disabled:opacity-60"
              >
                Phê duyệt tạo chuyến
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Modal Nhập lý do Từ chối */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Lý do từ chối hồ sơ"
        >
          <div className="space-y-4">
            {/* Quick preset options */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">Gợi ý lý do từ chối nhanh:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_REASON_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setRejectReason(option)}
                    className={`text-xs font-medium text-left ${
                      rejectReason === option
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Manual input textarea */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Nội dung chi tiết (có thể chỉnh sửa):</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do từ chối hoặc chọn gợi ý bên trên..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </Button>

              <Button
                size="sm"
                variant="danger"
                isLoading={isProcessing}
                onClick={handleReject}
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default HostVerificationPage;
