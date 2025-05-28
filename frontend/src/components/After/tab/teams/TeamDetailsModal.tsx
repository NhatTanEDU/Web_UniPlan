interface TeamDetailsModalProps {
  isOpen: boolean;
  team: any;
  onClose: () => void;
  onUpdate: () => Promise<void>;
}
const TeamDetailsModal: React.FC<TeamDetailsModalProps> = () => null;
export default TeamDetailsModal;
export {};