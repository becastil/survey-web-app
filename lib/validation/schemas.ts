/**
 * Zod validation schemas for type-safe input validation
 */

import { z } from 'zod';

// User schemas
export const userRoleSchema = z.enum(['admin', 'analyst', 'viewer']);

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: userRoleSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Survey schemas
export const surveyStatusSchema = z.enum(['draft', 'active', 'completed', 'archived']);

export const createSurveySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000),
  status: surveyStatusSchema.default('draft'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const updateSurveySchema = createSurveySchema.partial();

export const surveySchema = createSurveySchema.extend({
  id: z.string(),
  created_by: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Question schemas
export const questionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'text',
  'number',
  'date',
  'scale',
]);

export const createQuestionSchema = z.object({
  survey_id: z.string(),
  question_text: z.string().min(3).max(500),
  question_type: questionTypeSchema,
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  options: z.array(z.string()).optional(),
  help_text: z.string().max(500).optional(),
  scale_min: z.number().int().optional(),
  scale_max: z.number().int().optional(),
  scale_label_min: z.string().max(50).optional(),
  scale_label_max: z.string().max(50).optional(),
});

export const questionSchema = createQuestionSchema.extend({
  id: z.string(),
});

// Response schemas
export const responseStatusSchema = z.enum(['in_progress', 'completed']);

export const createResponseSchema = z.object({
  survey_id: z.string(),
  respondent_email: z.string().email().optional(),
  status: responseStatusSchema.default('in_progress'),
});

export const responseSchema = createResponseSchema.extend({
  id: z.string(),
  respondent_id: z.string().optional(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
});

// Answer schemas
export const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
  z.boolean(),
  z.date(),
]);

export const createAnswerSchema = z.object({
  response_id: z.string(),
  question_id: z.string(),
  survey_id: z.string(),
  answer_value: answerValueSchema.optional(),
  answer_text: z.string().optional(),
  answer_number: z.number().optional(),
  answer_date: z.string().datetime().optional(),
  selected_option_ids: z.array(z.string()).optional(),
});

export const answerSchema = createAnswerSchema.extend({
  id: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Login/Register schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Survey = z.infer<typeof surveySchema>;
export type CreateSurvey = z.infer<typeof createSurveySchema>;
export type UpdateSurvey = z.infer<typeof updateSurveySchema>;
export type Question = z.infer<typeof questionSchema>;
export type CreateQuestion = z.infer<typeof createQuestionSchema>;
export type Response = z.infer<typeof responseSchema>;
export type CreateResponse = z.infer<typeof createResponseSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type CreateAnswer = z.infer<typeof createAnswerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;