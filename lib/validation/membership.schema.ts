import { z } from "zod";

// Grants either an org-scoped staff membership (organizationId set) or
// platform-admin status (grantPlatformAdmin: true or role: 'platform_admin').
// Also supports optional displayName for invitation emails/profile metadata.
export const grantAccessSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    displayName: z.string().trim().min(1, "Display name cannot be empty.").max(100).optional(),
    role: z.enum(["platform_admin", "staff"]).optional(),
    organizationId: z.uuid().optional(),
    grantPlatformAdmin: z.boolean().default(false),
  })
  .transform((data) => {
    const isPlatformAdmin = data.role === "platform_admin" || data.grantPlatformAdmin;
    return {
      ...data,
      grantPlatformAdmin: isPlatformAdmin,
      role: isPlatformAdmin ? ("platform_admin" as const) : ("staff" as const),
    };
  })
  .refine(
    (value) => {
      if (value.grantPlatformAdmin) {
        return !value.organizationId;
      }
      return Boolean(value.organizationId);
    },
    {
      message: "Choose exactly one: assign to an organization as staff, or grant platform admin.",
      path: ["organizationId"],
    },
  );

export type GrantAccessInput = z.infer<typeof grantAccessSchema>;
