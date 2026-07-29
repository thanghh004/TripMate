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
import type { Trip } from '../../types/trip';
import { TripStatus as TripStatusEnum } from '../../types/trip';
import type { AdminUserListItem } from '../../types/admin';
import { formatDate } from '../../utils/formatters';
import { Compass, Loader2, MapPin, ArrowRight, AlertCircle } from 'lucide-react';

const statusOptions: SelectOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: String(TripStatusEnum.PendingReview), label: 'Đang chờ duyệt' },
  { value: String(TripStatusEnum.Open), label: 'Đang nhận đăng ký' },
  { value: String(TripStatusEnum.Full), label: 'Đã đủ thành viên' },
  { value: String(TripStatusEnum.Ongoing), label: 'Đang diễn ra' },
  { value: String(TripStatusEnum.Completed), label: 'Hoàn thành' },
  { value: String(TripStatusEnum.Cancelled), label: 'Đã hủy' },
  { value: String(TripStatusEnum.Rejected), label: 'Bị từ chối' },
  { value: String(TripStatusEnum.Failed), label: 'Tạo thất bại' },
];

export const TripManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUserListItem[]>([]);
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

  const fetchTripsAndUsers = async () => {
    try {
      setIsLoading(true);
      const [tripsData, usersRes] = await Promise.all([
        adminApi.getAllTrips(),
        adminApi.getUsers().catch(() => ({ data: [] })),
      ]);

      setTrips(tripsData || []);
      setAllUsers(usersRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách chuyến đi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndUsers();
  }, []);

  // Lọc dữ liệu client-side
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      !searchTerm.trim() ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organizerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedStatus ||
      String(t.status) === selectedStatus ||
      (selectedStatus === String(TripStatusEnum.Open) && t.status === TripStatusEnum.Approved);

    const matchesStartDate =
      !startDateFilter ||
      (t.startDate && t.startDate.substring(0, 10) === startDateFilter);

    return matchesSearch && matchesStatus && matchesStartDate;
  });

  // Chia trang
  const totalItems = filteredTrips.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTrips = filteredTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Xử lý xem thông tin chi tiết Người tổ chức (Host) từ danh sách Users đã load
  const handleViewHostDetail = (organizerId: string, organizerName: string) => {
    setIsLoadingUserDetail(true);
    try {
      // Tìm user trong danh sách allUsers
      const foundUser = allUsers.find((u) => u.userId === organizerId);
      if (foundUser) {
        setSelectedUser(foundUser);
      } else {
        // Fallback tạo object cơ bản nếu không tìm thấy
        setSelectedUser({
          userId: organizerId,
          fullName: organizerName,
          email: 'Chưa cập nhật',
          phoneNumber: 'Chưa cập nhật',
          gender: 'Nam',
          birthDate: new Date().toISOString(),
          identityCardNumber: 'Chưa cập nhật',
          role: 'Member',
          status: 0,
          hostVerificationStatus: 2,
          avgRating: 5.0,
          totalTrips: 0,
          createdCompletedTripsCount: 0,
          createdUncompletedTripsCount: 0,
          joinedCompletedTripsCount: 0,
          joinedUncompletedTripsCount: 0
        });
      }
    } catch {
      toast.error('Không thể lấy thông tin người dùng.');
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  const renderStatusBadge = (status: number) => {
    switch (status) {
      case TripStatusEnum.PendingReview:
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            Đang chờ duyệt
          </span>
        );
      case TripStatusEnum.Approved:
      case TripStatusEnum.Open:
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Đang nhận đăng ký
          </span>
        );
      case TripStatusEnum.Full:
        return (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
            Đã đủ thành viên
          </span>
        );
      case TripStatusEnum.Ongoing:
        return (
          <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            Đang diễn ra
          </span>
        );
      case TripStatusEnum.Completed:
        return (
          <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">
            Hoàn thành
          </span>
        );
      case TripStatusEnum.Cancelled:
        return (
          <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
            Đã hủy
          </span>
        );
      case TripStatusEnum.Rejected:
        return (
          <span className="text-[11px] font-bold text-rose-800 bg-rose-200 px-3 py-1 rounded-full">
            Bị từ chối
          </span>
        );
      case TripStatusEnum.Failed:
        return (
          <span className="text-[11px] font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
            Tạo thất bại
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Đang nhận đăng ký
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      {/* HEADER PANEL (GOM TIÊU ĐỀ + NHÓM BỘ LỌC CÙNG 1 HÀNG CHUẨN XÁC) */}
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

        {/* CÙNG HÀNG: Ô tìm kiếm + Nhóm bộ lọc (Lọc Ngày khởi hành trước -> Select Trạng thái sau) */}
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

          {/* Ô lọc theo ngày khởi hành (Chuyển vào bên trong) */}
          <div className="w-full sm:w-40">
            <DatePicker
              value={startDateFilter}
              onChange={(val) => {
                setStartDateFilter(val);
                setCurrentPage(1);
              }}
              onClear={() => {
                setStartDateFilter('');
                setCurrentPage(1);
              }}
              placeholder="Ngày khởi hành"
            />
          </div>

          {/* Ô chọn lọc theo trạng thái (Chuyển ra ngoài cùng) */}
          <div className="w-full sm:w-44">
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
          <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-5 w-[35%]">Tên chuyến đi</th>
                  <th className="py-3.5 px-5 w-[25%]">Người tổ chức (Host)</th>
                  <th className="py-3.5 px-5 w-[25%]">Hành trình & Ngày xuất phát</th>
                  <th className="py-3.5 px-5 w-[15%] text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {paginatedTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Cột 1: Tên chuyến đi (Dạng link chữ sky-600 hover:underline dẫn tới trang AdminTripDetailPage) */}
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/trips/${trip.id}`)}
                        className="text-sky-600 font-semibold hover:underline cursor-pointer text-left line-clamp-2 block"
                        title="Bấm để xem chi tiết chuyến đi"
                      >
                        {trip.title}
                      </button>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Danh mục: {trip.categoryName || 'Chuyến đi'}
                      </span>
                    </td>

                    {/* Cột 2: Người tổ chức (BỎ HẲN AVATAR, DẠNG LINK CHỮ sky-600 HOVER:UNDERLINE SANG MODAL) */}
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => handleViewHostDetail(trip.organizerId, trip.organizerName)}
                        className="text-sky-600 font-semibold hover:underline cursor-pointer text-left block"
                        title="Bấm để xem thông tin người dùng"
                      >
                        {trip.organizerName}
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
