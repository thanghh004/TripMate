import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Compass, Search, MapPin, Calendar, Users, Trash2 } from 'lucide-react';

const TripManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock demo trips data
  const trips = [
    {
      id: '1',
      title: 'Chinh phục đỉnh Fansipan - Sapa 3N2Đ',
      startLocation: 'Hà Nội',
      destination: 'Sapa, Lào Cai',
      startDate: '2026-08-15',
      organizerName: 'Nguyễn Văn Thắng',
      currentMembers: 3,
      maxMembers: 6,
      status: 'Open',
    },
  ];

  return (
    <AdminLayout>
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1 text-left">
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass size={22} className="text-purple-600" />
            Quản lý chuyến đi (Trips Management)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kiểm duyệt và quản lý các hành trình du lịch ghép nhóm do Organizer tạo.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tiêu đề, Điểm đến..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6">Tên chuyến đi</th>
                <th className="py-4 px-6">Hành trình</th>
                <th className="py-4 px-6">Người tổ chức</th>
                <th className="py-4 px-6">Thành viên</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{trip.title}</td>
                  <td className="py-4 px-6 space-y-1 text-slate-600">
                    <p className="flex items-center gap-1 font-medium">
                      <MapPin size={13} className="text-coral-500" /> {trip.destination}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar size={12} /> Khởi hành: {trip.startDate}
                    </p>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{trip.organizerName}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">
                    <span className="flex items-center gap-1">
                      <Users size={13} className="text-slate-400" /> {trip.currentMembers}/{trip.maxMembers}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đang nhận thành viên
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TripManagementPage;
