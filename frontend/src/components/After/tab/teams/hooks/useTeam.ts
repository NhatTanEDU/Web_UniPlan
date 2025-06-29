/**
 * useTeam Hook
 * -------------
 * - Lấy thông tin chi tiết của 1 team theo ID
 * - Trả về { team, loading, error }
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { teamApi, Team } from "../../../../../services/teamApi";

export function useTeam() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setError(null); // Reset error khi teamId thay đổi
    setTeam(null); // Reset team nếu muốn clear dữ liệu cũ
    if (!teamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    teamApi
      .getTeamById(teamId)
      .then(res => {
        if (isMounted) setTeam(res.team);
      })
      .catch(err => {
        if (isMounted) setError(err.message || "Lấy thông tin team thất bại");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [teamId]);

  return { team, loading, error };
}