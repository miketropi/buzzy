import { z } from "zod";

export const listInternalReportsQuerySchema = z.object({
  status: z.enum(["pending", "dismissed", "actioned", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).max(10_000).optional(),
});

export const patchInternalReportBodySchema = z.object({
  status: z.enum(["pending", "dismissed", "actioned"]),
});

export const bulkInternalReportsBodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(["pending", "dismissed", "actioned"]),
});
