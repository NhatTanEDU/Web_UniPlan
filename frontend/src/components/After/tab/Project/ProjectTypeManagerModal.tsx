import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ProjectTypeManagerModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Quản lý phân loại dự án</h2>
        {/* Nội dung modal quản lý phân loại ở đây */}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default ProjectTypeManagerModal;