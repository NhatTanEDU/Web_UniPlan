export interface User {
  _id: string;
  name?: string;
  full_name?: string; // Primary name field from backend
  email: string;
  avatar?: string;
}

export interface PersonalMember {
  _id: string;
  owner_user_id: string;
  member_user_id: User;
  custom_role: string;
  notes: string;
  is_active: boolean;
  added_at: string;
  updated_at: string;
}

export interface SearchUser {
  _id: string;
  name?: string;
  full_name?: string; // Primary name field from backend
  email: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number; // This total isn't strictly needed if pagination.total_items is used
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}