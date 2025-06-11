/**
 * useTeams Hook
 * -------------------
 * - Quản lý state danh sách teams (loading, error, data)
 * - Cung cấp các hàm: fetchTeams, createTeam, updateTeam, deleteTeam
 * - Hỗ trợ optimistic updates và thông báo thành công/lỗi
 * - Tự động cập nhật UI sau mỗi thao tác CRUD
 */
import { useState, useEffect, useCallback } from "react";
import { teamApi, Team } from "../../../../../services/teamApi"; // Adjusted path based on typical folder structure

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * fetchTeams()
   *  - Gọi API getTeams()
   *  - Cập nhật state: teams, loading, error
   */
  const fetchTeams = useCallback(async () => {
    console.log("🔄 useTeams: fetchTeams called");
    setLoading(true);
    setError(null);
    try {
      const res = await teamApi.getTeams();
      console.log("✅ useTeams: API response received", { teamsCount: res.teams?.length });
      setTeams(res.teams);
      console.log("✅ useTeams: State updated with new teams");
    } catch (err: any) {
      console.error("❌ useTeams: Error fetching teams", err);
      setError(err.message || "Không tải được danh sách nhóm");
    } finally {
      setLoading(false);
    }
  }, []);
  /**
   * createTeam(data)
   *  - Gọi API tạo team mới
   *  - Optimistic update: thêm team mới vào state ngay lập tức
   *  - Nếu thất bại: rollback và hiển thị lỗi
   *  - Trả về { success: boolean, message: string }
   */
  const createTeam = async (data: { name: string; description?: string; type: "Public" | "Private" }) => {
    try {
      console.log("🔄 useTeams: createTeam called", data);      // Optimistic update: tạo temporary team với ID ngẫu nhiên
      const tempId = `temp_${Date.now()}`;
      const tempTeam: Team = {
        _id: tempId,
        name: data.name,
        description: data.description || '',
        type: data.type,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Thêm vào state ngay lập tức
      setTeams(prev => [...prev, tempTeam]);
      console.log("✅ useTeams: Temporary team added to state");
      
      // Gọi API thực tế
      const response = await teamApi.createTeam(data);
      console.log("✅ useTeams: API create successful", response);
      
      // Thay thế temp team bằng team thực từ server
      setTeams(prev => prev.map(team => 
        team._id === tempId ? { ...response.team } : team
      ));
      
      return { success: true, message: "Thêm nhóm thành công" };
    } catch (err: any) {
      console.error("❌ useTeams: Error creating team", err);
      
      // Rollback: xóa temp team khỏi state
      setTeams(prev => prev.filter(team => !team._id.startsWith('temp_')));
      
      return { 
        success: false, 
        message: err.message || "Không thể tạo nhóm mới" 
      };
    }
  };  /**
   * updateTeam(id, data)
   *  - Gọi API cập nhật team theo id
   *  - Optimistic update: cập nhật state trước khi gọi API
   *  - Nếu thất bại: rollback và hiển thị lỗi
   *  - Trả về { success: boolean, message: string }
   */
  const updateTeam = async (id: string, data: { name?: string; description?: string; type?: "Public" | "Private" }) => {
    // Lưu lại team cũ để rollback nếu cần TRƯỚC KHI update
    const oldTeam = teams.find(team => team._id === id);
    if (!oldTeam) {
      return { 
        success: false, 
        message: "Không tìm thấy nhóm để cập nhật" 
      };
    }
    
    try {
      console.log("🔄 useTeams: updateTeam called", { id, data });
        // Optimistic update: cập nhật state ngay lập tức
      setTeams(prev => prev.map(team => 
        team._id === id 
          ? { ...team, ...data, updatedAt: new Date() }
          : team
      ));
      console.log("✅ useTeams: Optimistic update applied");
      
      // Gọi API thực tế
      const response = await teamApi.updateTeam(id, data);
      console.log("✅ useTeams: API update successful", response);
      
      // Cập nhật lại với dữ liệu chính xác từ server
      setTeams(prev => prev.map(team => 
        team._id === id ? { ...response.team } : team
      ));
      
      return { success: true, message: "Chỉnh sửa nhóm thành công" };
    } catch (err: any) {
      console.error("❌ useTeams: Error updating team", err);
      
      // Rollback: khôi phục team cũ
      setTeams(prev => prev.map(team => 
        team._id === id ? oldTeam : team
      ));
      
      return { 
        success: false, 
        message: err.message || "Không thể cập nhật nhóm" 
      };
    }
  };/**
   * deleteTeam(id)
   *  - Gọi API xóa team
   *  - Optimistic update: xóa khỏi state ngay lập tức
   *  - Nếu thất bại: rollback và hiển thị lỗi
   *  - Trả về { success: boolean, message: string }
   */
  const deleteTeam = async (id: string) => {
    // Lưu lại team cũ để rollback nếu cần TRƯỚC KHI xóa
    const oldTeam = teams.find(team => team._id === id);
    if (!oldTeam) {
      return { 
        success: false, 
        message: "Không tìm thấy nhóm để xóa" 
      };
    }
    
    try {
      console.log("🔄 useTeams: deleteTeam called", id);
      
      // Optimistic update: xóa khỏi state ngay lập tức
      setTeams(prev => prev.filter(team => team._id !== id));
      console.log("✅ useTeams: Team removed from state optimistically");
      
      // Gọi API thực tế
      await teamApi.deleteTeam(id);
      console.log("✅ useTeams: API delete successful");
      
      return { success: true, message: "Xóa nhóm thành công" };
    } catch (err: any) {
      console.error("❌ useTeams: Error deleting team", err);
      
      // Rollback: thêm lại team vào vị trí cũ
      setTeams(prev => [...prev, oldTeam].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
      
      return { 
        success: false, 
        message: err.message || "Không thể xóa nhóm" 
      };
    }
  };

  // Khi component mount, tự động fetch lần đầu
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, fetchTeams, createTeam, updateTeam, deleteTeam };
}