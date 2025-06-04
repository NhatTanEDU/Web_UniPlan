/**
 * TeamProjectModal Component
 * ----------------------------
 * - Popup form gán hoặc tạo nhanh project cho team
 * - Sử dụng ProjectForm để nhập đầy đủ thông tin
 */
import React, { useState } from "react";
import ProjectForm from "../../Project/ProjectForm";
import { TeamProject } from "../../../../../services/teamProjectApi";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAssign: (data: { // This data structure should match the 'newProject' state
    project_name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    priority: string;
    project_type: string;
    project_type_id: { _id: string; name: string };
  }) => void;
}

export default function TeamProjectModal({ visible, onClose, onAssign }: Props) {
  // Khởi tạo state cho form mới
  const [newProject, setNewProject] = useState<any>({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Planning",
    priority: "Medium",
    project_type: "",
    project_type_id: { _id: "", name: "" },
  });

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96 max-h-screen overflow-auto">
        <h2 className="text-xl mb-4">Thêm / Tạo Project</h2>

        {/* Form tạo nhanh project */}
        <ProjectForm
          newProject={newProject}
          setNewProject={setNewProject}
          onSubmit={e => {
            e.preventDefault();
            onAssign(newProject);
          }}
        />

        {/* Nút đóng */}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}