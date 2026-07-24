import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Compass,
  LogOut,
  Sparkles,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  MapPin,
  Settings,
} from 'lucide-react';

interface AdminSidebarProps {
  pendingCount?: number;
}

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ pendingCount }) => {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const navigate = useNavigate();
  const location = useLocation();

  const [internalPendingCount, setInternalPendingCount] = useState<number>(pendingCount ?? 0);

  // Accordion state for System Admin group
  const isSystemPath =
    location.pathname.startsWith('/admin/countries') ||
    location.pathname.startsWith('/admin/cities');

  const [isSystemOpen, setIsSystemOpen] = useState<boolean>(isSystemPath);

  useEffect(() => {
    if (isSystemPath) {
      setIsSystemOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (pendingCount !== undefined) {
      setInternalPendingCount(pendingCount);
    }
    adminApi
      .getPendingVerifications()
      .then((res) => {
        const count = Array.isArray(res.data) ? res.data.length : 0;
        setInternalPendingCount(count);
      })
      .catch(() => {
        // ignore
      });
  }, [pendingCount]);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogout = () => {
    authContext?.logout();
    navigate('/');
  };

  const mainNavItems = [
    {
      to: '/admin',
      label: 'Tổng quan hệ thống',
      icon: <LayoutDashboard size={18} />,
      end: true,
    },
    {
      to: '/admin/host-verifications',
      label: 'Duyệt quyền tạo chuyến',
      icon: <ShieldCheck size={18} />,
      badge: internalPendingCount > 0 ? internalPendingCount : undefined,
    },
    {
      to: '/admin/users',
      label: 'Quản lý người dùng',
      icon: <Users size={18} />,
    },
    {
      to: '/admin/trips',
      label: 'Quản lý chuyến đi',
      icon: <Compass size={18} />,
    },
  ];

  const systemNavItems = [
    {
      to: '/admin/countries',
      label: 'Quản lý quốc gia',
      icon: <Globe size={16} />,
    },
    {
      to: '/admin/cities',
      label: 'Quản lý thành phố',
      icon: <MapPin size={16} />,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Satisfy&display=swap');
        .font-logo { font-family: 'Satisfy', cursive; }
      `}</style>

      <aside
        className={`relative bg-white text-slate-900 flex flex-col h-screen sticky top-0 border-r border-slate-200/80 shrink-0 select-none shadow-xs transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Nút đóng/mở sidebar */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition cursor-pointer"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* 1. Header Sidebar */}
        <div
          className={`p-6 border-b border-slate-100 flex items-center ${
            collapsed ? 'justify-center px-3' : 'justify-between'
          }`}
        >
          {collapsed ? (
            <NavLink to="/admin" className="flex items-center justify-center">
              <span className="font-logo text-[26px] font-normal text-slate-900 leading-none">
                T
              </span>
            </NavLink>
          ) : (
            <NavLink to="/admin" className="flex items-center gap-2.5 min-w-0">
              <span className="font-logo text-[28px] font-normal text-slate-900 leading-none shrink-0">
                TripMate
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-coral-50 text-coral-600 border border-coral-200/80 tracking-widest flex items-center gap-1 shrink-0">
                <Sparkles size={10} /> Admin
              </span>
            </NavLink>
          )}
        </div>

        {/* 2. Menu Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Danh mục quản lý
            </div>
          )}

          {/* Main Nav Items */}
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `relative flex items-center px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border ${
                  collapsed ? 'justify-center' : 'justify-between'
                } ${
                  isActive
                    ? 'bg-coral-50 text-coral-600 border-coral-200/80 font-extrabold shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                {item.icon}
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </div>

              {item.badge !== undefined && !collapsed && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-coral-500 text-white animate-pulse shrink-0">
                  {item.badge}
                </span>
              )}

              {item.badge !== undefined && collapsed && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral-500 animate-pulse" />
              )}
            </NavLink>
          ))}

          {/* Sub Menu: Quản trị hệ thống */}
          <div className="pt-2">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Hệ thống
              </div>
            )}

            <button
              onClick={() => setIsSystemOpen(!isSystemOpen)}
              title={collapsed ? 'Quản trị hệ thống' : undefined}
              className={`w-full flex items-center px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                collapsed ? 'justify-center' : 'justify-between'
              } ${
                isSystemPath
                  ? 'text-coral-600 bg-coral-50/50 border-coral-100'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                <Settings size={18} />
                {!collapsed && <span className="whitespace-nowrap">Quản trị hệ thống</span>}
              </div>

              {!collapsed && (
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${
                    isSystemOpen ? 'rotate-180 text-coral-600' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {/* Sub items dropdown */}
            {(isSystemOpen || collapsed) && (
              <div className={`mt-1 space-y-1 ${collapsed ? '' : 'pl-4 border-l-2 border-slate-100 ml-5'}`}>
                {systemNavItems.map((subItem) => (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    title={collapsed ? subItem.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        collapsed ? 'justify-center' : 'gap-2.5'
                      } ${
                        isActive
                          ? 'bg-coral-50 text-coral-600 border-coral-200/80 font-extrabold shadow-xs'
                          : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    {subItem.icon}
                    {!collapsed && <span className="whitespace-nowrap">{subItem.label}</span>}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* 3. Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          <div className={`flex items-center gap-3 px-2 py-1 ${collapsed ? 'justify-center' : ''}`}>
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="Admin Avatar"
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                <UserCheck size={18} />
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.fullName || 'Administrator'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  Quản trị viên hệ thống
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Đăng xuất Quản trị' : undefined}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-rose-200/80 cursor-pointer`}
          >
            <LogOut size={15} />
            {!collapsed && <span className="whitespace-nowrap">Đăng xuất Quản trị</span>}
          </button>
        </div>
      </aside>
    </>
  );
};