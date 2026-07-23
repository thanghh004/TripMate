import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { type UserProfileResponse, UserRole } from '../../types/auth';
import { Select, type SelectOption } from '../../components/common/Select';
import {
  Users,
  Search,
  Lock,
  Unlock,
  Loader2,
  UserCheck,
  Edit3,
  X,
  Star,
  Compass,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');

  // Modals state
  const [detailUser, setDetailUser] = useState<UserProfileResponse | null>(null);
  const [editUser, setEditUser] = useState<UserProfileResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editRole, setEditRole] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<number>(0);
  const [editHostStatus, setEditHostStatus] = useState<number>(0);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch {
      toast.error('Không thể kết nối đến máy chủ Backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfileResponse) => {
    try {
      await adminApi.toggleUserStatus(user.userId);
      toast.success(`Đã cập nhật trạng thái tài khoản ${user.fullName}.`);
      fetchUsers();
    } catch {
      toast.error('Cập nhật trạng thái thất bại.');
    }
  };

  const openEditModal = (user: UserProfileResponse) => {
    setEditUser(user);
    const roleNum = typeof user.role === 'number' ? user.role : user.role === 'Admin' ? 1 : 0;
    const statusNum = user.status ?? 0;
    setEditRole(roleNum);
    setEditStatus(statusNum);
    setEditHostStatus(user.hostVerificationStatus ?? 0);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      setIsSaving(true);
      await adminApi.updateUser(editUser.userId, {
        role: editRole,
        status: editStatus,
        hostVerificationStatus: editHostStatus,
      });
      toast.success(`Đã cập nhật thông tin quản trị cho ${editUser.fullName}.`);
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error('Cập nhật thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchQuery));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && (u.status === 0 || u.status === undefined)) ||
      (statusFilter === 'Suspended' && u.status === 1);

    return matchesSearch && matchesStatus;
  });

  const statusFilterOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: 'All' },
    { label: 'Đang hoạt động', value: 'Active' },
    { label: 'Đã khóa', value: 'Suspended' },
  ];

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

  return (
    <AdminLayout>
      {/* Header Panel - Light border radius (rounded-xl) & Clean typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="space-y-0.5 text-left">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users size={20} className="text-sky-600" />
            Quản lý người dùng
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Danh sách toàn bộ tài khoản thành viên. Nhấn vào Email để xem thông tin chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên, Email, SĐT..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Custom Select Filter */}
          <div className="w-44">
            <Select
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
            />
          </div>
        </div>
      </div>

      {/* User Data Table */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-semibold text-xs">Đang tải dữ liệu người dùng...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200/80 text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy người dùng nào</h3>
          <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-5">Thành viên</th>
                  <th className="py-3.5 px-5">Email (Bấm xem chi tiết)</th>
                  <th className="py-3.5 px-5">Số điện thoại</th>
                  <th className="py-3.5 px-5">Quyền Host</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Member Info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center">
                            <UserCheck size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{user.fullName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {user.role === 'Admin' || user.role === UserRole.Admin || user.role === 1 ? (
                              <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                                Admin
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                Thành viên
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email (Clickable to view detail modal, NO icon) */}
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => setDetailUser(user)}
                        className="text-sky-600 hover:text-sky-800 font-semibold hover:underline cursor-pointer"
                        title="Bấm để xem thông tin chi tiết"
                      >
                        {user.email}
                      </button>
                    </td>

                    {/* Phone (NO icon) */}
                    <td className="py-3.5 px-5 text-slate-700 font-medium">
                      {user.phoneNumber || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                    </td>

                    {/* Host Status */}
                    <td className="py-3.5 px-5">
                      {user.hostVerificationStatus === 2 ? (
                        <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          Đã duyệt Host
                        </span>
                      ) : user.hostVerificationStatus === 1 ? (
                        <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                          Chờ duyệt
                        </span>
                      ) : user.hostVerificationStatus === 3 ? (
                        <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                          Từ chối Host
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chưa đăng ký</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      {user.status === 1 ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <Lock size={12} /> Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Hoạt động
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                          title="Chỉnh sửa quyền & trạng thái"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                            user.status === 1
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {user.status === 1 ? (
                            <>
                              <Unlock size={13} />
                              <span>Mở khóa</span>
                            </>
                          ) : (
                            <>
                              <Lock size={13} />
                              <span>Khóa</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. MODAL XEM CHI TIẾT NGƯỜI DÙNG (Khi bấm Email) */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {detailUser.avatarUrl ? (
                  <img src={detailUser.avatarUrl} alt="" className="w-11 h-11 rounded-lg object-cover border" />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 font-bold flex items-center justify-center text-base">
                    {detailUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{detailUser.fullName}</h3>
                  <p className="text-xs text-slate-500">{detailUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* General Info Grid (NO Mail/Phone icons) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-0.5">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Số điện thoại</p>
                <p className="font-semibold text-slate-900">{detailUser.phoneNumber || 'Chưa cập nhật'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-0.5">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Giới tính & Ngày sinh</p>
                <p className="font-semibold text-slate-900">
                  {detailUser.gender || 'N/A'} • {detailUser.birthDate ? String(detailUser.birthDate).substring(0, 10) : 'N/A'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-0.5">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Số CCCD định danh</p>
                <p className="font-mono font-semibold text-slate-900">{detailUser.identityCardNumber || 'Chưa đăng ký'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-0.5">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Đánh giá & Chuyến đi</p>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star size={12} /> {detailUser.avgRating || 5.0}
                  </span>
                  •
                  <span className="flex items-center gap-1 text-teal-600">
                    <Compass size={12} /> {detailUser.totalTrips || 0} Chuyến
                  </span>
                </p>
              </div>
            </div>

            {/* Bio */}
            {detailUser.bio && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <p className="text-slate-400 font-semibold text-[10px] uppercase mb-0.5">Tiểu sử (Bio)</p>
                <p className="text-slate-700 leading-relaxed font-medium">{detailUser.bio}</p>
              </div>
            )}

            {/* CCCD Photos preview if available */}
            {(detailUser.identityCardFrontUrl || detailUser.identityCardBackUrl) && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ảnh CCCD 2 mặt</p>
                <div className="grid grid-cols-2 gap-3">
                  {detailUser.identityCardFrontUrl && (
                    <img
                      src={detailUser.identityCardFrontUrl}
                      alt="Front CCCD"
                      className="w-full h-28 object-cover rounded-lg border border-slate-200"
                    />
                  )}
                  {detailUser.identityCardBackUrl && (
                    <img
                      src={detailUser.identityCardBackUrl}
                      alt="Back CCCD"
                      className="w-full h-28 object-cover rounded-lg border border-slate-200"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL CHỈNH SỬA ADMIN (Personal Info Read-only, Manage Role/Status/Host via Custom Select) */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit3 size={17} className="text-sky-600" />
                Chỉnh sửa cài đặt quản trị
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* READ-ONLY PERSONAL INFO SECTION */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Thông tin cá nhân (Read-only)</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                  Không được phép sửa
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <p className="text-slate-400 text-[10px]">Họ và tên</p>
                  <input
                    type="text"
                    disabled
                    value={editUser.fullName}
                    className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-600 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Số điện thoại</p>
                  <input
                    type="text"
                    disabled
                    value={editUser.phoneNumber || 'Chưa cập nhật'}
                    className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-600 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Giới tính</p>
                  <input
                    type="text"
                    disabled
                    value={editUser.gender || 'N/A'}
                    className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-600 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Ngày sinh</p>
                  <input
                    type="text"
                    disabled
                    value={editUser.birthDate ? String(editUser.birthDate).substring(0, 10) : 'N/A'}
                    className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-600 text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* EDITABLE ADMIN SETTINGS WITH BEAUTIFUL CUSTOM SELECT */}
            <div className="space-y-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cài đặt quản trị</p>

              {/* 1. Edit Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vai trò hệ thống</label>
                <Select
                  options={roleOptions}
                  value={editRole}
                  onChange={(val) => setEditRole(Number(val))}
                />
              </div>

              {/* 2. Edit Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái tài khoản</label>
                <Select
                  options={statusOptions}
                  value={editStatus}
                  onChange={(val) => setEditStatus(Number(val))}
                />
              </div>

              {/* 3. Edit Host Verification Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái quyền duyệt Host</label>
                <Select
                  options={hostStatusOptions}
                  value={editHostStatus}
                  onChange={(val) => setEditHostStatus(Number(val))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagementPage;
