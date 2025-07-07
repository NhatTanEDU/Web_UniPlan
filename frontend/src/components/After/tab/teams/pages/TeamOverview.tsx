/**
 * TeamOverview Page
 * ------------------
 * - Trang tổng quan: hiển thị danh sách teams
 * - Có thể thêm search/filter (sau này)
 */
import React from "react";
import TeamList from "../components/TeamList";

export default function TeamOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý Nhóm (Overview)</h1>
      {/* Có thể thêm component lọc/search ở đây */}
      <TeamList />
    </div>
  );
}