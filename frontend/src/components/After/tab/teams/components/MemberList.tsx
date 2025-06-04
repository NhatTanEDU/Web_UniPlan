/**
 * MemberList Component
 * --------------------
 * - Hiển thị danh sách members với UI/UX cải thiện
 * - Cho phép sửa role (Admin only) và xóa từng member
 * - Enhanced design với loading states và accessibility
 */
import React, { useState } from "react";
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Mail,
  UserCheck,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { TeamMember } from "../../../../../services/teamMemberApi";
import ConfirmModal from "./ConfirmModal";
import LoadingSpinner from "./LoadingSpinner";

// Support both current API structure and legacy structure  
type FlexibleTeamMember = TeamMember | {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  role: "Admin" | "Editor" | "Member";
};

interface Props {
  members: FlexibleTeamMember[];
  loading: boolean;
  error: string | null;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemove: (memberId: string) => void;
  onAddMember?: () => void;
  teamRole?: string; // Current user's role in team
}

export default function MemberList({ 
  members, 
  loading, 
  error, 
  onUpdateRole, 
  onRemove, 
  onAddMember,
  teamRole = 'member'
}: Props) {
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("Member");
  const [confirm, setConfirm] = useState<{ visible: boolean; id?: string; member?: FlexibleTeamMember }>({ visible: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Permission checks
  const canEditRoles = teamRole === 'leader' || teamRole === 'admin';
  const canRemoveMembers = teamRole === 'leader' || teamRole === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thành viên nhóm</h3>
        </div>
        <LoadingSpinner text="Đang tải danh sách thành viên..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thành viên nhóm</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">Lỗi: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'leader': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'leader': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };  // Helper function to get member data correctly
  const getMemberData = (member: FlexibleTeamMember) => {
    // Debug logging to see actual data structure
    console.log('🐛 MemberList - Processing member:', JSON.stringify(member, null, 2));
    
    // Check if member has user object (both new and legacy format)
    if ('user' in member && member.user) {
      const user = member.user as any; // Safe casting since we know user exists
      const memberId = (member as any)._id || (member as any).id || '';
      
      console.log('🐛 MemberList - User object found:', JSON.stringify(user, null, 2));
      console.log('🐛 MemberList - Member ID:', memberId);
      console.log('🐛 MemberList - Full name from user:', user.full_name);
      console.log('🐛 MemberList - Legacy fullName from user:', user.fullName);
      
      return {
        id: memberId,
        name: user.full_name || user.fullName || 'Không có tên',
        email: user.email || 'Không có email', 
        role: member.role
      };
    }
    
    // Fallback for direct structure (shouldn't happen with current API)
    const anyMember = member as any;
    console.log('🐛 MemberList - Using fallback structure for member:', anyMember);
    return {
      id: anyMember.id || anyMember._id || '',
      name: anyMember.full_name || 'Không có tên',
      email: anyMember.email || 'Không có email',
      role: member.role
    };
  };

  // Filter members based on search and role
  const filteredMembers = members.filter(member => {
    const memberData = getMemberData(member);
    const matchesSearch = memberData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memberData.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || memberData.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleRoleUpdate = (memberId: string, role: string) => {
    onUpdateRole(memberId, role);
    setEditRoleId(null);
  };

  // const handleRemoveConfirm = () => {
  //   if (confirm.id) {
  //     onRemove(confirm.id);
  //     setConfirm({ visible: false });
  //   }
  // };
  const handleRemoveConfirm = () => {
    if (confirm.id) {
      onRemove(confirm.id);
      setConfirm({ visible: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Thành viên nhóm ({members.length})
          </h3>
        </div>
        {canEditRoles && onAddMember && (
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm thành viên
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thành viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="leader">Trưởng nhóm</option>
            <option value="admin">Quản trị viên</option>
            <option value="member">Thành viên</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || roleFilter !== 'all' 
              ? 'Không tìm thấy thành viên phù hợp'
              : 'Chưa có thành viên nào trong nhóm'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thành viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vai trò
                  </th>
                  {(canEditRoles || canRemoveMembers) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member) => {
                  const memberData = getMemberData(member);
                  
                  return (
                  <tr key={memberData.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {/* Member Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {memberData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {memberData.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {memberData.email}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editRoleId === memberData.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="leader">Trưởng nhóm</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="member">Thành viên</option>
                          </select>
                          <button
                            onClick={() => handleRoleUpdate(memberData.id, newRole)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Lưu"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditRoleId(null)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Hủy"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getRoleIcon(memberData.role)}
<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(memberData.role)}`}>
    {memberData.role === 'Admin' ? 'Quản trị viên' : // So sánh với 'Admin' (chữ hoa ở đầu)
     memberData.role === 'Editor' ? 'Biên tập viên' : // So sánh với 'Editor'
     memberData.role === 'Member' ? 'Thành viên' : memberData.role} {/* Thêm Member và fallback */}
</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    {(canEditRoles || canRemoveMembers) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {canEditRoles && editRoleId !== memberData.id && (
                            <button
                              onClick={() => {
                                setEditRoleId(memberData.id);
                                setNewRole(memberData.role);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chỉnh sửa vai trò"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}                          {canRemoveMembers && memberData.role !== 'Admin' && (
                            <button
                              onClick={() => setConfirm({ 
                                visible: true, 
                                id: memberData.id, 
                                member: member
                              })}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa thành viên"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}      {/* Confirm Remove Member Modal */}
      <ConfirmModal        isOpen={confirm.visible}
        title="⚠️ Xóa thành viên"
        message={`Bạn có chắc chắn muốn xóa ${
          confirm.member ? getMemberData(confirm.member).name : 'thành viên này'
        } khỏi nhóm? Hành động này không thể hoàn tác.`}
        onCancel={() => setConfirm({ visible: false })}
        onConfirm={handleRemoveConfirm}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}