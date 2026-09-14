import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string({ error: "Enter your full name." })
    .trim()
    .min(1, "Enter your full name.")
    .max(120, "Use 120 characters or fewer for your name.")
    .regex(/\p{L}/u, "Enter your full name.")
    .regex(/^[^\p{Cc}]*$/u, "Enter your name on one line."),
  email: z.string({ error: "Enter your email address." })
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Use 254 characters or fewer for your email address.")
    .pipe(z.email({ error: "Enter a valid email address." }).toLowerCase()),
});

export const registrationResultSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    message: z.string(),
    fieldErrors: z.object({
      fullName: z.array(z.string()).optional(),
      email: z.array(z.string()).optional(),
    }).optional(),
  }),
]);

export type Registration = z.infer<typeof registrationSchema>;
export type RegistrationResult = z.infer<typeof registrationResultSchema>;
