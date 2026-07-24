import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi, type AdminStatsResponse } from '../../api/adminApi';
import {
  Users,
  Compass,
  ShieldAlert,
  UserCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStatsResponse>({
    totalUsers: 0,
    totalOrganizers: 0,
    totalTrips: 0,
    pendingVerifications: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data);
      } catch {
        // Fallback demo values if API is not yet live
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      desc: 'Tài khoản thành viên',
      icon: <Users size={24} className="text-sky-600" />,
      bg: 'bg-sky-50 border-sky-100',
    },
    {
      title: 'Người tổ chức (Host)',
      value: stats.totalOrganizers,
      desc: 'Đã duyệt tạo chuyến',
      icon: <UserCheck size={24} className="text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Yêu cầu chờ duyệt',
      value: stats.pendingVerifications,
      desc: 'Hồ sơ CCCD mới',
      icon: <ShieldAlert size={24} className="text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
      highlight: true,
      onClick: () => navigate('/admin/host-verifications'),
    },
    {
      title: 'Tổng số chuyến đi',
      value: stats.totalTrips,
      desc: 'Hành trình ghép nhóm',
      icon: <Compass size={24} className="text-purple-600" />,
      bg: 'bg-purple-50 border-purple-100',
    },
  ];

  return (
    <AdminLayout pendingCount={stats.pendingVerifications}>
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-500/20 text-coral-400 text-xs font-bold border border-coral-500/30">
            <Sparkles size={13} /> Dashboard Tổng Quan
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Chào mừng trở lại, Quản trị viên!
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Hệ thống đang ghi nhận <b className="text-amber-400 font-bold">{stats.pendingVerifications} yêu cầu</b> duyệt quyền tạo chuyến mới.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/host-verifications')}
          className="self-start sm:self-center px-5 py-3 rounded-2xl bg-gradient-to-r from-coral-500 to-amber-500 hover:scale-[1.02] transition-transform text-white font-bold text-xs shadow-lg shadow-coral-500/25 flex items-center gap-2 cursor-pointer"
        >
          <span>Duyệt yêu cầu ngay</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className={`p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all space-y-4 ${
              card.onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl border ${card.bg}`}>{card.icon}</div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500" /> Tự động
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{card.value}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Card 1: Nhiệm vụ chính */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-coral-500" /> Nhiệm vụ chờ xử lý
            </h3>
            <span className="text-xs font-bold text-coral-600 bg-coral-50 px-2.5 py-1 rounded-full">
              {stats.pendingVerifications} Việc
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900">Duyệt hồ sơ định danh CCCD</p>
              <p className="text-[11px] text-amber-700 font-medium">
                Kiểm tra 7 thông tin cá nhân và 2 mặt CCCD của người dùng xin quyền làm Host.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/host-verifications')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer shrink-0"
            >
              Xử lý
            </button>
          </div>
        </div>

        {/* Card 2: Lối tắt quản lý */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-teal-600" /> Phân vùng Quản trị
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-left transition cursor-pointer"
            >
              <Users size={20} className="text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-900">Quản lý User</p>
              <p className="text-[10px] text-slate-500">Khóa / Mở tài khoản</p>
            </button>

            <button
              onClick={() => navigate('/admin/trips')}
              className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-left transition cursor-pointer"
            >
              <Compass size={20} className="text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-900">Quản lý Chuyến đi</p>
              <p className="text-[10px] text-slate-500">Kiểm duyệt bài đăng</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
