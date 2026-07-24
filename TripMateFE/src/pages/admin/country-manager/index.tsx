import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { locationApi } from '../../../api/locationApi';
import { useToast } from '../../../context/ToastContext';
import type { Country } from '../../../types/location';
import Button from '../../../components/common/Button';
import SearchInput from '../../../components/common/SearchInput';
import { Modal } from '../../../components/common/Modal';
import { CountryDetailModal } from './CountryDetailModal';
import { CreateCountryModal } from './CreateCountryModal';
import { EditCountryModal } from './EditCountryModal';
import { Pagination } from '../../../components/common/Pagination';
import {
  Globe,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';

const CountryManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailCountry, setDetailCountry] = useState<Country | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [deleteCountry, setDeleteCountry] = useState<Country | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const data = await locationApi.getCountries();
      setCountries(data || []);
    } catch {
      toast.error('Không thể tải danh sách quốc gia.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleDelete = async () => {
    if (!deleteCountry) return;
    try {
      setIsDeleting(true);
      await locationApi.deleteCountry(deleteCountry.id);
      toast.success(`Đã xóa quốc gia ${deleteCountry.name}.`);
      setDeleteCountry(null);
      fetchCountries();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa quốc gia này.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCountries = countries.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredCountries.length / pageSize);
  const paginatedCountries = filteredCountries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AdminLayout>
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-0.5 text-left">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Globe size={20} className="text-sky-600" />
            Quản lý quốc gia
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Bấm vào Tên quốc gia để xem thông tin chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo Tên, Mã ISO..."
            containerClassName="w-full sm:w-64"
          />

          <Button
            size="sm"
            variant="warning"
            leftIcon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            className="shrink-0 font-bold px-4 py-2 text-xs cursor-pointer shadow-2xs"
          >
            Thêm quốc gia
          </Button>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-semibold text-xs">Đang tải dữ liệu quốc gia...</p>
        </div>
      ) : filteredCountries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy quốc gia nào</h3>
          <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm quốc gia.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-5">Quốc gia</th>
                  <th className="py-3.5 px-5">Tên quốc gia (Bấm xem chi tiết)</th>
                  <th className="py-3.5 px-5">Mã ISO</th>
                  <th className="py-3.5 px-5 text-center">Thứ tự</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginatedCountries.map((c) => (
                  <tr key={c.id} className={`transition-colors ${c.isDeleted ? 'bg-slate-50/40' : 'hover:bg-slate-50/60'}`}>
                    <td className="py-3.5 px-5">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                        {c.flagIcon ? c.flagIcon : c.name.charAt(0)}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => setDetailCountry(c)}
                        className="text-sky-600 hover:text-sky-800 font-semibold hover:underline cursor-pointer text-left"
                        title="Bấm để xem thông tin chi tiết"
                      >
                        {c.name}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-700 font-semibold">
                      {c.code || <span className="text-slate-400 font-normal italic">Chưa có</span>}
                    </td>

                    <td className="py-3.5 px-5 text-center font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <ArrowUpDown size={12} className="text-slate-400" />
                        {c.displayOrder}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      {c.isDeleted ? (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <XCircle size={12} /> Đã xóa
                        </span>
                      ) : c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <XCircle size={12} /> Dừng hoạt động
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditCountry(c)}
                          disabled={c.isDeleted}
                          className="p-1.5 rounded-lg border-slate-300 hover:bg-slate-100 text-slate-700"
                          title={c.isDeleted ? 'Mục này đã bị xóa, không thể chỉnh sửa' : 'Chỉnh sửa thông tin'}
                        >
                          <Edit3 size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Trash2 size={13} />}
                          onClick={() => setDeleteCountry(c)}
                          disabled={c.isDeleted}
                          className={c.isDeleted
                            ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-40 cursor-not-allowed px-2.5 py-1'
                            : 'border-rose-300 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold px-2.5 py-1 transition'
                          }
                          title={c.isDeleted ? 'Mục này đã bị xóa' : 'Xóa quốc gia'}
                        >
                          Xóa
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
      {!isLoading && filteredCountries.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCountries.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}

      {detailCountry && (
        <CountryDetailModal country={detailCountry} onClose={() => setDetailCountry(null)} />
      )}

      {createModalOpen && (
        <CreateCountryModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={fetchCountries}
        />
      )}

      {editCountry && (
        <EditCountryModal
          country={editCountry}
          onClose={() => setEditCountry(null)}
          onSuccess={fetchCountries}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCountry && (
        <Modal
          isOpen
          onClose={() => setDeleteCountry(null)}
          title="Xác nhận xóa quốc gia"
          maxWidth="sm"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa quốc gia <strong className="text-slate-900">{deleteCountry.name}</strong> khỏi hệ thống?
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteCountry(null)}
                className="px-5 py-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                variant="danger"
                isLoading={isDeleting}
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 font-semibold disabled:opacity-60"
              >
                Xác nhận Xóa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default CountryManagementPage;
