// services/teamApi.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    console.error("Lỗi API:", message, error.response?.data); // Thêm log chi tiết hơn
    throw new Error(message);
  }
);

// Types
export interface UserReference {
  _id: string;
  fullName?: string; // Hoặc name, tùy theo User model và cách backend populate
  name?: string;     // Thêm name nếu User model có
  email: string;
  avatar?: string;
  role?: string; // Thêm vai trò nếu cần hiển thị ở đâu đó
}

export interface Team { // Interface này định nghĩa đối tượng Team mà frontend sẽ làm việc
  _id: string;
  name: string; // ĐÃ ĐƯỢC MAP từ team_name bởi các hàm trong teamApi
  description?: string;
  type: 'Public' | 'Private'; // ĐÃ ĐƯỢC MAP
  createdBy?: UserReference; // Backend (getTeamById) populate created_by và trả về trong team object
  userRole?: 'Admin' | 'Editor' | 'Member' | string; // Backend (getTeamById) thêm userRole vào team object
  createdAt: Date;    // Các hàm map trong teamApi chuyển chuỗi ngày từ backend thành Date object
  updatedAt: Date;    // Các hàm map trong teamApi chuyển chuỗi ngày từ backend thành Date object

  // Các trường này hiện không có trong Team model hoặc không được getTeamById trả về trong object `team` chính.
  // Nếu bạn muốn dùng, cần thêm vào Model và Controller backend, sau đó cập nhật interface này.
  color?: string;
  isPublic?: boolean; // `type` đã được map thành 'Public'/'Private', có thể dùng team.type === 'Public' để suy ra
  completionRate?: number;
  // Các trường như memberCount, projectCount không phải là thuộc tính trực tiếp của team object từ getTeamById,
  // mà được trả về riêng hoặc tính toán.
}

export interface TeamMember {
  _id: string; // ID của bản ghi TeamMember
  user: UserReference; // API /teams/:teamId/members trả về user_id đã populate, ta map thành user
  role: 'Admin' | 'Editor' | 'Member';
  joined_at: string; // Hoặc Date, nếu bạn muốn map ở tầng service này
  is_active?: boolean;
}

export interface TeamProject {
  _id: string;
  project_name: string; // API /teams/:teamId/projects thường trả về project_name
  title?: string; // Có thể map project_name thành title nếu muốn
  description?: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Active' | 'Archived' | string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | string;
  startDate?: string;
  endDate?: string;
  team_id?: string; // Dự án có thể có team_id
  createdAt: string; // Hoặc Date
  updatedAt: string; // Hoặc Date
}

// Helper function để map giá trị 'type' từ backend
const mapBackendTypeToFrontendType = (backendType?: string | null): "Public" | "Private" => {
  if (backendType?.toLowerCase() === "private") {
    return "Private";
  }
  return "Public"; // Mặc định là Public (Team model có default là 'Public')
};

// Helper function để đảm bảo các trường date là Date object
const ensureDateObject = (dateString?: string | Date): Date => {
    if (!dateString) return new Date(); // Hoặc throw error, hoặc trả về một ngày mặc định an toàn
    if (dateString instanceof Date) return dateString;
    return new Date(dateString);
};


// Enhanced interfaces for pagination and filtering
export interface TeamFilters {
  search: string;
  type: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  // Optional fields for React state management (not sent to API)
  _lastUpdate?: number;
  _refresh?: number;
}

export interface TeamStatsData {
  totalTeams: number;
  teamsWithMembers: number;
  teamsWithProjects: number;
  emptyTeams: number;
  recentTeams: number;
  teamsByType: {
    [key: string]: number;
  };
}

export interface PaginatedTeamsResponse {
  teams: Team[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const teamApi = {  // Enhanced getTeams with filters and pagination
  getTeams: async (filters?: Partial<TeamFilters>): Promise<PaginatedTeamsResponse> => {
    const params = {
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      search: filters?.search || '',
      type: filters?.type || '',
      status: filters?.status || '',
      sortBy: filters?.sortBy || 'createdAt',
      sortOrder: filters?.sortOrder || 'desc'
    };

    const backendResponse = await apiClient.get('/teams', { params }) as {
      teams: any[];
      pagination: any;
    };

    const frontendTeams = backendResponse.teams.map((teamFromBackend: any) => {
      return {
        _id: teamFromBackend._id,
        name: teamFromBackend.team_name,
        description: teamFromBackend.description,
        type: mapBackendTypeToFrontendType(teamFromBackend.type),
        createdBy: teamFromBackend.created_by,
        userRole: teamFromBackend.userRole,
        createdAt: ensureDateObject(teamFromBackend.createdAt || teamFromBackend.created_at),
        updatedAt: ensureDateObject(teamFromBackend.updatedAt || teamFromBackend.updated_at),
      } as Team;
    });    return {
      teams: frontendTeams,
      pagination: {
        currentPage: backendResponse.pagination.page,
        totalPages: backendResponse.pagination.totalPages,
        totalItems: backendResponse.pagination.total, // Map 'total' từ backend sang 'totalItems' cho frontend
        itemsPerPage: backendResponse.pagination.limit,
        hasNextPage: backendResponse.pagination.page < backendResponse.pagination.totalPages,
        hasPrevPage: backendResponse.pagination.page > 1
      }
    };
  },
  // Get team statistics
  getTeamStatistics: async (): Promise<TeamStatsData> => {
    const response = await apiClient.get('/teams/statistics') as { statistics: TeamStatsData };
    return response.statistics; // Trả về chỉ phần statistics
  },

  // Get team by ID
  // Controller getTeamById trả về { team: teamData, members: memberArray, relatedProjects: projectArray }
  // Hook useTeam của bạn hiện chỉ lấy res.team, nên hàm này chỉ cần trả về team object đã map
  getTeamById: async (teamId: string): Promise<{ team: Team }> => {
    const responseFromController = await apiClient.get(`/teams/${teamId}`) as { team: any, members: any[], relatedProjects: any[] };
    const backendTeamObject = responseFromController.team;

    const frontendTeamData: Team = {
      _id: backendTeamObject._id,
      name: backendTeamObject.team_name, // Map từ team_name
      description: backendTeamObject.description,
      type: mapBackendTypeToFrontendType(backendTeamObject.type), // Map type
      createdBy: backendTeamObject.created_by, // Backend populate created_by
      userRole: backendTeamObject.userRole,     // Controller thêm userRole
      createdAt: ensureDateObject(backendTeamObject.createdAt || backendTeamObject.created_at), // Dùng createdAt từ timestamps
      updatedAt: ensureDateObject(backendTeamObject.updatedAt || backendTeamObject.updated_at),
      // Các trường như color, isPublic, completionRate cần được backend cung cấp nếu muốn có ở đây
      color: backendTeamObject.color, // Nếu model Team có và API trả về
      isPublic: backendTeamObject.isPublic ?? (mapBackendTypeToFrontendType(backendTeamObject.type) === 'Public'), // Nếu model Team có
      completionRate: backendTeamObject.completionRate, // Nếu API trả về
    };
    return { team: frontendTeamData };
  },

  createTeam: async (teamData: { name: string; description?: string; type: 'Public' | 'Private' }): Promise<{ team: Team; message: string }> => {
    // ... (map name sang team_name khi gửi đi) ...
    const backendData = {
      team_name: teamData.name,
      description: teamData.description,
      type: teamData.type
    };
    const response = await apiClient.post('/teams', backendData) as { team: any, message: string };
    // Map response.team lại cho khớp interface Team của frontend
    const createdTeamForFrontend: Team = {
        _id: response.team._id,
        name: response.team.team_name,
        description: response.team.description,
        type: mapBackendTypeToFrontendType(response.team.type),
        createdBy: response.team.created_by,
        userRole: response.team.userRole, // API createTeam có thể không trả userRole, cần kiểm tra
        createdAt: ensureDateObject(response.team.createdAt || response.team.created_at),
        updatedAt: ensureDateObject(response.team.updatedAt || response.team.updated_at),
    };
    return { team: createdTeamForFrontend, message: response.message };
  },

  updateTeam: async (teamId: string, teamData: { name?: string; description?: string; type?: 'Public' | 'Private' }): Promise<{ team: Team; message: string }> => {
    // ... (map name sang team_name khi gửi đi nếu có) ...
    const backendData: any = {};
    if (teamData.name !== undefined) backendData.team_name = teamData.name;
    if (teamData.description !== undefined) backendData.description = teamData.description;
    if (teamData.type !== undefined) backendData.type = teamData.type;

    const response = await apiClient.put(`/teams/${teamId}`, backendData) as { team: any, message: string };
    // Map response.team lại
     const updatedTeamForFrontend: Team = {
        _id: response.team._id,
        name: response.team.team_name,
        description: response.team.description,
        type: mapBackendTypeToFrontendType(response.team.type),
        createdBy: response.team.created_by,
        userRole: response.team.userRole,
        createdAt: ensureDateObject(response.team.createdAt || response.team.created_at),
        updatedAt: ensureDateObject(response.team.updatedAt || response.team.updated_at),
     };
    return { team: updatedTeamForFrontend, message: response.message };
  },

  deleteTeam: async (teamId: string): Promise<{ message: string }> => {
    return apiClient.delete(`/teams/${teamId}`);
  },

  // Các hàm API cho Team Members (URL giữ nguyên /teams/:teamId/members...)
  // Cần đảm bảo kiểu TeamMember trả về khớp với interface TeamMember ở trên
  getTeamMembers: async (teamId: string): Promise<{ members: TeamMember[] }> => {
    const response = await apiClient.get(`/teams/${teamId}/members`) as { members: any[] }; // API trả về mảng member
    // teamMember.controller.js -> getTeamById trả về members đã populate user_id
    // Nếu API này (vd: riêng cho get members của team) cũng populate user_id thành object user:
    const mappedMembers: TeamMember[] = response.members.map(m => ({
        _id: m._id,
        user: m.user_id, // Giả sử user_id đã là object UserReference sau populate
        role: m.role,
        joined_at: m.joined_at, // Giữ là string hoặc new Date(m.joined_at) tùy interface TeamMember
        is_active: m.is_active,
    }));
    return { members: mappedMembers };
  },
  // ... (addMemberToTeam, updateMemberRole, removeMember giữ nguyên URL)

  // Các hàm API cho Team Projects (URL giữ nguyên /teams/:teamId/projects...)
  // Cần đảm bảo kiểu TeamProject trả về khớp với interface TeamProject ở trên
  getTeamProjects: async (teamId: string): Promise<{ projects: TeamProject[] }> => {
    const response = await apiClient.get(`/teams/${teamId}/projects`) as { projects: any[] };
     const mappedProjects: TeamProject[] = response.projects.map(p => ({
        _id: p._id,
        project_name: p.project_name,
        title: p.project_name, // Nếu bạn muốn title
        status: p.status,
        description: p.description,
        priority: p.priority,
        startDate: p.start_date,
        endDate: p.end_date,
        team_id: p.team_id,
        createdAt: p.createdAt || p.created_at, // Nhất quán
        updatedAt: p.updatedAt || p.updated_at, // Nhất quán
    }));
    return { projects: mappedProjects };
  },
  // ... (createTeamProject, updateTeamProject, deleteTeamProject giữ nguyên URL)


  // ===== CÁC API NÂNG CAO - SỬA URL THÀNH /teams-enhanced/ =====
  getTeamStats: async (teamId: string): Promise<any> => { // Nên định nghĩa kiểu trả về cụ thể cho Stats
    return apiClient.get(`/teams-enhanced/${teamId}/stats`); // ĐÃ SỬA URL
  },

  bulkAddMembers: async (teamId: string, membersData: Array<{ userId: string; role: 'Admin' | 'Editor' | 'Member' }>): Promise<{ message: string; addedMembers: TeamMember[] }> => {
    const payload = {
        userIds: membersData.map(m => m.userId),
        // Backend (teamBulkController) mong muốn role chữ thường
        role: membersData.length > 0 ? membersData[0].role.toLowerCase() : 'member'
    };
    return apiClient.post(`/teams-enhanced/${teamId}/members/bulk/add`, payload); // ĐÃ SỬA URL
  },

  bulkRemoveMembers: async (teamId: string, userIds: string[]): Promise<{ message: string }> => {
    return apiClient.delete(`/teams-enhanced/${teamId}/members/bulk/remove`, { data: { userIds } }); // ĐÃ SỬA URL
  },
};
// ... (userApi, authApi) ...
// export default apis; // Nếu bạn export object lớn