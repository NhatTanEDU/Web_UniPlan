// src/components/After/tab/setting.tsx
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";

export default function SettingPage() {
  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Chat"]} />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Nội dung chính của trang Dự án */}
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Danh sách Setting
          </h1>
          {/* Sau này bạn thêm bảng danh sách dự án, project card ở đây */}
        </main>
        <Footer onFooterClick={handleFooterClick} />
        <TopButton />
      </div>
    </div>
  );
}
