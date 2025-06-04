// src/components/After/tab/teams/teams.tsx
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import TeamList from "./components/TeamList";

export default function TeamPage() {
  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Quản lý nhóm"]} />          <main className="flex-1 overflow-y-auto p-4">
          <TeamList />
        </main>
        <Footer onFooterClick={handleFooterClick} />
        <TopButton />
      </div>
    </div>
  );
}
