/**
 * MemberList Component
 * --------------------
 * - Hiển thị danh sách members với UI/UX cải thiện
 * - Cho phép sửa role (Admin only) và xóa từng member
 * - Enhanced design với loading states và accessibility
 */
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Check, 
  X, 
  Mail,
  UserCheck,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Trash2
} from "lucide-react";
import { TeamMember } from "../../../../../services/teamMemberApi";
import ConfirmModal from "./ConfirmModal";
import LoadingSpinner from "./LoadingSpinner";

// Support both current API structure and legacy structure  
type FlexibleTeamMember = TeamMember | {
  id?: string;
  _id?: string;
  user?: {
    id?: string;
    _id?: string;
    full_name?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  user_id?: {
    _id?: string;
    full_name?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  role: "Admin" | "Editor" | "Member";
  is_active?: boolean;
  joined_at?: string;
};

interface Props {
  members: FlexibleTeamMember[];
  loading: boolean;
  error: string | null;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemove: (memberId: string) => void;
  onAddMember?: () => void;
  teamRole?: string; // Current user's role in team
  teamName?: string; // Team name for confirmation dialog
}

export default function MemberList({ 
  members, 
  loading, 
  error, 
  onUpdateRole, 
  onRemove, 
  onAddMember,
  teamRole = 'Member',
  teamName = 'nhóm này'
}: Props) {
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("Member");
  const [confirm, setConfirm] = useState<{ visible: boolean; id?: string; member?: FlexibleTeamMember }>({ visible: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; memberId?: string; member?: FlexibleTeamMember; memberName?: string; teamName?: string }>({ visible: false, x: 0, y: 0 });
  
  // Debug logging
  console.log('🔍 MemberList - teamRole received:', teamRole);
  console.log('🔍 MemberList - teamRole type:', typeof teamRole);
  console.log('🔍 MemberList - contextMenu state:', contextMenu);
    // Permission checks - Admin có full quyền, Editor có thể edit role nhưng không thể xóa
  const canEditRoles = teamRole === 'Admin' || teamRole === 'Editor';
  const canRemoveMembers = teamRole === 'Admin';
  
  // Debug permission checks
  console.log('🔍 MemberList - canEditRoles:', canEditRoles);
  console.log('🔍 MemberList - canRemoveMembers:', canRemoveMembers);
  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0 });
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

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
      case 'editor': return <User className="h-4 w-4 text-yellow-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'leader': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'editor': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };  // Helper function to get member data correctly
  const getMemberData = (member: FlexibleTeamMember) => {
    // Debug logging to see actual data structure
    console.log('🐛 MemberList - Processing member:', JSON.stringify(member, null, 2));
    
    // Check if member has user object (current backend format)
    if ('user' in member && member.user) {
      const user = member.user as any;
      const memberId = (member as any).id || (member as any)._id || '';
      
      console.log('🐛 MemberList - User object found:', JSON.stringify(user, null, 2));
      console.log('🐛 MemberList - Member ID:', memberId);
      console.log('🐛 MemberList - Full name from user:', user.full_name);
      
      return {
        id: memberId,
        name: user.full_name || user.name || 'Không có tên',
        email: user.email || 'Không có email', 
        role: member.role
      };
    }
    
    // Check if member has user_id object (legacy MongoDB format)
    if ('user_id' in member && member.user_id) {
      const user = member.user_id as any;
      const memberId = (member as any)._id || '';
      
      console.log('🐛 MemberList - user_id object found:', JSON.stringify(user, null, 2));
      console.log('🐛 MemberList - Member ID:', memberId);
      
      return {
        id: memberId,
        name: user.full_name || user.name || 'Không có tên',
        email: user.email || 'Không có email', 
        role: member.role
      };
    }
    
    // Fallback for direct structure (shouldn't happen with current API)
    const anyMember = member as any;
    console.log('🐛 MemberList - Using fallback structure for member:', anyMember);
    return {
      id: anyMember.id || anyMember._id || '',
      name: anyMember.full_name || anyMember.name || 'Không có tên',
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
        </div>        {canEditRoles && onAddMember && (
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Thêm thành viên
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />          <input
            type="text"
            placeholder="Tìm kiếm thành viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 dark:bg-gray-700 dark:text-white"
          />
        </div>        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="min-w-[160px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 dark:bg-gray-700 dark:text-white cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="editor">Biên tập viên</option>
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
            <table className="w-full">              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thành viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">
                    Vai trò
                  </th>
                </tr>
              </thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member) => {
                  const memberData = getMemberData(member);
                    return (                  <tr 
                    key={memberData.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 ease-in-out relative group cursor-pointer"
                    onContextMenu={(e) => {
                      console.log('🐛 Right-click detected on member:', memberData.name);
                      console.log('🐛 Member role:', memberData.role);
                      console.log('🐛 Can remove members (teamRole === Admin):', canRemoveMembers);
                      console.log('🐛 Current user teamRole:', teamRole);
                      console.log('🐛 Is member not Admin:', memberData.role !== 'Admin');
                      console.log('🐛 Full condition check:', memberData.role !== 'Admin' && canRemoveMembers);
                      
                      // Chỉ hiển thị context menu cho non-Admin members và nếu có quyền xóa
                      if (memberData.role !== 'Admin' && canRemoveMembers) {
                        console.log('✅ Context menu should show! Preventing default and showing menu...');
                        e.preventDefault();
                        setContextMenu({
                          visible: true,
                          x: e.clientX,
                          y: e.clientY,
                          memberId: memberData.id,
                          member: member,
                          memberName: memberData.name,
                          teamName: teamName
                        });
                      } else {
                        console.log('❌ Context menu blocked - condition not met');
                        console.log('❌ Either member is Admin or user cannot remove members');
                      }
                    }}
                  >                    {/* Member Info */}
                    <td className="px-6 py-4 whitespace-nowrap">                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 ease-in-out transform hover:scale-110 cursor-pointer">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {memberData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
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
                    </td>                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editRoleId === memberData.id ? (
                        <div className="flex items-center gap-2">                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="min-w-[140px] w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer text-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                          >
                            <option value="Editor">Biên tập viên</option>
                            <option value="Member">Thành viên</option>
                          </select>                          <button
                            onClick={() => handleRoleUpdate(memberData.id, newRole)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-all duration-200 ease-in-out transform hover:scale-110"
                            title="Lưu"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditRoleId(null)}
                            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-all duration-200 ease-in-out transform hover:scale-110"
                            title="Hủy"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (                        <div className="flex items-center gap-2">
                          {getRoleIcon(memberData.role)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${getRoleBadgeColor(memberData.role)} ${memberData.role !== 'Admin' && canEditRoles ? 'hover:shadow-md cursor-pointer' : ''}`}>
                            {memberData.role === 'Admin' ? 'Quản trị viên' : 
                             memberData.role === 'Editor' ? 'Biên tập viên' : 
                             memberData.role === 'Member' ? 'Thành viên' : memberData.role}
                          </span>
                          {/* Dropdown icon chỉ cho non-Admin và có quyền edit */}
                          {memberData.role !== 'Admin' && canEditRoles && (
                            <button
                              onClick={() => {
                                setEditRoleId(memberData.id);
                                setNewRole(memberData.role);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-all duration-200 ease-in-out transform hover:scale-110"
                              title="Thay đổi vai trò"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          {console.log('🐛 Rendering context menu at position:', contextMenu.x, contextMenu.y)}
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ease-in-out flex items-center gap-2 rounded"
              onClick={() => {
                if (contextMenu.memberId && contextMenu.member) {
                  setConfirm({
                    visible: true,
                    id: contextMenu.memberId,
                    member: contextMenu.member
                  });
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </>
      )}

      {/* Confirm Remove Member Modal */}
      <ConfirmModal
        isOpen={confirm.visible}
        title="⚠️ Xóa thành viên khỏi nhóm"        message={
          <div className="space-y-3">
            <p>
              Bạn có chắc chắn muốn xóa <strong className="text-gray-900 dark:text-white">
                {confirm.member ? getMemberData(confirm.member).name : 'thành viên này'}              </strong> khỏi <strong className="text-gray-900 dark:text-white">
                {teamName}
              </strong>?
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Lưu ý:</strong> Sau khi xóa, thành viên này sẽ:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 ml-4 list-disc space-y-1">
                <li>Không còn ở trong nhóm này</li>
                <li>Mất quyền truy cập vào tất cả dự án trong nhóm</li>
                <li>Không thể xem được các dữ liệu và tài liệu của nhóm</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hành động này không thể hoàn tác.
            </p>
          </div>
        }
        onCancel={() => setConfirm({ visible: false })}
        onConfirm={handleRemoveConfirm}
        confirmText="Xóa khỏi nhóm"
        cancelText="Hủy bỏ"
        type="danger"
      />
    </div>
  );
}