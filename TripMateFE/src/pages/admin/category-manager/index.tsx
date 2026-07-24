import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { tripCategoryApi } from '../../../api/tripCategoryApi';
import { useToast } from '../../../context/ToastContext';
import type { TripCategory } from '../../../types/tripCategory';
import Button from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { CategoryDetailModal } from './CategoryDetailModal';
import { CreateCategoryModal } from './CreateCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import {
  Tag,
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';

const CategoryManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<TripCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [detailCategory, setDetailCategory] = useState<TripCategory | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<TripCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<TripCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await tripCategoryApi.getCategories();
      setCategories(data || []);
    } catch {
      toast.error('Không thể tải danh sách loại chuyến đi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      setIsDeleting(true);
      await tripCategoryApi.deleteCategory(deleteCategory.id);
      toast.success(`Đã xóa loại chuyến đi "${deleteCategory.name}".`);
      setDeleteCategory(null);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa loại chuyến đi này.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AdminLayout>
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="space-y-0.5 text-left">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Tag size={20} className="text-coral-500" />
            Quản lý loại chuyến đi
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Bấm vào Tên loại để xem thông tin chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, slug..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <Button
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus size={16} />}
            className="bg-coral-500 hover:bg-coral-600 text-white font-bold rounded-xl px-4 py-2 text-xs shrink-0 cursor-pointer shadow-xs"
          >
            Thêm loại chuyến đi
          </Button>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-coral-500" />
          <p className="text-slate-500 font-semibold text-xs">Đang tải dữ liệu...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200/80 text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy loại chuyến đi nào</h3>
          <p className="text-xs text-slate-500">Thử tìm kiếm khác hoặc bấm Thêm loại.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-5">Icon</th>
                  <th className="py-3.5 px-5">Tên loại chuyến đi (Bấm xem chi tiết)</th>
                  <th className="py-3.5 px-5 font-mono">Slug URL</th>
                  <th className="py-3.5 px-5 text-center">Thứ tự</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginatedCategories.map((c) => (
                  <tr key={c.id} className={`transition-colors ${c.isDeleted ? 'bg-slate-50/40' : 'hover:bg-slate-50/60'}`}>
                    <td className="py-3.5 px-5">
                      {c.icon ? (
                        <span className="text-xl">{c.icon}</span>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-coral-50 border border-coral-100 flex items-center justify-center text-coral-500 shrink-0">
                          <Tag size={16} />
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => setDetailCategory(c)}
                        className="text-sky-600 hover:text-sky-800 font-semibold hover:underline cursor-pointer text-left"
                        title="Bấm để xem thông tin chi tiết"
                      >
                        {c.name}
                      </button>
                      {c.description && (
                        <p className="text-slate-400 font-normal text-[11px] truncate max-w-[180px] mt-0.5">{c.description}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-600 text-[11px] font-semibold">
                      {c.slug || <span className="text-slate-400 font-normal italic">Chưa có</span>}
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
                        <button
                          onClick={() => setEditCategory(c)}
                          disabled={c.isDeleted}
                          className={`p-1.5 rounded-lg border transition ${
                            c.isDeleted
                              ? 'border-slate-200 text-slate-300 opacity-40 cursor-not-allowed'
                              : 'border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer'
                          }`}
                          title={c.isDeleted ? 'Mục này đã bị xóa, không thể chỉnh sửa' : 'Chỉnh sửa'}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteCategory(c)}
                          disabled={c.isDeleted}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition flex items-center gap-1 ${
                            c.isDeleted
                              ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-40 cursor-not-allowed'
                              : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer'
                          }`}
                          title={c.isDeleted ? 'Mục này đã bị xóa' : 'Xóa loại chuyến đi'}
                        >
                          <Trash2 size={13} />
                          <span>Xóa</span>
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

      {/* Pagination */}
      {!isLoading && filteredCategories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCategories.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Modals */}
      {detailCategory && (
        <CategoryDetailModal category={detailCategory} onClose={() => setDetailCategory(null)} />
      )}

      {createModalOpen && (
        <CreateCategoryModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={fetchData}
        />
      )}

      {editCategory && (
        <EditCategoryModal
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCategory && (
        <Modal
          isOpen
          onClose={() => setDeleteCategory(null)}
          title="Xác nhận xóa loại chuyến đi"
          maxWidth="sm"
          position="top"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa loại chuyến đi <strong className="text-slate-900">{deleteCategory.name}</strong> khỏi hệ thống?
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteCategory(null)}
                className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận Xóa'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default CategoryManagementPage;
