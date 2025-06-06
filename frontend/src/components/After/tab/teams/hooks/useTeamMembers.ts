/**
 * useTeamMembers Hook
 * --------------------
 * - Quản lý state danh sách thành viên của 1 team
 * - Cung cấp các hàm: fetch, addMembers, updateRole, removeMember
 */
import { useState, useEffect, useCallback } from "react";
import { teamMemberApi, TeamMember, AddMemberData, UpdateMemberRoleData } from "../../../../../services/teamMemberApi";

export function useTeamMembers(teamId: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [userRole, setUserRole] = useState<"Admin" | "Editor" | "Member" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * fetchMembers()
   *  - Gọi API getTeamMembers(teamId)
   *  - Cập nhật state members
   */  const fetchMembers = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const membersArray = await teamMemberApi.getTeamMembers(teamId);
      console.log('🐛 useTeamMembers - API Response:', JSON.stringify(membersArray, null, 2));
      
      // --- FIX IS HERE ---
      // API service now returns the members array directly, not an object with members property
      if (Array.isArray(membersArray)) {
        console.log('🐛 useTeamMembers - Members array:', JSON.stringify(membersArray, null, 2));
        if (membersArray.length > 0) {
          console.log('🐛 useTeamMembers - First member structure:', JSON.stringify(membersArray[0], null, 2));
        }
        setMembers(membersArray); // Set state with the members array directly
      } else {
        console.warn('🐛 useTeamMembers - API response is not an array. Setting to empty.');
        setMembers([]); // Fallback to an empty array if the structure is wrong
      }
    } catch (err: any) {
      console.error('🐛 useTeamMembers - API Error:', err);
      setError(err.message || "Không tải được danh sách thành viên");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  /**
   * fetchUserRole()
   *  - Gọi API getUserTeamRole(teamId)
   *  - Cập nhật state userRole
   */  const fetchUserRole = useCallback(async () => {
    try {
      console.log('🔍 Fetching user role for teamId:', teamId);
      const roleData = await teamMemberApi.getUserTeamRole(teamId);
      console.log('✅ Fetched userRole data:', roleData);
      console.log('📋 Setting userRole to:', roleData.userRole);
      setUserRole(roleData.userRole);
    } catch (err: any) {
      console.error('🐛 useTeamMembers - Role API Error:', err);
      console.error('🔍 Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data
      });
      // Không set error cho role fetch vì không critical
      setUserRole(null);
    }
  }, [teamId]);

  /**
   * addMembers(list)
   *  - Gọi API bulkAddMembers, sau đó refetch
   */
  const addMembers = async (list: AddMemberData[]) => {
    await teamMemberApi.bulkAddMembers(teamId, list);
    await fetchMembers();
  };

  /**
   * updateMemberRole(memberId, data)
   *  - Gọi API updateMemberRole, sau đó refetch
   */
  const updateRole = async (memberId: string, data: UpdateMemberRoleData) => {
    await teamMemberApi.updateMemberRole(teamId, memberId, data);
    await fetchMembers();
  };

  /**
   * removeMember(memberId)
   *  - Gọi API removeMember, sau đó refetch
   */
  const removeMember = async (memberId: string) => {
    await teamMemberApi.removeMember(teamId, memberId);
    await fetchMembers();
  };
  // Auto fetch khi teamId thay đổi
  useEffect(() => {
    if (teamId) {
      fetchMembers();
      fetchUserRole();
    }
  }, [fetchMembers, fetchUserRole, teamId]);

  return { members, userRole, loading, error, fetchMembers, addMembers, updateRole, removeMember };
} 