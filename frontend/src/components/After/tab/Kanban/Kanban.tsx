import React, { useState } from 'react';
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import { UserCircle, Tag, Clock, Pin, Edit, Trash } from "lucide-react";

const STATUS = ["Cần làm", "Đang làm", "Hoàn thành"];

const Kanban = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "Trung bình",
    status: "Cần làm",
    assigned_to: "",
    tags: [],
    color: "#ffffff", // Mặc định là màu trắng
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setTasks([...tasks, { ...form, id: Date.now() }]);
    setForm({
      title: "",
      description: "",
      due_date: "",
      priority: "Trung bình",
      status: "Cần làm",
      assigned_to: "",
      tags: [],
      color: "#ffffff", // Reset về màu trắng
    });
    setShowForm(false);
  };

  const handleDragStart = (e: React.DragEvent, taskId: number, column: string) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.setData("column", column);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string, targetTaskId?: number) => {
    const taskId = parseInt(e.dataTransfer.getData("taskId"), 10);
    const sourceColumn = e.dataTransfer.getData("column");

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const draggedTaskIndex = updatedTasks.findIndex((task) => task.id === taskId);
      const draggedTask = updatedTasks[draggedTaskIndex];

      if (sourceColumn === newStatus && targetTaskId) {
        const targetTaskIndex = updatedTasks.findIndex((task) => task.id === targetTaskId);
        updatedTasks.splice(draggedTaskIndex, 1);
        updatedTasks.splice(targetTaskIndex, 0, draggedTask);
      } else {
        updatedTasks[draggedTaskIndex] = { ...draggedTask, status: newStatus };
      }

      return updatedTasks;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Dự Án", "Bảng Kanban"]} />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bảng Kanban</h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShowForm(!showForm)}
            >
              + Tạo Task
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Tên công việc *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block font-medium">Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block font-medium">Ngày hết hạn</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block font-medium">Độ ưu tiên</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="Thấp">Thấp</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Cao">Cao</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Người được giao</label>
                <input
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block font-medium">Chọn màu</label>
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1 h-10"
                />
              </div>
              <div className="md:col-span-2 flex gap-2 mt-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Tạo
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUS.map((status) => (
              <div
                key={status}
                className="bg-gray-100 rounded p-3 min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{status}</h3>
                  <span className="text-sm text-gray-500">({tasks.filter((t) => t.status === status).length})</span>
                </div>
                <div className="space-y-2">
                  {tasks.filter((t) => t.status === status).map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded shadow p-3 cursor-move relative"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, status)}
                      style={{ backgroundColor: task.color }}
                    >
                      <div className="font-bold flex justify-between">
                        {task.title}
                        <Pin size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                      <div className="text-xs mt-1 flex justify-between items-center">
                        <span className={`text-xs ${new Date(task.due_date) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) ? "text-red-500" : "text-gray-500"}`}>
                          <Clock size={12} /> {task.due_date || "-"}
                        </span>
                        <span className="text-xs flex items-center">
                          <UserCircle size={16} className="mr-1" /> {task.assigned_to || "Chưa có"}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Edit size={16} className="text-blue-500 cursor-pointer hover:text-blue-700" />
                        <Trash size={16} className="text-red-500 cursor-pointer hover:text-red-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer onFooterClick={(item: string) => console.log(`Clicked ${item}`)} />
        <TopButton />
      </div>
    </div>
  );
};

export default Kanban;
