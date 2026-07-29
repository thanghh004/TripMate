import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { AlertTriangle, CheckSquare, Square, Loader2 } from 'lucide-react';

interface RejectTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const PRESET_REASONS = [
  'Thông tin chuyến đi chưa rõ ràng / thiếu lịch trình chi tiết',
  'Hình ảnh bìa / bộ sưu tập không hợp lệ (chất lượng kém hoặc không liên quan)',
  'Chi phí ước tính hoặc yêu cầu thành viên chưa hợp lý',
  'Địa điểm khởi hành hoặc điểm đến không an toàn / có rủi ro',
  'Nội dung chuyến đi vi phạm tiêu chuẩn cộng đồng TripMate',
];

export const RejectTripModal: React.FC<RejectTripModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleReason = (reason: string) => {
    setError('');
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Gom toàn bộ lý do đã chọn và lý do nhập tay
    const allReasons = [...selectedReasons];
    if (customReason.trim()) {
      allReasons.push(customReason.trim());
    }

    if (allReasons.length === 0) {
      setError('Vui lòng chọn ít nhất 1 lý do có sẵn hoặc nhập lý do chi tiết.');
      return;
    }

    const finalReasonString = allReasons.join('; ');

    try {
      setIsSubmitting(true);
      await onConfirm(finalReasonString);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Từ chối phê duyệt chuyến đi"
      maxWidth="lg"
      position="center"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans">
        <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 space-y-0.5">
            <p className="font-bold">Xác nhận từ chối chuyến đi này</p>
            <p className="text-rose-700/90 font-medium">
              Vui lòng chọn lý do cụ thể bên dưới. Thông báo lý do từ chối sẽ được gửi trực tiếp cho Người tổ chức (Host).
            </p>
          </div>
        </div>

        {/* Danh sách lý do có sẵn (Chọn được nhiều checkbox) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lý do từ chối có sẵn (Có thể chọn nhiều) <span className="text-rose-500">*</span>
          </label>

          <div className="space-y-2">
            {PRESET_REASONS.map((reason, idx) => {
              const isChecked = selectedReasons.includes(reason);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                    isChecked
                      ? 'bg-rose-50/80 border-rose-300 text-rose-900'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare size={18} className="text-rose-600 shrink-0" />
                  ) : (
                    <Square size={18} className="text-slate-300 shrink-0" />
                  )}
                  <span>{reason}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ghi chú lý do bổ sung */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ghi chú lý do bổ sung (Tùy chọn)
          </label>
          <textarea
            rows={3}
            value={customReason}
            onChange={(e) => {
              setError('');
              setCustomReason(e.target.value);
            }}
            placeholder="Gõ lý do chi tiết khác nếu có..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400 transition resize-none"
          />
        </div>

        {/* Thông báo lỗi validation */}
        {error && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Hủy bỏ
          </button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang từ chối...
              </>
            ) : (
              'Xác nhận từ chối'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectTripModal;
