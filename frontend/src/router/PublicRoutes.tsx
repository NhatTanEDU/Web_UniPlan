import React from 'react';
import { Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResetPassword from '../pages/auth/ResetPassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import DashboardBefore from '../pages/Dashboard_before';
import AuthenticatedHome from '../pages/AuthenticatedHome';
import PricingPage from '../pages/PricingPage';
import Support from '../pages/Support';
import SubscriptionPlans from '../pages/Subscription/SubscriptionPlans';
import PaymentResult from '../pages/Subscription/PaymentResult';

const PublicRoutes = () => (
  <>
    <Route path="/" element={<DashboardBefore />} />
    <Route path="/home" element={<AuthenticatedHome />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/pricingPage" element={<PricingPage />} />
    <Route path="/support" element={<Support />} />
    <Route path="/DashboardBefore" element={<DashboardBefore />} />
    <Route path="/subscription/plans" element={<SubscriptionPlans />} />
    <Route path="/subscription/result" element={<PaymentResult />} />
  </>
);

export default PublicRoutes;
