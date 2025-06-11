import React, { useState, useEffect } from 'react';
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import { AlertCircle } from "lucide-react";
import { projectApi } from "../../../../services/projectApi";
import { kanbanApi, KanbanTask, ProjectMember } from "../../../../services/kanbanApi";

const KanbanMinimal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumb items={["Dashboard", "Dự Án", "Bảng Kanban"]} />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600 dark:text-gray-300">Đang tải...</div>
            </div>
          </main>
          <Footer onFooterClick={(item: string) => console.log(`Clicked ${item}`)} />
          <TopButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Dự Án", "Bảng Kanban"]} />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Bảng Kanban (Minimal Version)
            </h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => console.log('Create task clicked')}
            >
              + Tạo Task
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
              <button
                className="ml-auto text-red-500 hover:text-red-700"
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Cần làm", "Đang làm", "Hoàn thành"].map((status) => (
              <div
                key={status}
                className="bg-gray-100 dark:bg-gray-800 rounded p-3 min-h-[300px]"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{status}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">(0)</span>
                </div>
                <div className="space-y-2">
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    Chưa có task nào
                  </div>
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

export default KanbanMinimal;
