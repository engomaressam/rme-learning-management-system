import { z } from 'zod';
import { UserRole, DeliveryMode, PlanStatus, CourseStatus, RoundStatus } from '../types';

// Authentication Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  grade: z.string().min(1, 'Grade is required'),
  role: z.nativeEnum(UserRole).default(UserRole.EMPLOYEE)
});

// Plan Schemas
export const CreatePlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  status: z.nativeEnum(PlanStatus).default(PlanStatus.DRAFT)
});

export const UpdatePlanSchema = CreatePlanSchema.partial();

// Course Schemas
export const CreateCourseSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  name: z.string().min(1, 'Course name is required'),
  description: z.string().optional(),
  duration: z.number().positive('Duration must be positive'),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT)
});

export const UpdateCourseSchema = CreateCourseSchema.partial().omit({ planId: true });

// Round Schemas
export const CreateRoundSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  name: z.string().min(1, 'Round name is required'),
  trainerId: z.string().uuid('Invalid trainer ID'),
  providerId: z.string().uuid('Invalid provider ID'),
  maxSeats: z.number().positive('Max seats must be positive'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  deliveryMode: z.nativeEnum(DeliveryMode),
  venue: z.string().optional(),
  teamsLink: z.string().url().optional(),
  status: z.nativeEnum(RoundStatus).default(RoundStatus.SCHEDULED)
}).refine((data: any) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const UpdateRoundSchema = z.object({
  name: z.string().min(1, 'Round name is required').optional(),
  trainerId: z.string().uuid('Invalid trainer ID').optional(),
  providerId: z.string().uuid('Invalid provider ID').optional(),
  maxSeats: z.number().positive('Max seats must be positive').optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  deliveryMode: z.nativeEnum(DeliveryMode).optional(),
  venue: z.string().optional(),
  teamsLink: z.string().url().optional(),
  status: z.nativeEnum(RoundStatus).optional()
}).refine((data: any) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Session Schemas
export const CreateSessionSchema = z.object({
  roundId: z.string().uuid('Invalid round ID'),
  sessionNumber: z.number().positive('Session number must be positive'),
  date: z.string().datetime('Invalid date'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format (HH:MM)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format (HH:MM)'),
  venue: z.string().optional(),
  teamsLink: z.string().url().optional()
});

// Provider Schemas
export const CreateProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  type: z.enum(['INTERNAL', 'EXTERNAL']),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const UpdateProviderSchema = CreateProviderSchema.partial();

// Trainer Schemas
export const CreateTrainerSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  providerId: z.string().uuid('Invalid provider ID'),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  bio: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const UpdateTrainerSchema = CreateTrainerSchema.partial().omit({ userId: true });

// Enrollment Schemas
export const EnrollmentSchema = z.object({
  roundId: z.string().uuid('Invalid round ID')
});

// Attendance Schemas
export const MarkAttendanceSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  enrollmentId: z.string().uuid('Invalid enrollment ID'),
  isPresent: z.boolean(),
  notes: z.string().optional()
});

export const BulkAttendanceSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  attendance: z.array(z.object({
    enrollmentId: z.string().uuid('Invalid enrollment ID'),
    isPresent: z.boolean(),
    notes: z.string().optional()
  }))
});

// Assignment Schemas
export const CreateAssignmentSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user must be selected'),
  planId: z.string().uuid('Invalid plan ID'),
  dueDate: z.string().datetime().optional()
});

// Survey Schemas
export const SurveyResponseSchema = z.object({
  responses: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    response: z.string().min(1, 'Response is required'),
    rating: z.number().min(1).max(5).optional()
  })).min(1, 'At least one response is required')
});

// Notification Schemas
export const CreateNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user must be selected'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  channels: z.array(z.enum(['EMAIL', 'IN_APP', 'CALENDAR'])).min(1, 'At least one channel is required')
});

// Query Schemas
export const PaginationSchema = z.object({
  page: z.string().transform((val: string) => parseInt(val) || 1),
  limit: z.string().transform((val: string) => Math.min(parseInt(val) || 10, 100)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const ReportFiltersSchema = PaginationSchema.merge(DateRangeSchema).extend({
  department: z.string().optional(),
  grade: z.string().optional(),
  planId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  roundId: z.string().uuid().optional(),
  status: z.string().optional()
});

// File Upload Schemas
export const FileUploadSchema = z.object({
  file: z.any().refine((file: any) => file?.size > 0, 'File is required'),
  type: z.enum(['CSV', 'EXCEL', 'PDF', 'IMAGE'])
});

// Import Schemas
export const ImportPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  status: z.string().optional().default('ACTIVE')
});

export const ImportUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  grade: z.string().min(1, 'Grade is required'),
  managerId: z.string().optional(),
  role: z.string().optional().default('EMPLOYEE')
});

export const ImportAssignmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  planName: z.string().min(1, 'Plan name is required'),
  dueDate: z.string().optional()
});

// Certificate Schemas
export const GenerateCertificateSchema = z.object({
  enrollmentId: z.string().uuid('Invalid enrollment ID'),
  templateId: z.string().uuid('Invalid template ID')
});

// Export Types
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
export type CreateRoundInput = z.infer<typeof CreateRoundSchema>;
export type UpdateRoundInput = z.infer<typeof UpdateRoundSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type CreateProviderInput = z.infer<typeof CreateProviderSchema>;
export type UpdateProviderInput = z.infer<typeof UpdateProviderSchema>;
export type CreateTrainerInput = z.infer<typeof CreateTrainerSchema>;
export type UpdateTrainerInput = z.infer<typeof UpdateTrainerSchema>;
export type EnrollmentInput = z.infer<typeof EnrollmentSchema>;
export type MarkAttendanceInput = z.infer<typeof MarkAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof BulkAttendanceSchema>;
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type SurveyResponseInput = z.infer<typeof SurveyResponseSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type DateRangeInput = z.infer<typeof DateRangeSchema>;
export type ReportFiltersInput = z.infer<typeof ReportFiltersSchema>;
export type ImportPlanInput = z.infer<typeof ImportPlanSchema>;
export type ImportUserInput = z.infer<typeof ImportUserSchema>;
export type ImportAssignmentInput = z.infer<typeof ImportAssignmentSchema>;
export type GenerateCertificateInput = z.infer<typeof GenerateCertificateSchema>; 