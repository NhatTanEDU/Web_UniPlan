// src/components/After/tab/teams/pages/TeamDetail.tsx
import React from "react";
import { NavLink, Routes, Route, Navigate, useParams } from "react-router-dom";
import {
  Users, Settings, FolderOpen, Info, Crown, Shield, Calendar, TrendingUp, Edit3, FileText
} from "lucide-react";

// Hooks để lấy dữ liệu
import { useTeam } from "../hooks/useTeam"; // Trả về { team, loading, error }
import { useTeamMembers } from "../hooks/useTeamMembers";
import { useTeamProjects } from "../hooks/useTeamProjects";
import { useTeamDocuments } from "../hooks/useTeamDocuments";

// Component con cho các tab
import TeamMembersPage from "../pages/TeamMembers";
import TeamProjectsPage from "../pages/TeamProjects"; // Giả sử TeamProjectsPageProps được export
import TeamSettingsPage from "../pages/TeamSettings"; // Giả sử TeamSettingsPageProps được export
import TeamDocuments from "../pages/TeamDocuments";

// SỬA ĐƯỜNG DẪN CHO ĐÚNG
import LoadingSpinner from "../components/LoadingSpinner"; // Ví dụ: lên 1 cấp, vào components
import Sidebar from "../../../Sidebar";
import Header from "../../../Header";
import Breadcrumb from "../../../Breadcrumb";
import Footer from "../../../../Footer";
import TopButton from "../../../../TopButton";


// Import các kiểu dữ liệu từ tệp type (ĐIỀU CHỈNH ĐƯỜNG DẪN NÀY CHO ĐÚNG)
import {
  Team as TeamFromApiService // Đổi tên kiểu Team import từ service để tránh xung đột nếu cần
} from "../../../../../services/teamApi"; // Đường dẫn đến teamApi.ts

// Bạn có thể muốn định nghĩa lại hoặc mở rộng các kiểu này trong file types/teamTypes.ts nếu cần
// Hiện tại, chúng ta sẽ dùng trực tiếp kiểu từ teamApi.ts nếu nó đã đủ chi tiết

// --- Kết thúc phần import ---

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  // 1. Lấy thông tin team chính từ useTeam
  // Hook useTeam trả về { team: Team | null, loading, error }
  // `team` ở đây là kiểu `Team` đã được map trong `teamApi.ts`
  const { team: fetchedTeamObject, loading: teamLoading, error: teamError } = useTeam();

  // 2. Lấy danh sách thành viên - call hooks before any conditional returns
  const { members: membersData, loading: membersLoading, error: membersError } = useTeamMembers(teamId || '');

  // 3. Lấy danh sách dự án
  const { projects: projectsData, loading: projectsLoading, error: projectsError } = useTeamProjects(teamId || '');

  // 4. Lấy danh sách tài liệu
  const { documents: documentsData, loading: documentsLoading, error: documentsError, refetchDocuments } = useTeamDocuments(teamId);

  if (!teamId) { // Xử lý trường hợp không có teamId sau khi gọi hooks
      return (
          <div>
              <p>ID của nhóm không được cung cấp.</p>
          </div>
      );
  }
  const loading = teamLoading || membersLoading || projectsLoading || documentsLoading;
  const overallError = teamError || membersError || projectsError || documentsError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumb items={["Dashboard", "Quản lý nhóm", "Đang tải chi tiết..."]} />
          <main className="flex-1 overflow-y-auto p-4">
            <LoadingSpinner text="Đang tải thông tin chi tiết nhóm..." />
          </main>
          <Footer onFooterClick={() => {}} />
          <TopButton />
        </div>
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumb items={["Dashboard", "Quản lý nhóm", "Lỗi"]} />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">Lỗi: {overallError}</div>
              <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-700">Thử lại</button>
            </div>
          </main>
          <Footer onFooterClick={() => {}} />
          <TopButton />
        </div>
      </div>
    );
  }

  if (!fetchedTeamObject) { // Kiểm tra fetchedTeamObject thay vì teamId (vì teamId luôn có ở đây)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumb items={["Dashboard", "Quản lý nhóm", "Không tìm thấy"]} />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy thông tin nhóm.</p>
            </div>
          </main>
          <Footer onFooterClick={() => {}} />
          <TopButton />
        </div>
      </div>
    );
  }

  // Giờ đây, fetchedTeamObject có kiểu là `Team` từ `teamApi.ts`
  // Nó đã được map `team_name` thành `name` và `createdAt`/`updatedAt` thành Date object
  const teamDisplayData: TeamFromApiService = fetchedTeamObject; // Sử dụng trực tiếp

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'editor': return <Edit3 className="h-4 w-4 text-orange-500" />;
      case 'leader': return <Crown className="h-4 w-4 text-yellow-500" />; // Nếu có vai trò leader
      default: return <Users className="h-4 w-4 text-gray-500" />; // Member hoặc khác
    }
  };

  const base = `/teams/${teamDisplayData._id}`;

  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };
  const memberCount = membersData?.length || 0;
  const projectCount = projectsData?.length || 0;
  const documentCount = documentsData?.length || 0;

  // Sử dụng teamDisplayData.type đã được map trong teamApi.ts
  const isTeamPublic = teamDisplayData.type === 'Public';
  const teamColor = teamDisplayData.color || '#3B82F6'; // Nếu Team interface có color

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Quản lý nhóm", teamDisplayData.name || "Chi tiết nhóm"]} />

        <main className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Team Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: teamColor }}
                  >
                    {teamDisplayData.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{teamDisplayData.name}</h1>
                      {getRoleIcon(teamDisplayData.userRole)}
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                        {teamDisplayData.userRole || 'Member'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {teamDisplayData.description || "Chưa có mô tả"}
                    </p>                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1"> <Users className="h-4 w-4" /> <span>{memberCount} thành viên</span> </div>
                      <div className="flex items-center gap-1"> <FolderOpen className="h-4 w-4" /> <span>{projectCount} dự án</span> </div>
                      <div className="flex items-center gap-1"> <FileText className="h-4 w-4" /> <span>{documentCount} tài liệu</span> </div>
                      <div className="flex items-center gap-1"> <Calendar className="h-4 w-4" /> <span>Tạo ngày {new Date(teamDisplayData.createdAt).toLocaleDateString()}</span> </div>
                      {teamDisplayData.completionRate !== undefined && (
                        <div className="flex items-center gap-1"> <TrendingUp className="h-4 w-4" /> <span>{teamDisplayData.completionRate}% hoàn thành</span> </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${ isTeamPublic ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                    {isTeamPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">              <nav className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  <NavLink to={`${base}/info`} className={({isActive}) => `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${ isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}><Info className="h-4 w-4" />Thông tin</NavLink>
                  <NavLink to={`${base}/members`} className={({isActive}) => `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${ isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}><Users className="h-4 w-4" />Thành viên</NavLink>
                  <NavLink to={`${base}/projects`} className={({isActive}) => `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${ isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}><FolderOpen className="h-4 w-4" />Dự án</NavLink>
                  <NavLink to={`${base}/documents`} className={({isActive}) => `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${ isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}><FileText className="h-4 w-4" />Tài liệu</NavLink>
                  <NavLink to={`${base}/settings`} className={({isActive}) => `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${ isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}><Settings className="h-4 w-4" />Cài đặt</NavLink>
              </nav>              <div className="p-6">                <Routes>
                  <Route path="" element={<Navigate to="info" replace />} />
                  <Route path="info" element={<TeamInfoTab team={teamDisplayData} membersCount={memberCount} projectsCount={projectCount} documentsCount={documentCount} />} />
                  {/* Các component con này cần được định nghĩa để nhận props teamId và tự fetch dữ liệu bên trong nếu cần */}
                  <Route path="members" element={<TeamMembersPage />} />
                  <Route path="projects" element={<TeamProjectsPage />} />
                  <Route path="documents" element={<TeamDocuments documents={documentsData} refetch={refetchDocuments} />} />
                  <Route path="settings" element={<TeamSettingsPage />} />
                </Routes>
              </div>
            </div>
          </div>
        </main>

        <Footer onFooterClick={handleFooterClick} />
        <TopButton />
      </div>
    </div>
  );
}

// Team Info Tab Component
interface TeamInfoTabProps {
  team: TeamFromApiService; // Sử dụng kiểu Team từ teamApi.ts (đã được map)
  membersCount: number;
  projectsCount: number;
  documentsCount: number;
}
const TeamInfoTab: React.FC<TeamInfoTabProps> = ({ team, membersCount, projectsCount, documentsCount }) => {
  const isTeamPublic = team.type === 'Public'; // type đã được map trong teamApi.ts
  const completionRate = team.completionRate; // Cần API trả về trường này trong team object

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin cơ bản</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên nhóm</label>
              <p className="text-gray-900 dark:text-white">{team.name}</p> {/* name đã được map */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
              <p className="text-gray-600 dark:text-gray-400">{team.description || "Chưa có mô tả"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại nhóm</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${ isTeamPublic ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                {isTeamPublic ? 'Công khai' : 'Riêng tư'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày tạo</label>
              <p className="text-gray-600 dark:text-gray-400">{team.createdAt ? new Date(team.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
        {/* Statistics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thống kê</h3>          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"> <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" /> <span>Thành viên</span></div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{membersCount}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"> <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" /> <span>Dự án</span></div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{projectsCount}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"> <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" /> <span>Tài liệu</span></div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{documentsCount}</p>
            </div>
            {completionRate !== undefined && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"> <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" /> <span>Tiến độ</span></div>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{completionRate}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* {team.recentActivity && ( ... JSX cho recentActivity ... )} */}
    </div>
  );
};