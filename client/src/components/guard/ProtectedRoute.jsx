import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-600">Đang xác thực thông tin...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Điều hướng người dùng về trang chủ phù hợp với vai trò của họ
    if (user.role === 'STUDENT') {
      return <Navigate to="/student/surveys" replace />;
    }
    return <Navigate to="/staff/surveys" replace />;
  }

  return children;
}
