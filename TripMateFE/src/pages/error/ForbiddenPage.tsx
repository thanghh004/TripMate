import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '../../components/common/ScrollToTop';
import Button from '../../components/common/Button';
import { Home, LogIn } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 sm:p-10 font-sans selection:bg-sky-500 selection:text-white">
      <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in duration-200">
        
        {/* 1. Vector Illustration 403 Forbidden (Lock, Security Officer, Barrier & Traffic Cone) */}
        <div className="relative w-full max-w-xl mx-auto flex items-center justify-center select-none">
          <svg
            viewBox="0 0 500 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-sm"
          >
            {/* Background Soft Blue Circle */}
            <circle cx="250" cy="180" r="140" fill="#DCE9FE" />

            {/* Lock (Left background) */}
            <path
              d="M170 140V110C170 85 190 65 215 65C240 65 260 85 260 110V140"
              stroke="#2B364B"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <rect
              x="160"
              y="135"
              width="110"
              height="100"
              rx="16"
              fill="white"
              stroke="#2B364B"
              strokeWidth="5"
            />
            <circle cx="215" cy="175" r="10" fill="#2B364B" />
            <path
              d="M215 185V205"
              stroke="#2B364B"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Text ERROR 403 FORBIDDEN (Right Top) */}
            <text
              x="300"
              y="110"
              fontSize="16"
              fontWeight="bold"
              fill="#2B364B"
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
              403
            </text>
            <text
              x="292"
              y="195"
              fontSize="16"
              fontWeight="bold"
              fill="#2B364B"
              letterSpacing="2"
            >
              FORBIDDEN
            </text>

            {/* Security Officer (Center) */}
            <g id="Officer">
              {/* Body / Legs */}
              <path d="M225 240L215 310H235L245 240" fill="#1E293B" />
              <path d="M255 240L265 310H285L275 240" fill="#1E293B" />

              {/* Shirt & Tie */}
              <path
                d="M205 155L245 150L285 155L280 235H210L205 155Z"
                fill="#3B82F6"
              />
              <path d="M241 155L249 155L247 210L245 220L243 210Z" fill="#1E293B" />

              {/* Belt */}
              <rect x="210" y="230" width="70" height="10" fill="#1E293B" />
              <rect x="238" y="231" width="14" height="8" fill="#F59E0B" />

              {/* Raised Hand (Stop signal) */}
              <path
                d="M275 160L295 130L295 110"
                stroke="#3B82F6"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <g id="Hand">
                <rect x="285" y="90" width="22" height="26" rx="4" fill="#E2E8F0" stroke="#1E293B" strokeWidth="3" />
                <line x1="291" y1="90" x2="291" y2="105" stroke="#1E293B" strokeWidth="2" />
                <line x1="296" y1="90" x2="296" y2="106" stroke="#1E293B" strokeWidth="2" />
                <line x1="301" y1="90" x2="301" y2="105" stroke="#1E293B" strokeWidth="2" />
              </g>

              {/* Head & Cap */}
              <circle cx="245" cy="125" r="16" fill="#FED7AA" />
              <path d="M230 115C230 102 260 102 260 115Z" fill="#1E293B" />
              <path d="M225 115H265" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
              <circle cx="245" cy="110" r="4" fill="#F59E0B" />
            </g>

            {/* Barrier (Front Line) */}
            <g id="Barrier">
              <path d="M170 205L185 310H195L180 205Z" fill="#64748B" />
              <path d="M315 205L300 310H290L305 205Z" fill="#64748B" />
              <rect x="150" y="205" width="200" height="22" fill="#3B82F6" rx="3" />
              <path d="M165 205L180 227H195L180 205Z" fill="#1E293B" />
              <path d="M210 205L225 227H240L225 205Z" fill="#1E293B" />
              <path d="M255 205L270 227H285L270 205Z" fill="#1E293B" />
              <path d="M300 205L315 227H330L315 205Z" fill="#1E293B" />
            </g>

            {/* Traffic Cone (Right Side) */}
            <g id="Cone">
              <path d="M340 310L360 225H375L395 310H340Z" fill="#3B82F6" />
              <path d="M352 270H383L387 285H348L352 270Z" fill="white" />
              <path d="M358 245H377L380 255H355L358 245Z" fill="white" />
              <rect x="330" y="305" width="75" height="8" rx="3" fill="#1E293B" />
            </g>

            {/* Ground Line */}
            <line x1="140" y1="310" x2="410" y2="310" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        {/* 2. Text Message */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            You are not authorized
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            You tried to access a page you did not have prior authorization for.
          </p>
          <p className="text-xs font-bold text-slate-400">
            (Bạn không có quyền truy cập vào trang này)
          </p>
        </div>

        {/* 3. Action Buttons - Icon and Text strictly aligned in 1 row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            leftIcon={<Home size={18} />}
            className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-7 py-3.5 rounded-2xl cursor-pointer"
          >
            Quay về Trang chủ
          </Button>
          <Button
            onClick={() => navigate('/login')}
            leftIcon={<LogIn size={18} />}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-7 py-3.5 rounded-2xl cursor-pointer shadow-md shadow-slate-900/10"
          >
            Đăng nhập tài khoản khác
          </Button>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default ForbiddenPage;