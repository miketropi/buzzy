import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(120).trim(),
  password: z.string().min(8).max(128),
});

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
