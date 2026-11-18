export type Role = "ADMIN" | "SUPERVISOR" | "CUSTOMER_CARE" | "TECHNICAL";
export type TicketStatus = "PENDING" | "IN_PROGRESS" | "SOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Platform = "TIKTIKI" | "RETAIL" | "RANGS";
export type TimelineType = "COMMENT" | "STATUS_CHANGE" | "ASSIGN" | "SYSTEM";

export interface UserRef {
  _id: string;
  name: string;
  role: Role;
}

export interface User {
  _id: string;
  name: string;
  phone: string;
  username: string;
  role: Role;
  is_active: boolean;
  last_login?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  ticket_no: string;
  customer_name?: string;
  vehicle_reg?: string;
  customer_phone: string;
  device_id: string;
  problem_type: string;
  problem_description: string;
  platform: Platform;
  priority: Priority;
  status: TicketStatus;
  created_by: UserRef | null;
  assigned_to: UserRef | null;
  solved_by: UserRef | null;
  solved_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEntry {
  _id: string;
  ticket_id: string;
  message: string;
  type: TimelineType;
  created_by: UserRef | null;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketListResponse {
  success: boolean;
  tickets: Ticket[];
  pagination: Pagination;
}

export interface TechnicianStat {
  _id: string;
  name: string;
  assigned: number;
  open: number;
  solved: number;
}

export interface TicketStats {
  total: number;
  byStatus: Partial<Record<TicketStatus, number>>;
  byPriority: Partial<Record<Priority, number>>;
  byPlatform: Partial<Record<Platform, number>>;
  urgentOpen: number;
  unassigned: number;
  byTechnician?: TechnicianStat[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
