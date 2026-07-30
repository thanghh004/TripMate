import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const UserOnlyRoute: React.FC = () => {
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

  // Nếu là Admin cố truy cập trang Client/User -> Chuyển ngay về trang Admin
  if (authContext?.isAuthenticated && isAdmin) {
    return <Navigate to="/admin/users" replace />;
  }

  return <Outlet />;
};

export default UserOnlyRoute;
