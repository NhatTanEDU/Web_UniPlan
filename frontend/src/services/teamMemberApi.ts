/**
 * teamMemberApi
 * -------------
 * - Tương tác với endpoint /api/teams/:teamId/members
 */
import baseApi from "./baseApi"; // axios instance đã cấu hình interceptors, baseURL,…

/**
 * TeamMember
 * - Một record thành viên trong team  
 * - Updated to match actual API response structure from backend
 */
export interface TeamMember {
  id: string; // Member ID from backend
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar?: string | null;
  };
  role: "Admin" | "Editor" | "Member";
  is_active: boolean;
  joined_at?: string;
}

/**
 * Legacy TeamMember interface for backward compatibility
 * - Some components may still expect the id format
 */
export interface LegacyTeamMember {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar?: string | null;
  };
  role: "Admin" | "Editor" | "Member";
  is_active: boolean;
}

/**
 * AddMemberData
 * - Payload để thêm thành viên mới vào team
 */
export interface AddMemberData {
  userId: string;
  role: "Admin" | "Editor" | "Member";
}

/**
 * UpdateMemberRoleData
 * - Payload để cập nhật role của thành viên
 */
export interface UpdateMemberRoleData {
  role: "Admin" | "Editor" | "Member";
}

/**
 * UserTeamRole
 * - Response structure for user's role in team
 */
export interface UserTeamRole {
  teamId: string;
  teamName: string;
  userId: string;
  userRole: "Admin" | "Editor" | "Member";
  joinedAt: string;
  isActive: boolean;
  permissions: string[];
}

/**
 * teamMemberApi class
 * - Main API service for team member operations
 */
class TeamMemberApi {  /**
   * getTeamMembers(teamId)
   * - Lấy danh sách thành viên của team
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await baseApi.get(`/teams/${teamId}/members`);
    // Backend trả về { message, team, members, total }, chúng ta chỉ cần array members
    return response.data.members || [];
  }/**
   * addMemberToTeam(teamId, data)
   * - Thêm 1 thành viên mới vào team
   */
  async addMemberToTeam(teamId: string, data: AddMemberData): Promise<void> {
    await baseApi.post(`/teams/${teamId}/members`, {
      user_id: data.userId, // Backend expects user_id not userId
      role: data.role
    });
  }

  /**
   * bulkAddMembers(teamId, list)
   * - Thêm nhiều thành viên cùng lúc (sử dụng individual API calls)
   */
  async bulkAddMembers(teamId: string, list: AddMemberData[]): Promise<void> {
    // Use individual API calls since bulk endpoint has issues
    for (const member of list) {
      await this.addMemberToTeam(teamId, {
        userId: member.userId,
        role: member.role
      });
    }
  }

  /**
   * updateMemberRole(teamId, memberId, data)
   * - Cập nhật role của 1 thành viên
   */
  async updateMemberRole(
    teamId: string,
    memberId: string,
    data: UpdateMemberRoleData
  ): Promise<void> {
    await baseApi.put(`/teams/${teamId}/members/${memberId}`, data);
  }
  /**
   * removeMember(teamId, memberId)
   * - Xóa 1 thành viên khỏi team
   */
  async removeMember(teamId: string, memberId: string): Promise<void> {
    await baseApi.delete(`/teams/${teamId}/members/${memberId}`);
  }

  /**
   * bulkRemoveMembers(teamId, memberIds)
   * - Xóa nhiều thành viên cùng lúc
   */
  async bulkRemoveMembers(teamId: string, memberIds: string[]): Promise<void> {
    await baseApi.delete(`/teams-enhanced/${teamId}/members/bulk/remove`, {
      data: { memberIds },
    });
  }

  /**
   * getUserTeamRole(teamId)
   * - Get current user's role in a specific team
   */
  async getUserTeamRole(teamId: string): Promise<UserTeamRole> {
    const response = await baseApi.get(`/user-roles/teams/${teamId}`);
    return response.data.data;
  }
}

const teamMemberApi = new TeamMemberApi();

export default teamMemberApi;
export { teamMemberApi };