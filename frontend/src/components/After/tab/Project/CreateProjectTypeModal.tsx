// src/components/After/tab/Project/CreateProjectTypeModal.tsx

import React, { useState, useContext } from "react";
import { X, Loader2 } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import { createProjectType, ProjectType } from "../../../../services/projectTypeApi";
import { useToast } from "../../../context/ToastContext";

// Định nghĩa props cho component
interface CreateProjectTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTypeCreated: (newType: ProjectType) => void; // Callback để báo cho component cha biết đã tạo xong
}

const CreateProjectTypeModal: React.FC<CreateProjectTypeModalProps> = ({
  isOpen,
  onClose,
  onTypeCreated,
}) => {
  const { userId } = useContext(AuthContext);
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    // Reset state khi đóng modal
    setName("");
    setError("");
    setIsCreating(false);
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setError(""); // Xóa lỗi cũ

    if (!name.trim()) {
      setError("Tên phân loại không được để trống.");
      return;
    }

    if (!userId) {
      setError("Không tìm thấy thông tin người dùng. Vui lòng thử đăng nhập lại.");
      return;
    }

    setIsCreating(true);
    console.log(`[DEBUG] Bắt đầu tạo phân loại mới với tên: "${name}" cho userId: ${userId}`);

    try {
      const newType = await createProjectType(name, userId);
      console.log("[DEBUG] API createProjectType thành công, trả về:", newType);
      
      showToast("Tạo phân loại mới thành công!", "success");
      onTypeCreated(newType); // Gửi dữ liệu type mới về cho component cha
      handleClose(); // Đóng modal
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Đã có lỗi xảy ra.";
      console.error("[DEBUG] Lỗi khi tạo phân loại mới:", errorMessage);
      setError(errorMessage); // Hiển thị lỗi trong modal
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()} // Ngăn việc click bên trong modal làm đóng modal
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Tạo Phân Loại Mới
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div>
          <div className="space-y-2">
            <label htmlFor="type-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên phân loại
            </label>
            <input
              id="type-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ví dụ: Marketing, Development,..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 flex items-center"
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                "Tạo"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateProjectTypeModal;
