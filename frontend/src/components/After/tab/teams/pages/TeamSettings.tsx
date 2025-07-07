/**
 * TeamSettings Page
 * ------------------
 * - Cho phép Admin/Editor chỉnh sửa thông tin team (name, description, type)
 * - Hiển thị “Danger Zone” xóa team vĩnh viễn kèm confirm modal
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { teamApi } from "../../../../../services/teamApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmModal from "../components/ConfirmModal";

export default function TeamSettingsPage() {
  const { team, loading, error } = useTeam();
  const navigate = useNavigate();

  // Local state cho form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Public" | "Private">("Public");
  const [saving, setSaving] = useState(false);

  // State confirm xóa
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Khi load team thành công, fill vào form
  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || "");
      setType(team.type);
    }
  }, [team]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!team) return <p>Không tìm thấy team</p>;

  /**
   * handleSave()
   *  - Gọi API cập nhật team
   *  - Sau khi thành công, show toast (nếu có) hoặc navigate
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teamApi.updateTeam(team._id, { name, description, type });
      // TODO: hiển thị toast success
    } catch (err: any) {
      console.error(err);
      // TODO: hiển thị toast error
    } finally {
      setSaving(false);
    }
  };

  /**
   * handleDelete()
   *  - Gọi API xóa team và redirect về /teams
   */
  const handleDelete = async () => {
    try {
      await teamApi.deleteTeam(team._id);
      navigate("/teams");
    } catch (err: any) {
      console.error(err);
      // TODO: show error toast
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cài đặt nhóm</h1>

      {/* Form chỉnh sửa team */}
      <form onSubmit={handleSave} className="max-w-md space-y-4">
        <label className="block">
          Tên nhóm
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <label className="block">
          Mô tả
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <label className="block">
          Loại
          <select
            value={type}
            onChange={e => setType(e.target.value as any)}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>

      {/* Danger Zone */}
      <section className="mt-12 p-4 border border-red-400 bg-red-50 rounded">
        <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
        <p className="text-red-500 mb-4">
          Xóa nhóm sẽ <strong>không thể khôi phục</strong> và mất toàn bộ thành viên &amp; dự án.
        </p>
        <button
          onClick={() => setConfirmVisible(true)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Xóa nhóm
        </button>
      </section>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmVisible}
        title="⚠️ Xác nhận xóa nhóm"
        message="Bạn có chắc muốn xóa nhóm này không?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </div>
  );
}