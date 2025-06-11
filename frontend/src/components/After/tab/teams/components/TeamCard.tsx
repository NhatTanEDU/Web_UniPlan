/**
 * TeamCard Component
 * -------------------
 * - Card component to display team information
 * - Supports both grid and list view modes
 * - Includes click to navigate to team detail
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Activity } from 'lucide-react';

interface Team {
  _id: string;
  name: string;
  description: string;
  color?: string;
  isPublic?: boolean;
  memberCount: number;
  projectCount: number;
  completionRate?: number;
  userRole: 'leader' | 'admin' | 'member';
  createdAt: string;
  recentActivity?: number;
}

interface TeamCardProps {
  team: Team;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  getRoleIcon?: (role: string) => React.ReactNode;
}

const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  viewMode, 
  isSelected = false, 
  onSelect, 
  onView,
  getRoleIcon 
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or action buttons
    if ((e.target as HTMLElement).closest('.action-button') || 
        (e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    
    navigate(`/teams/${team._id}`);
  };

  const getTeamColor = () => {
    return team.color || '#3B82F6'; // Default blue color
  };

  const getRoleDisplay = () => {
    const roleMap = {
      leader: 'Trưởng nhóm',
      admin: 'Quản trị viên',
      member: 'Thành viên'
    };
    return roleMap[team.userRole] || 'Thành viên';
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm"
              style={{ backgroundColor: getTeamColor() }}
            >
              {team.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {team.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {getRoleIcon && getRoleIcon(team.userRole)}
                  <span>{getRoleDisplay()}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {team.description || 'Không có mô tả'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{team.memberCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{team.projectCount}</span>
            </div>
            {team.recentActivity !== undefined && (
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>{team.recentActivity}</span>
              </div>
            )}
            <span className={`px-2 py-1 rounded text-xs ${
              team.isPublic 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            }`}>
              {team.isPublic ? 'Công khai' : 'Riêng tư'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={handleCardClick}
    >
      {onSelect && (
        <div className="mb-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: getTeamColor() }}
          >
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {team.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              {getRoleIcon && getRoleIcon(team.userRole)}
              <span className="capitalize">{getRoleDisplay()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {team.description || 'Không có mô tả'}
      </p>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {team.memberCount}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {team.projectCount}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${
          team.isPublic 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
        }`}>
          {team.isPublic ? 'Công khai' : 'Riêng tư'}
        </span>
      </div>
      
      {team.completionRate !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Tiến độ hoàn thành</span>
            <span>{team.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${team.completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCard;
