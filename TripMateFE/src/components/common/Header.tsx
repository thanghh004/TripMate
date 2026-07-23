import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tripApi } from '../../api/tripApi';
import { LogOut, Search, MessageSquare, Bell, Plus, Settings, Compass, Loader2 } from 'lucide-react';

export const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCheckingHostPermission, setIsCheckingHostPermission] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCreateTripClick = async () => {
    setShowDropdown(false);
    setIsCheckingHostPermission(true);
    try {
      // Gửi API Backend POST /api/trips kiểm tra phân quyền bảo mật 100% tại CSDL Backend
      const res = await tripApi.createTrip({ title: 'Chuyến đi mới' });
      if (res.status === 200) {
        // Đã duyệt (Approved) / Admin: Chuyển thẳng sang trang tạo chuyến luôn, không hiện thông báo
        navigate('/create-trip');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Tài khoản của bạn không có đủ thẩm quyền để tạo chuyến đi mới.';
      
      // Bật Toast Notification chuẩn UI/UX của dự án
      if (errorMsg.includes('chờ Admin xét duyệt')) {
        toast.warning(errorMsg);
      } else {
        toast.error(errorMsg);
      }

      if (errorMsg.includes('chưa đăng ký') || errorMsg.includes('Chưa đăng ký')) {
        navigate('/profile');
      }
    } finally {
      setIsCheckingHostPermission(false);
    }
  };

  // Click outside listener to automatically close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Satisfy&display=swap');
        .font-logo { font-family: 'Satisfy', cursive; }
      `}</style>

      {/* 1. Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-50 px-6 py-4 transition-all">
        <div className="w-full flex items-center justify-between px-2 sm:px-4">
          {/* Logo & Left Navigation Elements */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 font-logo text-3xl text-slate-800 transition-colors select-none">
              TripMate
            </Link>

            {/* Dribbble Search Bar & Menu Items */}
            <div className="hidden md:flex items-center gap-6">
              {/* Search Bar */}
              <div className="flex items-center bg-slate-200/80 rounded-full pl-4 pr-1.5 py-1.5 border border-transparent focus-within:border-slate-300/40 focus-within:bg-slate-50 transition-all w-[320px] lg:w-[380px]">
                <input
                  type="text"
                  placeholder="Tìm kiếm địa điểm bạn muốn đến "
                  className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
                />
                <button className="w-9 h-9 rounded-full bg-[#ea4c89] hover:bg-[#df3f7c] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0">
                  <Search size={16} />
                </button>
              </div>

              {/* Menu Links */}
              <nav className="hidden lg:flex items-center gap-7">
                <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                  Trang chủ
                </Link>
                <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                  Khám phá
                </a>
                <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                  Tuyển dụng
                </a>
                <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                  Tìm việc làm
                </a>
                <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                  Cộng đồng
                </a>
              </nav>
            </div>
          </div>

          {/* User Auth Action / User Profile */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4 relative">
                {/* Message Icon */}
                <button className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer relative p-2 rounded-full hover:bg-slate-200/60 select-none">
                  <MessageSquare size={19} />
                </button>

                {/* Bell Icon with dot */}
                <button className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer relative p-2 rounded-full hover:bg-slate-200/60 select-none">
                  <Bell size={19} />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-coral-500" />
                </button>

                {/* User Avatar & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-10 h-10 rounded-full bg-coral-500 text-white font-bold text-sm flex items-center justify-center shadow-xs border border-slate-200 cursor-pointer relative focus:outline-none select-none transition-transform active:scale-95 overflow-visible"
                    aria-label="User Menu"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.fullName.charAt(0).toUpperCase()
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  </button>

                  {/* Dropdown Menu (Dribbble Style) */}
                  {showDropdown && (
                    <>
                      {/* Invisible Backdrop to close dropdown on click outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                      />

                      <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2.5 z-50 flex flex-col select-none animate-in fade-in duration-150">
                        {/* Actions & Links */}
                        <div className="w-full space-y-1.5 text-left">
                          {/* Create Trip Action inside Dropdown */}
                          <button
                            onClick={handleCreateTripClick}
                            disabled={isCheckingHostPermission}
                            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left cursor-pointer disabled:opacity-60"
                          >
                            {isCheckingHostPermission ? (
                              <Loader2 size={15} className="animate-spin text-coral-500" />
                            ) : (
                              <Plus size={15} />
                            )}
                            <span>Tạo chuyến đi mới</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate('/my-trips');
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Compass size={15} />
                            <span>Chuyến đi của tôi</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate('/profile');
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Settings size={15} />
                            <span>Cài đặt</span>
                          </button>
                        </div>

                        <hr className="w-full border-slate-100 my-2.5" />

                        {/* Sign Out */}
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            authContext?.logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={15} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 h-10">
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer select-none"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-900/80 rounded-full transition-all shadow-xs cursor-pointer select-none"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
