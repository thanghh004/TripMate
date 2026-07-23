import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import ScrollToTop from '../common/ScrollToTop';

import { UserRole } from '../../types/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  pendingCount?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pendingCount }) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const currentUser = authContext?.user;
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === UserRole.Admin || currentUser?.role === 1;

  // Guard: Chuyển hướng về trang login nếu chưa đăng nhập, hoặc về trang chủ nếu không phải Admin
  useEffect(() => {
    if (authContext && !authContext.isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (currentUser && !isAdmin) {
        navigate('/');
      }
    }
  }, [authContext, isAuthenticated, currentUser, isAdmin, navigate]);

  if (!isAuthenticated || !currentUser || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-coral-500 selection:text-white">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar pendingCount={pendingCount} />

      {/* Vùng nội dung chính bên phải */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto bg-slate-50/70 p-8">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
};
