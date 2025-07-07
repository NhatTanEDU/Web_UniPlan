// src/types/project.ts
export interface Project {
  _id: string;
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  project_type_id?: { _id: string; name: string };
  project_type?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_by: string;
  created_at: string;
}