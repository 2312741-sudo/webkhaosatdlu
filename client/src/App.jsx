import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/guard/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import StudentSurveysPage from './pages/student/StudentSurveysPage';
import TakeSurveyPage from './pages/student/TakeSurveyPage';
import SurveySuccessPage from './pages/student/SurveySuccessPage';
import SurveyListPage from './pages/staff/SurveyListPage';
import SurveyEditorPage from './pages/staff/SurveyEditorPage';
import QuestionBuilderPage from './pages/staff/QuestionBuilderPage';
import SurveyAnalyticsPage from './pages/analytics/SurveyAnalyticsPage';
import SurveyHistoryPage from './pages/analytics/SurveyHistoryPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';

function HomeRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user.role === 'STUDENT') {
    return <Navigate to="/student/surveys" replace />;
  }
  return <Navigate to="/staff/surveys" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Student Flow */}
          <Route
            path="/student/surveys"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}>
                <StudentSurveysPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/survey/:identifier"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}>
                <TakeSurveyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/survey-success"
            element={<SurveySuccessPage />}
          />

          {/* Staff Flow */}
          <Route
            path="/staff/surveys"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <SurveyListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/surveys/create"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <SurveyEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/surveys/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <SurveyEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/surveys/:surveyId/questions"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <QuestionBuilderPage />
              </ProtectedRoute>
            }
          />

          {/* Analytics & Reports */}
          <Route
            path="/analytics/history"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <SurveyHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/:surveyId"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <SurveyAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Management */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
