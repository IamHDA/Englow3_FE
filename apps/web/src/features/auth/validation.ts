import { z } from "zod";

export const authEmail = z.string().trim().email().max(320);
export const newAuthPassword = z
  .string()
  .min(8)
  .max(1024)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[^A-Za-z0-9]/);
export const registrationRequest = z.object({
  email: authEmail,
  password: newAuthPassword,
  fullName: z.string().trim().min(2).max(200),
  displayName: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,20}$/),
  birthDate: z.iso
    .date()
    .refine((date) => date <= new Date().toISOString().slice(0, 10)),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  acceptedTerms: z.literal(true),
});
