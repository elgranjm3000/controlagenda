import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  notes: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  duration_minutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  price: z.number().min(0, 'Price must be a positive number'),
  is_active: z.boolean().default(true),
});

export const appointmentSchema = z.object({
  client_id: z.number().min(1, 'Client is required'),
  service_id: z.number().min(1, 'Service is required'),
  user_id: z.number().min(1, 'Staff member is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  notes: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
