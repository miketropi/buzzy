import { z } from "zod";

export const accountProfilePatchSchema = z.object({
  name: z.string().min(1).max(120).trim(),
});

export const accountPasswordPatchSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
