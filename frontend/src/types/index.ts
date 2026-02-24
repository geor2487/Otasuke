// Enums
export type UserRole = "contractor" | "subcontractor";
export type ProjectStatus = "draft" | "open" | "closed" | "in_progress" | "completed" | "cancelled";
export type QuoteStatus = "submitted" | "accepted" | "rejected" | "withdrawn";
export type OrderStatus = "confirmed" | "in_progress" | "completed" | "cancelled";
export type NotificationType =
  | "quote_received"
  | "quote_accepted"
  | "quote_rejected"
  | "order_confirmed"
  | "order_completed"
  | "review_received"
  | "project_updated";

// Auth
export type UserRegisterRequest = {
  email: string;
  password: string;
  role: UserRole;
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type UserResponse = {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};

// Company
export type CompanyCreate = {
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  established_year?: number | null;
  employee_count?: number | null;
};

export type CompanyUpdate = {
  name?: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  established_year?: number | null;
  employee_count?: number | null;
};

export type CompanyResponse = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  established_year: number | null;
  employee_count: number | null;
  average_rating: number | null;
  created_at: string;
  updated_at: string;
};

export type SpecialtyResponse = {
  id: string;
  name: string;
};

export type CompanyWithSpecialtiesResponse = CompanyResponse & {
  specialties: SpecialtyResponse[];
};

export type CompanySpecialtiesUpdate = {
  specialty_ids: string[];
};

// Project
export type ProjectCreate = {
  title: string;
  description?: string | null;
  location?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  deadline?: string | null;
  required_specialty_id?: string | null;
};

export type ProjectUpdate = {
  title?: string;
  description?: string | null;
  location?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  deadline?: string | null;
  required_specialty_id?: string | null;
};

export type ProjectStatusUpdate = {
  status: ProjectStatus;
};

export type ProjectFileResponse = {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
};

export type ProjectResponse = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  required_specialty_id: string | null;
  created_at: string;
  updated_at: string;
  files: ProjectFileResponse[];
};

export type ProjectListResponse = {
  items: ProjectResponse[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

// Quote
export type QuoteCreate = {
  amount: number;
  message?: string | null;
  estimated_days?: number | null;
};

export type QuoteResponse = {
  id: string;
  project_id: string;
  company_id: string;
  amount: number;
  message: string | null;
  estimated_days: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type QuoteListResponse = {
  items: QuoteResponse[];
  total: number;
};

// Order
export type OrderResponse = {
  id: string;
  project_id: string;
  quote_id: string;
  contractor_company_id: string;
  subcontractor_company_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type OrderListResponse = {
  items: OrderResponse[];
  total: number;
};

// Review
export type ReviewCreate = {
  rating: number;
  comment?: string | null;
};

export type ReviewResponse = {
  id: string;
  order_id: string;
  reviewer_company_id: string;
  reviewee_company_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ReviewListResponse = {
  items: ReviewResponse[];
  total: number;
  average_rating: number | null;
};

// Notification
export type NotificationResponse = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  reference_id: string | null;
  created_at: string;
};

export type NotificationListResponse = {
  items: NotificationResponse[];
  total: number;
  unread_count: number;
};

// Direct Order
export type DirectOrderStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DirectOrderCreate = {
  title: string;
  description?: string | null;
  location?: string | null;
  amount: number;
  deadline?: string | null;
  specialty_id?: string | null;
  subcontractor_company_id: string;
};

export type DirectOrderDecline = {
  decline_reason?: string | null;
};

export type DirectOrderResponse = {
  id: string;
  contractor_company_id: string;
  subcontractor_company_id: string;
  title: string;
  description: string | null;
  location: string | null;
  amount: number;
  deadline: string | null;
  specialty_id: string | null;
  status: DirectOrderStatus;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
  contractor_company_name: string;
  subcontractor_company_name: string;
  specialty_name: string | null;
};

export type DirectOrderListResponse = {
  items: DirectOrderResponse[];
  total: number;
};

// Subcontractor list
export type SubcontractorListResponse = {
  items: CompanyWithSpecialtiesResponse[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

// Dashboard
export type ContractorDashboard = {
  total_projects: number;
  open_projects: number;
  in_progress_projects: number;
  completed_projects: number;
  total_orders: number;
  pending_quotes: number;
};

export type SubcontractorDashboard = {
  total_quotes: number;
  accepted_quotes: number;
  active_orders: number;
  completed_orders: number;
  average_rating: number | null;
};
