import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from '../../components/common/SearchInput';
import { Select, type SelectOption } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import Pagination from '../../components/common/Pagination';
import { UserDetailModal } from './user-manager/UserDetailModal';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../api/adminApi';
import { userApi } from '../../api/userApi';
import type { Trip } from '../../types/trip';
import type { AdminUserListItem } from '../../types/admin';
import { formatDate } from '../../utils/formatters';
import { Compass, Loader2, MapPin, ArrowRight, User } from 'lucide-react';

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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Đang chờ duyệt</span>;
      case 1:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Đang mở đăng ký</span>;
      case 2:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Đã đủ thành viên</span>;
      case 3:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Đang diễn ra</span>;
      case 4:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">Đã hoàn thành</span>;
      case 5:
      case 7:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Đã hủy / Bị từ chối</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Đang mở đăng ký</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 text-left max-w-[1400px] mx-auto">
      {/* Header Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Compass className="text-coral-500" /> Quản lý Chuyến đi
          </h1>
          <p className="text-xs text-slate-500 font-medium">Danh sách toàn bộ chuyến đi trên hệ thống TripMate</p>
        </div>
      </div>

      {/* FILTER HEADER BAR (Tìm kiếm, Trạng thái, Ngày xuất phát) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-5">
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên chuyến đi hoặc tên Host..."
          />
        </div>

        <div className="sm:col-span-4">
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

        <div className="sm:col-span-3">
          <DatePicker
            value={startDateFilter}
            onChange={(val) => {
              setStartDateFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Lọc theo ngày khởi hành"
          />
        </div>
      </div>

      {/* DATA TABLE (4 CỘT) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-coral-500" />
            <span className="text-xs font-semibold">Đang tải danh sách chuyến đi...</span>
          </div>
        ) : paginatedTrips.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-semibold">
            Không tìm thấy chuyến đi nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-[35%]">Cột 1: Tên chuyến đi</th>
                  <th className="py-3.5 px-4 w-[25%]">Cột 2: Người tổ chức (Host)</th>
                  <th className="py-3.5 px-4 w-[25%]">Cột 3: Hành trình & Ngày xuất phát</th>
                  <th className="py-3.5 px-4 w-[15%] text-right">Cột 4: Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Cột 1: Tên chuyến đi */}
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 space-y-1">
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
                    <td className="py-3.5 px-4 text-right">
                      {renderStatusBadge(trip.status)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COMPONENT PHÂN TRANG CHUẨN */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize) || 1}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

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
    </div>
  );
};

export default TripManagementPage;
