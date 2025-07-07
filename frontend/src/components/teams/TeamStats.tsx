// src/components/teams/TeamStats.tsx
import React from 'react';
import { Users, FolderOpen, Archive, BarChart3 } from 'lucide-react';
import { TeamStatsData } from '../../services/teamApi';

interface TeamStatsProps {
  stats: TeamStatsData | null;
  loading: boolean;
  onStatClick?: (statType: 'total' | 'withMembers' | 'withProjects' | 'empty') => void;
}

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}> = ({ icon, label, value, color, onClick, clickable = false }) => (
  <div 
    className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 ${
      clickable ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200' : ''
    }`}
    onClick={clickable ? onClick : undefined}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
    {clickable && (
      <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
        →
      </div>
    )}
  </div>
);

const TeamStats: React.FC<TeamStatsProps> = ({ stats, loading, onStatClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-24 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard 
        icon={<BarChart3 className="w-5 h-5 text-white" />} 
        label="Tổng số nhóm" 
        value={stats.totalTeams} 
        color="bg-purple-500"
        onClick={() => onStatClick?.('total')}
        clickable={!!onStatClick}
      />
      <StatCard 
        icon={<Users className="w-5 h-5 text-white" />} 
        label="Nhóm có thành viên" 
        value={stats.teamsWithMembers} 
        color="bg-blue-500"
        onClick={() => onStatClick?.('withMembers')}
        clickable={!!onStatClick}
      />
      <StatCard 
        icon={<FolderOpen className="w-5 h-5 text-white" />} 
        label="Nhóm có dự án" 
        value={stats.teamsWithProjects} 
        color="bg-green-500"
        onClick={() => onStatClick?.('withProjects')}
        clickable={!!onStatClick}
      />
      <StatCard 
        icon={<Archive className="w-5 h-5 text-white" />} 
        label="Nhóm trống" 
        value={stats.emptyTeams} 
        color="bg-yellow-500"
        onClick={() => onStatClick?.('empty')}
        clickable={!!onStatClick}
      />
    </div>
  );
};

export default TeamStats;
