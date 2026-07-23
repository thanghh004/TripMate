import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 sm:p-10 font-sans selection:bg-coral-500 selection:text-white">
      <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in duration-200">
        
        {/* 1. Vector Illustration 404 Not Found (Map, Compass & Lost Pointer) */}
        <div className="relative w-full max-w-xl mx-auto flex items-center justify-center select-none">
          <svg
            viewBox="0 0 500 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-sm"
          >
            {/* Background Soft Coral Circle */}
            <circle cx="250" cy="180" r="140" fill="#FFEDD5" />

            {/* Map Sheet (Background) */}
            <rect
              x="140"
              y="90"
              width="220"
              height="160"
              rx="12"
              fill="white"
              stroke="#1E293B"
              strokeWidth="4"
            />
            <path d="M210 90V250" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="6 6" />
            <path d="M290 90V250" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="6 6" />

            {/* Dotted Route Line */}
            <path
              d="M170 210C190 170 230 220 270 150C290 120 320 160 330 140"
              stroke="#F97316"
              strokeWidth="4"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />

            {/* Text ERROR 404 NOT FOUND */}
            <text
              x="300"
              y="110"
              fontSize="16"
              fontWeight="bold"
              fill="#9A3412"
              letterSpacing="2"
            >
              ERROR
            </text>
            <text
              x="290"
              y="165"
              fontSize="64"
              fontWeight="900"
              fill="#1E293B"
            >
              404
            </text>
            <text
              x="292"
              y="195"
              fontSize="16"
              fontWeight="bold"
              fill="#9A3412"
              letterSpacing="2"
            >
              NOT FOUND
            </text>

            {/* Lost Location Marker Pin */}
            <g id="LocationPin">
              <path
                d="M215 125C200 125 188 137 188 152C188 175 215 205 215 205C215 205 242 175 242 152C242 137 230 125 215 125Z"
                fill="#EF4444"
                stroke="#1E293B"
                strokeWidth="4"
              />
              <circle cx="215" cy="150" r="8" fill="white" />
              {/* Question mark inside pin */}
              <text x="212" y="154" fontSize="12" fontWeight="bold" fill="#EF4444">?</text>
            </g>

            {/* Ground Line */}
            <line x1="130" y1="300" x2="420" y2="300" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        {/* 2. Text Message */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
          <p className="text-xs font-bold text-slate-400">
            (Trang bạn tìm kiếm không tồn tại hoặc đã dời sang địa chỉ khác)
          </p>
        </div>

        {/* 3. Action Buttons - Icon and Text strictly aligned in 1 row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
            className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-7 py-3.5 rounded-2xl cursor-pointer"
          >
            Quay lại trang trước
          </Button>
          <Button
            onClick={() => navigate('/')}
            leftIcon={<Home size={18} />}
            className="w-full sm:w-auto bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white font-bold text-xs px-7 py-3.5 rounded-2xl cursor-pointer shadow-md shadow-coral-500/20"
          >
            Trở về Trang chủ
          </Button>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default NotFoundPage;
