// src/components/After/tab/members.tsx
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import PersonalMembersListWorking from "./members/PersonalMembersListWorking";
import PersonalMembersList from "./members/PersonalMembersList";
import React from "react";

export default function MembersPage() {
  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Danh sách Nhân viên của bạn"]} />        <main className="flex-1 overflow-y-auto p-4">
          {/* <PersonalMembersListWorking /> */}
          <PersonalMembersList />
          {/* Thêm các thành phần khác nếu cần */}
        </main>
        <Footer onFooterClick={handleFooterClick} />
        <TopButton />
      </div>
    </div>
  );
}
