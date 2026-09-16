import { z } from "zod";

// Grants either an org-scoped staff membership (organizationId set) or
// platform-admin status (grantPlatformAdmin: true) — never both in one
// request, so the admin UI has to make an explicit, unambiguous choice
// rather than a form that could accidentally grant more than intended.
export const grantAccessSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    organizationId: z.uuid().optional(),
    grantPlatformAdmin: z.boolean().default(false),
  })
  .refine((value) => Boolean(value.organizationId) !== value.grantPlatformAdmin, {
    message: "Choose exactly one: assign to an organization, or grant platform admin.",
    path: ["organizationId"],
  });

export type GrantAccessInput = z.infer<typeof grantAccessSchema>;
