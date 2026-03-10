import { z } from "zod";

export const CheckEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Implement other auth-related validation schemas here, such as etc, if there is
