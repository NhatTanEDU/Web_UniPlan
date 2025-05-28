interface TeamCardProps {
  team: any;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  getRoleIcon: (role: string) => React.ReactNode;
}
const TeamCard: React.FC<TeamCardProps> = () => null;
export default TeamCard;
export {};