import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const AdminRoute: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (authContext?.isLoading) {
    return null;
  }

  const user = authContext?.user;
  const isAdmin =
    user?.role === 1 ||
    user?.role === '1' ||
    user?.role === 'Admin' ||
    String(user?.role).toLowerCase() === 'admin';

  // Chưa đăng nhập -> Chuyển về login
  if (!authContext?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng KHÔNG PHẢI Admin -> Chuyển về Forbidden (403) hoặc Trang chủ (/)
  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
