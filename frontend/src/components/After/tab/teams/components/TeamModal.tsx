/**
 * TeamModal Component
 * --------------------
 * - Popup form dùng chung cho Tạo và Chỉnh sửa team
 * - Props:
 * • visible: điều khiển hiển thị
 * • initialData: dữ liệu ban đầu (chỉnh sửa) hoặc undefined (tạo mới)
 * • onSubmit: callback khi submit form
 * • onClose: callback khi đóng modal
 */
import React, { useState, useEffect } from "react";

interface Props {
  visible: boolean;
  initialData?: { id?: string; name: string; description?: string; type: "Public" | "Private" }; // Sửa: Kiểu 'type' cụ thể hơn
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; type: "Public" | "Private" }, id?: string) => void; // Sửa: Kiểu 'type' trong data của onSubmit
}

export default function TeamModal({ visible, initialData, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Public" | "Private">("Public"); // Sửa: Khai báo kiểu cụ thể cho state 'type'

  // Khi open modal, map dữ liệu ban đầu vào form
  useEffect(() => {
    if (visible) { // Chỉ cập nhật form state khi modal được mở
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || "");
        setType(initialData.type); // initialData.type giờ đã là "Public" | "Private"
      } else {
        // Reset form cho việc tạo mới khi không có initialData
        setName("");
        setDescription("");
        setType("Public");
      }
    }
  }, [initialData, visible]); // Thêm 'visible' vào dependency array để reset form khi modal được mở lại

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> {/* Thêm padding cho màn hình nhỏ */}
      <form
        onSubmit={e => {
          e.preventDefault();
          // Thêm kiểm tra đơn giản cho tên nhóm (bạn có thể mở rộng với thư viện validation)
          if (!name.trim()) {
            alert("Tên nhóm không được để trống.");
            return;
          }
          onSubmit({ name, description, type }, initialData?.id);
        }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg" // Responsive width và bo tròn lớn hơn
      >
        <h2 className="text-xl mb-6 font-semibold text-gray-700 dark:text-gray-200"> {/* Tăng margin bottom và điều chỉnh màu chữ */}
          {initialData ? "Chỉnh sửa thông tin nhóm" : "Tạo nhóm mới"}
        </h2>
        
        {/* Input Tên */}
        <label className="block mb-4"> {/* Tăng margin bottom */}
          <span className="text-gray-700 dark:text-gray-300">Tên nhóm</span> <span className="text-red-500">*</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Ví dụ: Team Marketing"
          />
        </label>
        
        {/* Textarea Mô tả */}
        <label className="block mb-4"> {/* Tăng margin bottom */}
          <span className="text-gray-700 dark:text-gray-300">Mô tả</span>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            rows={3} // Số dòng mặc định
            placeholder="Mô tả ngắn về mục tiêu hoặc chức năng của nhóm (tùy chọn)"
          />
        </label>
        
        {/* Select Loại */}
        <label className="block mb-6"> {/* Tăng margin bottom */}
          <span className="text-gray-700 dark:text-gray-300">Loại</span> <span className="text-red-500">*</span>
          <select 
            value={type} 
            onChange={e => setType(e.target.value as "Public" | "Private")} // Sửa: Cast giá trị từ select sang kiểu cụ thể
            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Public">Public (Công khai)</option>
            <option value="Private">Private (Riêng tư)</option>
          </select>
        </label>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-2"> {/* Thêm padding top và tăng space */}
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {initialData ? "Lưu thay đổi" : "Tạo nhóm"}
          </button>
        </div>
      </form>
    </div>
  );
}