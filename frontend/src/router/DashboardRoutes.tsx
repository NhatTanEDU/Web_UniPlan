import React from 'react';
import { Route } from 'react-router-dom';
import DashboardAfter from '../pages/Dasboard_After';
import ProjectPage from '../components/After/tab/Project';
import DocumentsPage from '../components/After/tab/documents/documents';
import TeamPage from '../components/After/tab/teams/teams';
import ChatPage from '../components/After/tab/chat/chat';
import Kanban from '../components/After/tab/Kanban/Kanban';
import ReportPage from '../components/After/tab/reports/reports';
import TeamOverviewPage from "../components/After/tab/teams/pages/TeamOverview";
import TeamDetailPage from "../components/After/tab/teams/pages/TeamDetail";
import AccountPage from '../pages/AccountPage';
import Profile from '../pages/Profile';
const DashboardRoutes = () => (
  <>
    <Route path="/dashboard/:userId" element={<DashboardAfter />} />
    <Route path="/projects" element={<ProjectPage />} />
    <Route path="/documents" element={<DocumentsPage />} />
    <Route path="/teams" element={<TeamPage />} />    <Route path="/chat" element={<ChatPage />} />
    <Route path="/reports" element={<ReportPage />} />
    <Route path="/account" element={<AccountPage />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/projects/:projectId/kanban" element={<Kanban />} />
    {/* Team routes */}
    <Route path="/teams" element={<TeamOverviewPage />} />
    <Route path="/teams/:teamId/*" element={<TeamDetailPage />} />
  </>
);

export default DashboardRoutes;
