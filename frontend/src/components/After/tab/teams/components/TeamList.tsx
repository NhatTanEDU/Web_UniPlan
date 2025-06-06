/**
 * TeamList Component
 * --------------------
 * - Hiển thị bảng danh sách các team
 * - Cho phép Tạo, Chỉnh sửa, Xóa team
 * - Sử dụng hook useTeams để gọi API và quản lý state
 * - Hiển thị thông báo success/error với Toast
 * - Cập nhật UI tức thì với optimistic updates
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeams } from "../hooks/useTeams"; // Hook này sử dụng teamApi đã được sửa
import { useToast } from "../../../../context/ToastContext"; // Import useToast hook
import TeamModal from "../components/TeamModal"; // TeamModal đã được sửa để dùng type: "Public" | "Private"
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "./LoadingSpinner"; // Assuming you have this or similar


export default function TeamList() {
  const { teams, loading, error, createTeam, updateTeam, deleteTeam } = useTeams();
  const { showToast } = useToast(); // Thêm hook để hiển thị thông báo
  const navigate = useNavigate();

  // state điều khiển hiển thị modal Tạo/Sửa
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<{
    id?: string;
    name: string;
    description?: string;
    type: "Public" | "Private";
  } | null>(null);

  // state điều khiển modal Xác nhận xóa
  const [confirm, setConfirm] = useState<{ visible: boolean; id?: string }>({ visible: false });

  /**
   * Navigate to team detail page
   */
  const handleTeamClick = (teamId: string) => {
    navigate(`/teams/${teamId}`);
  };
  /**
   * handleSubmit(data, id?)
   * - Nếu có id: update, ngược lại create mới
   * - Hiển thị thông báo success/error với Toast
   * - UI được cập nhật tức thì nhờ optimistic updates
   */
  const handleSubmit = async (data: { name: string; description?: string; type: "Public" | "Private" }, id?: string) => {
    try {
      console.log("🔄 Starting team submission:", { data, id });
      
      let result;
      if (id) {
        console.log("📝 Updating team...");
        result = await updateTeam(id, data);
      } else {
        console.log("➕ Creating new team...");
        result = await createTeam(data);
      }
      
      // Hiển thị thông báo dựa trên kết quả
      if (result.success) {
        showToast(result.message, 'success');
        console.log("✅ Operation successful, UI updated automatically");
        setShowModal(false);
        setEditData(null); // Reset edit data
      } else {
        showToast(result.message, 'error');
        console.log("❌ Operation failed:", result.message);
      }
    } catch (err: any) {
      console.error("❌ Unexpected error in handleSubmit:", err);
      showToast("Có lỗi xảy ra, vui lòng thử lại", 'error');
    }
  };
  /**
   * handleDelete()
   * - Xóa team đã chọn
   * - Hiển thị thông báo success/error với Toast
   * - UI được cập nhật tức thì nhờ optimistic updates
   */
  const handleDelete = async () => {
    if (confirm.id) {
      try {
        console.log("🗑️ Starting team deletion:", confirm.id);
        
        const result = await deleteTeam(confirm.id);
        
        // Hiển thị thông báo dựa trên kết quả
        if (result.success) {
          showToast(result.message, 'success');
          console.log("✅ Team deleted successfully, UI updated automatically");
        } else {
          showToast(result.message, 'error');
          console.log("❌ Delete operation failed:", result.message);
        }
      } catch (err: any) {
        console.error("❌ Unexpected error in handleDelete:", err);
        showToast("Có lỗi xảy ra khi xóa nhóm, vui lòng thử lại", 'error');
      } finally {
        setConfirm({ visible: false, id: undefined });
      }
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải danh sách nhóm..." />;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div>
      {/* Header + nút Tạo nhóm */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Danh sách nhóm</h1>
        <button
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Tạo nhóm
        </button>
      </div>

      {/* Table hiển thị teams */}
      {teams.length === 0 && !loading ? (
        <p>Không có nhóm nào để hiển thị.</p>
      ) : (        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full table-auto border-collapse text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-3 border dark:border-gray-600">Tên</th>
                <th scope="col" className="p-3 border dark:border-gray-600">Mô tả</th>
                <th scope="col" className="p-3 border dark:border-gray-600">Loại</th>
                <th scope="col" className="p-3 border dark:border-gray-600 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="p-3 border dark:border-gray-600 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    <button
                      onClick={() => handleTeamClick(t._id)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                      title="Xem chi tiết nhóm"
                    >
                      {t.name || 'N/A'}
                    </button>
                  </td>
                  <td className="p-3 border dark:border-gray-600">{t.description || 'N/A'}</td>
                  <td className="p-3 border dark:border-gray-600">{t.type}</td>
                  <td className="p-3 border dark:border-gray-600 text-center space-x-2 whitespace-nowrap">
                    {/* Nút Chỉnh sửa */}
                    <button
                      onClick={() => {
                        setEditData({ 
                          id: t._id, 
                          name: t.name || '', 
                          description: t.description || '', 
                          type: t.type || 'Public'
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    {/* Nút Xóa */}
                    <button
                      onClick={() => setConfirm({ visible: true, id: t._id })}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tạo/Chỉnh sửa */}
      {showModal && (
        <TeamModal
          visible={showModal}
          initialData={editData || undefined}
          onClose={() => {
            setShowModal(false);
            setEditData(null); // Reset edit data khi đóng modal
          }}
          onSubmit={handleSubmit}
        />
      )}

      {/* Modal Xác nhận xóa */}
      <ConfirmModal
        isOpen={confirm.visible}
        title="⚠️ Cảnh báo Xóa Nhóm"
        message={`Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác và sẽ xóa toàn bộ thành viên cũng như các thông tin liên quan đến dự án của nhóm.`}
        confirmText="Xóa Nhóm"
        type="danger"
        onCancel={() => setConfirm({ visible: false, id: undefined })}
        onConfirm={handleDelete}
      />
    </div>
  );
}