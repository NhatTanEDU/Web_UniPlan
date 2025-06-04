/**
 * useTeams Hook
 * -------------------
 * - Quản lý state danh sách teams (loading, error, data)
 * - Cung cấp các hàm: fetchTeams, createTeam, updateTeam, deleteTeam
 * - Tự động load lại danh sách sau mỗi thao tác CRUD
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
   *  - Refetch danh sách sau khi thành công
   */
  const createTeam = async (data: { name: string; description?: string; type: "Public" | "Private" }) => {
    await teamApi.createTeam(data);
    await fetchTeams();
  };
  /**
   * updateTeam(id, data)
   *  - Gọi API cập nhật team theo id
   *  - Refetch danh sách sau khi thành công
   */
  const updateTeam = async (id: string, data: { name?: string; description?: string; type?: "Public" | "Private" }) => {
    console.log("🔄 useTeams: updateTeam called", { id, data });
    await teamApi.updateTeam(id, data);
    console.log("✅ useTeams: API update successful, now refetching...");
    await fetchTeams();
    console.log("✅ useTeams: Refetch completed");
  };

  /**
   * deleteTeam(id)
   *  - Gọi API xóa team
   *  - Refetch danh sách sau khi thành công
   */
  const deleteTeam = async (id: string) => {
    await teamApi.deleteTeam(id);
    await fetchTeams();
  };

  // Khi component mount, tự động fetch lần đầu
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, fetchTeams, createTeam, updateTeam, deleteTeam };
}