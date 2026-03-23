import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PatientsPage from '../pages/PatientsPage';
import PatientDetailPage from '../pages/PatientDetailPage';
import DoctorsPage from '../pages/DoctorsPage';
import DoctorDetailPage from '../pages/DoctorDetailPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import MedicalHistoryPage from '../pages/MedicalHistoryPage';
import ProfilePage from '../pages/ProfilePage';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        <Route path="patients" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'reception']}>
            <PatientsPage />
          </ProtectedRoute>
        } />
        <Route path="patients/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'reception']}>
            <PatientDetailPage />
          </ProtectedRoute>
        } />
        <Route path="doctors" element={
          <ProtectedRoute allowedRoles={['admin', 'reception']}>
            <DoctorsPage />
          </ProtectedRoute>
        } />
        <Route path="doctors/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'reception']}>
            <DoctorDetailPage />
          </ProtectedRoute>
        } />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="history" element={<MedicalHistoryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRouter;
