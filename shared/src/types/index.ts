// User and Authentication Types
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  TRAINER = 'TRAINER',
  ADMINISTRATOR = 'ADMINISTRATOR'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
  grade: string;
  managerId?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Training Domain Types
export enum PlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  status: PlanStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface Course {
  id: string;
  planId: string;
  name: string;
  description: string;
  duration: number; // in hours
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoundStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DeliveryMode {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL',
  HYBRID = 'HYBRID'
}

export interface Round {
  id: string;
  courseId: string;
  name: string;
  trainerId: string;
  providerId: string;
  maxSeats: number;
  enrolledCount: number;
  startDate: Date;
  endDate: Date;
  deliveryMode: DeliveryMode;
  venue?: string;
  teamsLink?: string;
  status: RoundStatus;
  sessions: Session[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  roundId: string;
  sessionNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  venue?: string;
  teamsLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider {
  id: string;
  name: string;
  type: 'INTERNAL' | 'EXTERNAL';
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trainer {
  id: string;
  userId: string;
  providerId: string;
  specializations: string[];
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment and Progress Types
export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  WAITLISTED = 'WAITLISTED'
}

export interface Enrollment {
  id: string;
  userId: string;
  roundId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  attendancePercentage: number;
  evaluationSubmitted: boolean;
  certificateIssued: boolean;
  certificateUrl?: string;
}

export interface Attendance {
  id: string;
  enrollmentId: string;
  sessionId: string;
  isPresent: boolean;
  markedBy: string;
  markedAt: Date;
  notes?: string;
}

// Assignment Types
export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export interface PlanAssignment {
  id: string;
  userId: string;
  planId: string;
  assignedBy: string;
  assignedAt: Date;
  dueDate?: Date;
  status: AssignmentStatus;
  completedAt?: Date;
}

// Survey and Evaluation Types
export enum SurveyType {
  COURSE_EVALUATION = 'COURSE_EVALUATION',
  MANAGER_BEHAVIOR_CHANGE = 'MANAGER_BEHAVIOR_CHANGE'
}

export enum SurveyStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export interface Survey {
  id: string;
  type: SurveyType;
  enrollmentId?: string;
  managerId?: string;
  employeeId?: string;
  status: SurveyStatus;
  scheduledDate: Date;
  completedAt?: Date;
  reminderSent: boolean;
  responses?: SurveyResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  questionId: string;
  response: string;
  rating?: number;
  submittedAt: Date;
}

// Notification Types
export enum NotificationType {
  PLAN_ASSIGNED = 'PLAN_ASSIGNED',
  COURSE_ASSIGNED = 'COURSE_ASSIGNED',
  ROUND_ADDED = 'ROUND_ADDED',
  ENROLLED = 'ENROLLED',
  REMINDER = 'REMINDER',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  CERTIFICATE_READY = 'CERTIFICATE_READY',
  SURVEY_DUE = 'SURVEY_DUE'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  CALENDAR = 'CALENDAR'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  sentAt?: Date;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard and Reporting Types
export interface DashboardStats {
  totalEmployees: number;
  activePlans: number;
  ongoingCourses: number;
  completionRate: number;
  pendingSurveys: number;
}

export interface EnrollmentReport {
  planName: string;
  courseName: string;
  roundName: string;
  employeeName: string;
  department: string;
  enrollmentDate: Date;
  completionDate?: Date;
  attendancePercentage: number;
  status: EnrollmentStatus;
}

// Import/Export Types
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

// File Upload Types
export interface FileUpload {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Certificate Types
export interface Certificate {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  issuedDate: Date;
  expiryDate?: Date;
  fileUrl: string;
  templateId: string;
  isValid: boolean;
  createdAt: Date;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  templateData: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 