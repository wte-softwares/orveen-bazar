import { z } from "zod";
import { isDisposableEmailDomain } from "@/lib/validation/disposable-email";

// Matches supabase/config.toml's [auth] minimum_password_length = 6, but the
// app requires a stronger 8 chars — the DB-side minimum is a floor, this is
// the actual product requirement.
const password = z.string().min(8, "Password must be at least 8 characters.");
const email = z.string().trim().toLowerCase().email("Enter a valid email address.");

// Registration only — login/forgot-password/reset-password must still work
// for an account that registered before this check existed, or one where
// the domain is later added to the blocklist.
const nonDisposableEmail = email.refine(
  (value) => !isDisposableEmailDomain(value),
  "Temporary or disposable email addresses aren't allowed. Please use a permanent email address.",
);

export const registerSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required.").max(100),
  email: nonDisposableEmail,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  password,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
