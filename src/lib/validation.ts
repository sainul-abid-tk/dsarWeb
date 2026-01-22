import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const CompanyRegistrationSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  employeesCount: z.coerce.number().optional(),
  field: z.string().optional(),
  representation: z.enum(["EU", "UK", "EU_UK"]).default("EU"),
  logo: z.string().optional(),
});

export const DsarRequestSchema = z.object({
  requesterName: z.string().min(2, "Name is required"),
  requesterEmail: z.string().email("Invalid email"),
  requesterPhone: z.string().min(10, "Valid phone number required"),
  requestText: z.string().min(10, "Request details required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CompanyRegistrationInput = z.infer<typeof CompanyRegistrationSchema>;
export type DsarRequestInput = z.infer<typeof DsarRequestSchema>;
