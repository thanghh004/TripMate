import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import { Heart } from 'lucide-react';

interface TripLikeButtonProps {
  tripId: string;
  initialIsLiked?: boolean;
  initialLikeCount?: number;
  className?: string;
}

export const TripLikeButton: React.FC<TripLikeButtonProps> = ({
  tripId,
  initialIsLiked = false,
  initialLikeCount = 0,
  className = '',
}) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thả tim bài viết!');
      navigate('/login');
      return;
    }

    // Trigger Heart Pop Animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Optimistic UI update
    const prevLiked = isLiked;
    const prevCount = likeCount;

    setIsLiked(!prevLiked);
    setLikeCount(!prevLiked ? prevCount + 1 : Math.max(0, prevCount - 1));

    try {
      const res = await tripApi.toggleLike(tripId);
      setIsLiked(res.isLiked);
    } catch (err) {
      // Revert if error
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error('Không thể thực hiện thao tác thả tim.');
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      className={`flex items-center gap-1.5 font-bold text-xs transition cursor-pointer select-none ${
        isLiked ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'
      } ${className}`}
      title={isLiked ? 'Bỏ thích' : 'Thích bài viết'}
    >
      <Heart
        size={18}
        className={`transition-all duration-200 ${
          isLiked ? 'fill-rose-500 text-rose-500' : ''
        } ${isAnimating ? 'scale-130' : 'scale-100'}`}
      />
      <span>{likeCount}</span>
    </button>
  );
};

export default TripLikeButton;
