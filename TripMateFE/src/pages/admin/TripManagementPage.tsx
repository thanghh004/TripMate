import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import SearchInput from '../../components/common/SearchInput';
import { Select, type SelectOption } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import { Pagination } from '../../components/common/Pagination';
import { UserDetailModal } from './user-manager/UserDetailModal';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../api/adminApi';
import { userApi } from '../../api/userApi';
import type { Trip } from '../../types/trip';
import type { AdminUserListItem } from '../../types/admin';
import { formatDate } from '../../utils/formatters';
import { Compass, Loader2, MapPin, ArrowRight, User, AlertCircle } from 'lucide-react';

const statusOptions: SelectOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '0', label: 'Đang chờ duyệt' },
  { value: '1', label: 'Đang mở đăng ký' },
  { value: '2', label: 'Đã đủ thành viên' },
  { value: '3', label: 'Đang diễn ra' },
  { value: '4', label: 'Đã hoàn thành' },
  { value: '5', label: 'Đã hủy' },
  { value: '7', label: 'Bị từ chối' },
];

export const TripManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // User Detail Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAllTrips();
      setTrips(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách chuyến đi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Lọc dữ liệu client-side
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      !searchTerm.trim() ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organizerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedStatus || t.status.toString() === selectedStatus;

    const matchesStartDate =
      !startDateFilter ||
      new Date(t.startDate).toISOString().slice(0, 10) === startDateFilter;

    return matchesSearch && matchesStatus && matchesStartDate;
  });

  // Chia trang
  const totalItems = filteredTrips.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTrips = filteredTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Xử lý xem thông tin chi tiết Người tổ chức (Host)
  const handleViewHostDetail = async (userId: string) => {
    try {
      setIsLoadingUserDetail(true);
      const res = await userApi.getUserById(userId);
      setSelectedUser(res.data);
    } catch {
      toast.error('Không thể lấy thông tin người dùng.');
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  // Helper render Trạng thái chuẩn Tiếng Việt
  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">Đang chờ duyệt</span>;
      case 1:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">Đang mở đăng ký</span>;
      case 2:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">Đã đủ thành viên</span>;
      case 3:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">Đang diễn ra</span>;
      case 4:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Đã hoàn thành</span>;
      case 5:
      case 7:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">Đã hủy / Bị từ chối</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">Đang mở đăng ký</span>;
    }
  };

  return (
    <AdminLayout>
      {/* HEADER PANEL (GOM TIÊU ĐỀ + 3 Ô LỌC CÙNG 1 HÀNG CHUẨN XÁC VỚI CÁC TRANG ADMIN KHÁC) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-left">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Compass size={20} className="text-coral-500" />
            Quản lý Chuyến đi
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Danh sách toàn bộ chuyến đi trên hệ thống TripMate
          </p>
        </div>

        {/* CÙNG HÀNG: SearchInput, Select lọc trạng thái, DatePicker lọc ngày xuất phát */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo chuyến đi hoặc Host..."
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              placeholder="Tất cả trạng thái"
            />
          </div>

          <div className="w-full sm:w-44">
            <DatePicker
              value={startDateFilter}
              onChange={(val) => {
                setStartDateFilter(val);
                setCurrentPage(1);
              }}
              placeholder="Ngày khởi hành"
            />
          </div>
        </div>
      </div>

      {/* DATA TABLE (4 CỘT) */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin text-coral-500" />
          <span className="text-xs font-semibold">Đang tải danh sách chuyến đi...</span>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy chuyến đi nào</h3>
          <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-5 w-[35%]">Cột 1: Tên chuyến đi</th>
                  <th className="py-3.5 px-5 w-[25%]">Cột 2: Người tổ chức (Host)</th>
                  <th className="py-3.5 px-5 w-[25%]">Cột 3: Hành trình & Ngày xuất phát</th>
                  <th className="py-3.5 px-5 w-[15%] text-right">Cột 4: Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {paginatedTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Cột 1: Tên chuyến đi */}
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="font-bold text-slate-900 hover:text-coral-600 transition text-left cursor-pointer line-clamp-2 block"
                      >
                        {trip.title}
                      </button>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Danh mục: {trip.categoryName || 'Chuyến đi'}
                      </span>
                    </td>

                    {/* Cột 2: Người tổ chức (Host) */}
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => handleViewHostDetail(trip.organizerId)}
                        className="inline-flex items-center gap-2 hover:text-coral-600 transition cursor-pointer text-left group"
                      >
                        {trip.organizerAvatarUrl ? (
                          <img
                            src={trip.organizerAvatarUrl}
                            alt={trip.organizerName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-coral-50 text-coral-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {trip.organizerName ? trip.organizerName.charAt(0).toUpperCase() : <User size={14} />}
                          </div>
                        )}
                        <span className="font-bold text-slate-800 group-hover:text-coral-600 underline-offset-2 group-hover:underline">
                          {trip.organizerName}
                        </span>
                      </button>
                    </td>

                    {/* Cột 3: Hành trình & Ngày xuất phát */}
                    <td className="py-3.5 px-5 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
                        <MapPin size={13} className="text-coral-500 shrink-0" />
                        <span className="truncate">{trip.startLocation}</span>
                        <ArrowRight size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{trip.destination}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        Khởi hành: <strong className="text-slate-700">{formatDate(trip.startDate)}</strong>
                      </div>
                    </td>

                    {/* Cột 4: Trạng thái */}
                    <td className="py-3.5 px-5 text-right">
                      {renderStatusBadge(trip.status)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPONENT PHÂN TRANG CHUẨN */}
      {!isLoading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Modal Chi tiết Người dùng tái sử dụng từ admin/users */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Indicator khi đang tải thông tin User */}
      {isLoadingUserDetail && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-2xs flex items-center justify-center">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <Loader2 size={18} className="animate-spin text-coral-500" /> Đang tải thông tin người dùng...
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TripManagementPage;
