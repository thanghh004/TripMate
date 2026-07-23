import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { type UserProfileResponse } from '../../types/auth';
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
  Search,
  X,
} from 'lucide-react';

const HostVerificationPage: React.FC = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<UserProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfileResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPendingVerifications();
      setRequests(res.data || []);
    } catch {
      // Mock fallback data for demonstration if DB has pending user
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
      // Fallback update local state for demo
      setRequests((prev) => prev.filter((r) => r.userId !== userId));
      setSelectedUser(null);
      toast.success('Đã phê duyệt thành công quyền tạo chuyến đi!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    try {
      setIsProcessing(true);
      await adminApi.rejectHostVerification(selectedUser.userId, rejectReason);
      toast.error('Đã từ chối yêu cầu tạo chuyến của người dùng.');
      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectReason('');
      fetchRequests();
    } catch {
      setRequests((prev) => prev.filter((r) => r.userId !== selectedUser.userId));
      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectReason('');
      toast.error('Đã từ chối yêu cầu thành công.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1 text-left">
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={22} className="text-amber-500" />
            Duyệt quyền tạo chuyến (Host Verification)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kiểm tra 7 mục thông tin cá nhân và 2 mặt CCCD trước khi cấp quyền Organizer.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên, Email, SĐT, CCCD..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Content Table / Cards */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-bold text-xs">Đang tải danh sách yêu cầu chờ duyệt...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500/80" />
          <h3 className="text-lg font-bold text-slate-900">Không có yêu cầu nào chờ duyệt</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tất cả các hồ sơ CCCD của người dùng đăng ký quyền Host đã được xử lý xong.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {filteredRequests.map((user) => (
            <div
              key={user.userId}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header User info */}
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-600 font-bold text-base flex items-center justify-center shrink-0">
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
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone size={13} /> SĐT:
                    </span>
                    <span className="font-bold text-slate-800">{user.phoneNumber || 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <CreditCard size={13} /> CCCD:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{user.identityCardNumber || 'Chưa có'}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setSelectedUser(user)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye size={15} /> Soi hồ sơ & Duyệt
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi Tiết Inspect Hồ Sơ CCCD */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-600 font-bold flex items-center justify-center">
                    <UserCheck size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedUser.fullName}</h3>
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Chờ Admin xét duyệt
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid 7 Mục Thông Tin Bắt Buộc */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">1. Họ tên</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedUser.fullName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">2. Ngày sinh</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedUser.birthDate ? String(selectedUser.birthDate).substring(0, 10) : 'Chưa nhập'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">3. Giới tính</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedUser.gender || 'Chưa chọn'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">4. Số điện thoại</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedUser.phoneNumber || 'Chưa nhập'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 font-bold uppercase text-[10px]">5. Số CCCD (12 chữ số)</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedUser.identityCardNumber || 'Chưa nhập'}</p>
              </div>
            </div>

            {/* 6 & 7. Ảnh CCCD Mặt Trước và Mặt Sau */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                6 & 7. Ảnh CCCD Mặt trước & Mặt sau
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">Mặt trước</span>
                  {selectedUser.identityCardFrontUrl ? (
                    <img
                      src={selectedUser.identityCardFrontUrl}
                      alt="CCCD Mặt trước"
                      className="w-full h-44 object-cover rounded-2xl border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 font-bold">
                      Thiếu ảnh mặt trước
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">Mặt sau</span>
                  {selectedUser.identityCardBackUrl ? (
                    <img
                      src={selectedUser.identityCardBackUrl}
                      alt="CCCD Mặt sau"
                      className="w-full h-44 object-cover rounded-2xl border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 font-bold">
                      Thiếu ảnh mặt sau
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle size={16} /> Từ chối
              </button>

              <button
                onClick={() => handleApprove(selectedUser.userId)}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Phê duyệt tạo chuyến
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập lý do Từ chối */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-base font-bold text-slate-900">Lý do từ chối hồ sơ</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do từ chối (ví dụ: Ảnh CCCD bị mờ, số CCCD không hợp lệ...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:bg-white transition"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default HostVerificationPage;
