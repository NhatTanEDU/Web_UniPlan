import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import DashboardRoutes from './DashboardRoutes';
import AdminRoutes from './AdminRoutes';
import NotFoundRoutes from './NotFoundRoutes';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import EmployeesList from '../components/After/tab/members/members';

const AppRoutes = () => {
  return (
    <Routes>
      {PublicRoutes()}
      {DashboardRoutes()}
      {AdminRoutes()}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/employees" element={<EmployeesList />} />
      {NotFoundRoutes()}
    </Routes>
  );
};

export default AppRoutes;
