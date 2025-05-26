import React from 'react';
import { Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import UserManagement from '../pages/Admin/UserManagement';
import AdminDashboardPage from '../pages/Admin/DashboardAdmin';

const AdminRoutes = () => (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboardPage />} />
    <Route path="users" element={<UserManagement />} />
    {/* Thêm các route admin khác tại đây */}
  </Route>
);

export default AdminRoutes;
