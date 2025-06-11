// frontend/src/types/teamTypes.ts

// Định nghĩa chung cho User khi được populate hoặc tham chiếu
export interface UserReference {
  _id: string;
  name?: string;       // Tên hiển thị (có thể là name hoặc full_name từ User model)
  full_name?: string;  // Tên đầy đủ
  email: string;
  avatar?: string;
  // Thêm các trường khác của User bạn muốn dùng ở frontend
}

// Định nghĩa cho đối tượng Team chính mà API getTeamById trả về
export interface TeamDataFromAPI {
  _id: string;
  team_name: string; // Trường tên chính từ Team model
  description?: string;
  created_by?: UserReference; // Người tạo team (đã populate)
  createdAt: string;   // Từ timestamps của Mongoose (thường là camelCase)
  updatedAt: string;   // Từ timestamps của Mongoose
  userRole?: 'Admin' | 'Editor' | 'Member' | string; // Vai trò của người dùng hiện tại trong team này

  // Các trường này hiện không có trong Team model hoặc không được getTeamById trả về trực tiếp
  // Nếu bạn thêm chúng vào backend, hãy cập nhật interface này
  color?: string;        // Ví dụ: màu sắc đại diện cho team
  isPublic?: boolean;    // Ví dụ: team có công khai không
  completionRate?: number; // Ví dụ: tỷ lệ hoàn thành công việc của team (cần logic tính toán)
}

// Định nghĩa cho một thành viên trong danh sách thành viên của team (đã populate user_id)
export interface TeamMemberFrontend {
  _id: string; // ID của bản ghi trong collection TeamMember
  user_id: UserReference; // Thông tin user đã được populate
  role: 'Admin' | 'Editor' | 'Member'; // Vai trò trong team
  joined_at: string;
  is_active?: boolean; // Nếu API trả về
  // Thêm các trường khác từ TeamMember model nếu cần
}

// Định nghĩa cho một dự án liên quan đến team
export interface ProjectReference {
  _id: string;
  project_name: string;
  status?: string;
  description?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  // Thêm các trường khác của Project mà API trả về trong mảng relatedProjects
}

// Định nghĩa cấu trúc tổng thể mà hook useTeam có thể trả về (sau khi đã xử lý response từ API getTeamById)
// Hook useTeam của bạn hiện chỉ trả về team, không có members và relatedProjects.
// Bạn cần sửa useTeam hoặc TeamDetail sẽ gọi các hook khác để lấy members và projects.
// Dưới đây là ví dụ nếu useTeam được sửa để trả về đầy đủ:
export interface DetailedTeamResponse { // Đổi tên từ UseTeamHookResponse để rõ hơn
  team?: TeamDataFromAPI;
  members?: TeamMemberFrontend[];
  relatedProjects?: ProjectReference[];
}

// Nếu hook useTeam chỉ trả về team object từ API (tức là res.team từ getTeamById)
// thì kiểu trả về của nó sẽ là TeamDataFromAPI (hoặc Team từ teamApi.ts nếu nó khớp)
// export type UseTeamHookReturn = {
//   team: TeamDataFromAPI | null; // Hoặc Team từ teamApi nếu nó đã đúng
//   loading: boolean;
//   error: string | null;
// };