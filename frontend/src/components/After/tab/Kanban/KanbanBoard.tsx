import React, { useState } from "react";

const STATUS = ["Cần làm", "Đang làm", "Hoàn thành"];
const PRIORITY = ["Thấp", "Trung bình", "Cao"];

const KanbanBoard = ({ tasks = [], onCreateTask, projectName }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "Trung bình",
    status: "Cần làm",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onCreateTask(form);
    setForm({ title: "", description: "", due_date: "", priority: "Trung bình", status: "Cần làm" });
    setShowForm(false);
  };

  return (
    <div>
      {/* Hiển thị tên project ở card đầu bảng */}
      {projectName && (
        <div className="bg-blue-100 text-blue-800 rounded px-4 py-2 mb-4 font-semibold text-lg">
          Dự án: {projectName}
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bảng Kanban</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowForm(true)}
        >
          + Tạo Task
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Tên công việc *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block font-medium">Mô tả</label>
            <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block font-medium">Ngày hết hạn</label>
            <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block font-medium">Độ ưu tiên</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full border rounded px-2 py-1">
              {PRIORITY.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2 mt-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Tạo</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS.map((status) => (
          <div key={status} className="bg-gray-100 rounded p-3 min-h-[300px]">
            <h3 className="font-semibold mb-2">{status}</h3>
            <div className="space-y-2">
              {tasks.filter((t: any) => t.status === status).map((task: any) => (
                <div key={task._id} className="bg-white rounded shadow p-3">
                  <div className="font-bold">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                  <div className="text-xs mt-1">Hạn: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</div>
                  <div className="text-xs">Ưu tiên: {task.priority}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
