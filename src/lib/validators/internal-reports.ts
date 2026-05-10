import { z } from "zod";

export const listInternalReportsQuerySchema = z.object({
  status: z.enum(["pending", "dismissed", "actioned", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const patchInternalReportBodySchema = z.object({
  status: z.enum(["pending", "dismissed", "actioned"]),
});
