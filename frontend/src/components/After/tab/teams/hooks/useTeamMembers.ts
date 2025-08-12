/**
 * useTeamMembers Hook
 * --------------------
 * - Quản lý state danh sách thành viên của 1 team
 * - Cung cấp các hàm: fetch, addMembers, updateRole, removeMember
 * - Socket.IO real-time updates for team member role changes
 */
import { useState, useEffect, useCallback, useContext } from "react";
import { teamMemberApi, TeamMember, AddMemberData, UpdateMemberRoleData } from "../../../../../services/teamMemberApi";
import { socket, joinTeamRoom, leaveTeamRoom } from "../../../../../services/socket";
import { AuthContext } from "../../../../context/AuthContext";

export function useTeamMembers(teamId: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [userRole, setUserRole] = useState<"Admin" | "Editor" | "Member" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin user hiện tại từ AuthContext
  const { userId } = useContext(AuthContext);
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
   *  - Gọi API updateMemberRole
   *  - Socket event sẽ tự động cập nhật state, không cần fetchMembers()
   */
  const updateRole = async (memberId: string, data: UpdateMemberRoleData) => {
    // Chỉ cần gọi API, không cần fetch lại
    // Server sẽ phát sự kiện socket và trình lắng nghe trong useEffect sẽ tự động cập nhật state
    await teamMemberApi.updateMemberRole(teamId, memberId, data);
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
      
      // Join team room for real-time updates
      joinTeamRoom(teamId);
      console.log(`🔔 Joined team room: ${teamId}`);
      
      // Listen for team member updates
      const handleTeamMemberUpdate = (updatedMember: TeamMember) => {
        console.log('🔔 [SOCKET] Received team member update:', updatedMember);
        
        // Update the specific member in the list
        setMembers(prevMembers => 
          prevMembers.map(member => 
            member._id === updatedMember._id ? updatedMember : member
          )
        );

        // =================================================================
        // ===== BẮT ĐẦU LOGIC QUAN TRỌNG CẦN THÊM VÀO ======================
        // =================================================================
        
        // Kiểm tra xem người dùng hiện tại có phải là người vừa bị thay đổi vai trò không
        // Xử lý cả trường hợp user_id là object và string
        const updatedUserId = typeof updatedMember.user_id === 'object' 
          ? updatedMember.user_id._id 
          : updatedMember.user_id;
          
        if (updatedUserId === userId) {
          console.log('👑 [SOCKET] Your role has been changed! Reloading page to apply new permissions.');
          console.log('🔍 [SOCKET] Details:', {
            updatedMemberUserId: updatedUserId,
            currentUserId: userId,
            newRole: updatedMember.role,
            memberName: updatedMember.user_id?.full_name || 'Unknown'
          });
          
          // Thông báo cho người dùng (tùy chọn nhưng nên có)
          alert(`Vai trò của bạn trong nhóm đã được thay đổi thành "${updatedMember.role}". Trang sẽ được tải lại để cập nhật quyền hạn.`);

          // Tải lại trang để cập nhật toàn bộ context và quyền hạn
          window.location.reload();
        }
        // =================================================================
        // ===== KẾT THÚC LOGIC QUAN TRỌNG CẦN THÊM VÀO  ======================
        // =================================================================
      };

      socket.on('team:member_updated', handleTeamMemberUpdate);

      // Cleanup on unmount or teamId change
      return () => {
        socket.off('team:member_updated', handleTeamMemberUpdate);
        leaveTeamRoom(teamId);
        console.log(`🔌 Left team room: ${teamId}`);
      };
    }
  }, [fetchMembers, fetchUserRole, teamId, userId]); // << THÊM userId VÀO DEPENDENCY ARRAY

  return { members, userRole, loading, error, fetchMembers, addMembers, updateRole, removeMember };
} 