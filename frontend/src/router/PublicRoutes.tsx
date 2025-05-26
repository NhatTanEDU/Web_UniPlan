import React from 'react';
import { Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResetPassword from '../pages/auth/ResetPassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import DashboardBefore from '../pages/Dashboard_before';
import PricingPage from '../pages/PricingPage';
import Support from '../pages/Support';

const PublicRoutes = () => (
  <>
    <Route path="/" element={<DashboardBefore />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/pricingPage" element={<PricingPage />} />
    <Route path="/support" element={<Support />} />
    <Route path="/DashboardBefore" element={<DashboardBefore />} />
  </>
);

export default PublicRoutes;
