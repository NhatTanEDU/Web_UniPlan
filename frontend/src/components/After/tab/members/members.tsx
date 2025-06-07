// src/components/After/tab/members.tsx
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import PersonalMembersList from "./members/PersonalMembersList";
import React from "react";
import { Toaster } from 'react-hot-toast'; // Import Toaster

export default function MembersPage() {
  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Toaster component để hiển thị thông báo toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000, // Thông báo tồn tại trong 5 giây
          success: {
            style: {
              background: '#10b981', // Màu xanh lá đẹp
              color: 'white',
              fontWeight: '500',
            },
          },
          error: {
            style: {
              background: '#ef4444', // Màu đỏ đẹp
              color: 'white',
              fontWeight: '500',
            },
          },
          loading: {
            style: {
              background: '#3b82f6', // Màu xanh dương
              color: 'white',
              fontWeight: '500',
            },
          },
        }}
      />
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
