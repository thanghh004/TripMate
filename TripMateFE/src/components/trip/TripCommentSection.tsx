import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import type { TripComment } from '../../types/trip';
import { formatRelativeTime } from '../../utils/formatters';
import Image from '../common/Image';
import { Send, Trash2, Loader2, MessageCircle } from 'lucide-react';

interface TripCommentSectionProps {
  tripId: string;
  organizerId?: string;
  initialCommentCount?: number;
}

export const TripCommentSection: React.FC<TripCommentSectionProps> = ({
  tripId,
  organizerId,
  initialCommentCount = 0,
}) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<TripComment[]>([]);
  const [commentCount, setCommentCount] = useState<number>(initialCommentCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputContent, setInputContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const list = await tripApi.getComments(tripId);
      setComments(list || []);
      setCommentCount(list?.length || 0);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bình luận:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOpen && comments.length === 0) {
      fetchComments();
    }
    setIsOpen(!isOpen);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để bình luận!');
      navigate('/login');
      return;
    }

    const content = inputContent.trim();
    if (!content) return;

    try {
      setIsSubmitting(true);
      const newComment = await tripApi.addComment(tripId, content);
      setComments((prev) => [...prev, newComment]);
      setCommentCount((prev) => prev + 1);
      setInputContent('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi bình luận.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();

    try {
      await tripApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((prev) => Math.max(0, prev - 1));
      toast.success('Đã xóa bình luận.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa bình luận.');
    }
  };

  return (
    <div className="w-full text-left" onClick={(e) => e.stopPropagation()}>
      {/* Nút Toggle Khung Bình Luận */}
      <button
        onClick={handleToggleComments}
        className={`flex items-center gap-1.5 font-bold text-xs transition cursor-pointer select-none ${
          isOpen ? 'text-coral-500' : 'text-slate-600 hover:text-coral-500'
        }`}
        title="Bình luận bài viết"
      >
        <MessageCircle size={18} />
        <span>{commentCount}</span>
      </button>

      {/* KHUNG BÌNH LUẬN FACEBOOK STYLE (Bật/Tắt mượt mà) */}
      {isOpen && (
        <div className="pt-3.5 mt-3 border-t border-slate-100 space-y-3.5 text-xs animate-fadeIn">
          {/* Form Nhập Bình Luận Style Facebook */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
            {isAuthenticated && user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt="Me"
                containerClassName="w-8 h-8 rounded-full border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-600 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'}
              </div>
            )}

            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? 'Viết bình luận của bạn...'
                    : 'Đăng nhập để tham gia bình luận...'
                }
                disabled={!isAuthenticated || isSubmitting}
                className="w-full bg-slate-100/90 border border-slate-200/80 rounded-full pl-4 pr-10 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-coral-400 transition"
              />

              <button
                type="submit"
                disabled={!isAuthenticated || !inputContent.trim() || isSubmitting}
                className="absolute right-1.5 p-1.5 text-coral-600 hover:text-coral-700 disabled:opacity-30 transition cursor-pointer"
                title="Gửi bình luận"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
          </form>

          {/* Danh Sách Bình Luận Style Facebook Bubble */}
          {isLoading ? (
            <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
              <Loader2 size={15} className="animate-spin text-coral-500" /> Đang tải bình luận...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-2 text-center text-slate-400 text-[11px] font-medium italic">
              Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const currentUserId = user?.userId;
                const isMyComment = currentUserId && comment.userId === currentUserId;
                const isTripHost = currentUserId && organizerId === currentUserId;
                const isAdmin = user && (user.role === 'Admin' || user.role === 1 || user.role === '1');
                const canDelete = isMyComment || isTripHost || isAdmin;

                return (
                  <div key={comment.id} className="flex items-start gap-2.5 group">
                    {/* User Avatar */}
                    {comment.userAvatarUrl ? (
                      <Image
                        src={comment.userAvatarUrl}
                        alt={comment.userName}
                        containerClassName="w-8 h-8 rounded-full border border-slate-200 shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}

                    {/* Comment Content Bubble */}
                    <div className="flex-1 space-y-1">
                      <div className="inline-block bg-slate-100/90 hover:bg-slate-100 px-3.5 py-2 rounded-2xl rounded-tl-none space-y-0.5 max-w-full">
                        <div className="font-bold text-slate-900 text-xs">
                          {comment.userName}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal break-words whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {/* Footer Comment: Thời gian & Nút Xóa */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pl-2">
                        <span>{formatRelativeTime(comment.createdAt)}</span>

                        {canDelete && (
                          <button
                            onClick={(e) => handleDeleteComment(e, comment.id)}
                            className="text-slate-400 hover:text-rose-600 font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer flex items-center gap-1"
                            title="Xóa bình luận"
                          >
                            <Trash2 size={11} /> Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripCommentSection;
