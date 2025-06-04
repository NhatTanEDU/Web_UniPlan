/**
 * TeamMembers Page
 * ----------------
 * - Trang quản lý thành viên cho 1 team
 * - Sử dụng useTeamMembers, render MemberList + TeamMemberModal
 * - Lấy teamId từ URL params
 */
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTeamMembers } from "../hooks/useTeamMembers";
import MemberList from "../components/MemberList";
import TeamMemberModal from "../components/TeamMemberModal";

export default function TeamMembersPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { members, loading, error, addMembers, updateRole, removeMember } =
    useTeamMembers(teamId!);

  const [showModal, setShowModal] = useState(false);

  // Wrapper function to convert role string to UpdateMemberRoleData object
  const handleUpdateRole = async (memberId: string, role: string) => {
    await updateRole(memberId, { role: role as "Admin" | "Editor" | "Member" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Thành viên nhóm</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded">
          Thêm thành viên
        </button>
      </div>      {/* Danh sách thành viên */}
      <MemberList
        members={members}
        loading={loading}
        error={error}
        onUpdateRole={handleUpdateRole}
        onRemove={removeMember}
      />

      {/* Modal thêm thành viên */}      <TeamMemberModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        teamId={teamId!}
        onAdd={async list => {
          try {
            await addMembers(list);
            setShowModal(false); // Close modal only on successful addition
          } catch (err) {
            // Log the error for debugging
            console.error("Failed to add members:", err);
            // Optionally, display a user-friendly error message here (e.g., using a toast notification library)
            // For now, the modal remains open, allowing the user to retry or see that an issue occurred.
          }
        }}
      />
    </div>
  );
}