import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { adminApi } from '../../../api/adminApi';
import { useToast } from '../../../context/ToastContext';
import { type AdminUserListItem } from '../../../types/admin';
import { Select, type SelectOption } from '../../../components/common/Select';
import SearchInput from '../../../components/common/SearchInput';
import Button from '../../../components/common/Button';
import { Pagination } from '../../../components/common/Pagination';
import { UserDetailModal } from './UserDetailModal';
import { EditUserModal } from './EditUserModal';
import {
  Users,
  Lock,
  Unlock,
  Loader2,
  UserCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const statusFilterOptions: SelectOption[] = [
  { label: 'Tất cả trạng thái', value: 'All' },
  { label: 'Đang hoạt động', value: 'Active' },
  { label: 'Đã khóa', value: 'Suspended' },
];

const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailUser, setDetailUser] = useState<AdminUserListItem | null>(null);
  const [editUser, setEditUser] = useState<AdminUserListItem | null>(null);

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

  const handleToggleStatus = async (user: AdminUserListItem) => {
    try {
      await adminApi.toggleUserStatus(user.userId);
      toast.success(`Đã cập nhật trạng thái tài khoản ${user.fullName}.`);
      fetchUsers();
    } catch {
      toast.error('Cập nhật trạng thái thất bại.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phoneNumber?.includes(searchQuery) ?? false);

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && u.status === 0) ||
      (statusFilter === 'Suspended' && u.status === 1);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AdminLayout>
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-0.5 text-left">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users size={20} className="text-sky-600" />
            Quản lý người dùng
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Bấm vào Email để xem thông tin chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo Tên, Email, SĐT..."
            containerClassName="w-full sm:w-64"
          />

          <div className="w-44">
            <Select
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as 'All' | 'Active' | 'Suspended')}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-semibold text-xs">Đang tải dữ liệu người dùng...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy người dùng nào</h3>
          <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden text-left">
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
                {paginatedUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt=""
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center">
                            <UserCheck size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{user.fullName}</p>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Thành viên
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => setDetailUser(user)}
                        className="text-sky-600 hover:text-sky-800 font-semibold hover:underline cursor-pointer"
                        title="Bấm để xem thông tin chi tiết"
                      >
                        {user.email}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-slate-700">
                      {user.phoneNumber || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                    </td>

                    <td className="py-3.5 px-5">
                      {user.hostVerificationStatus === 2 ? (
                        <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">Đã duyệt Host</span>
                      ) : user.hostVerificationStatus === 1 ? (
                        <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">Chờ duyệt</span>
                      ) : user.hostVerificationStatus === 3 ? (
                        <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">Từ chối</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chưa đăng ký</span>
                      )}
                    </td>

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

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditUser(user)}
                          className="px-2.5 py-1.5 rounded-lg border-slate-300 hover:bg-slate-100 text-slate-700"
                          title="Chỉnh sửa quyền & trạng thái"
                        >
                          <Edit3 size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={user.status === 1 ? <Unlock size={13} /> : <Lock size={13} />}
                          onClick={() => handleToggleStatus(user)}
                          className={user.status === 1
                            ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold px-3 py-1.5 rounded-lg transition'
                            : 'border-rose-300 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold px-3 py-1.5 rounded-lg transition'
                          }
                        >
                          {user.status === 1 ? 'Mở khóa' : 'Khóa'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}

      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSuccess={fetchUsers} />}
    </AdminLayout>
  );
};

export default UserManagementPage;
