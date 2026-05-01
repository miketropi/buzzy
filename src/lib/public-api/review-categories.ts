import { Prisma } from "@prisma/client";

import { ValidationError } from "@/lib/utils/errors";

export function parseCategoryRatingsForCreate(
  raw: Record<string, number> | undefined,
  scale: number,
  ratingCategories: string[],
): Prisma.InputJsonValue | undefined {
  if (!raw || Object.keys(raw).length === 0) {
    return undefined;
  }
  const allowed = new Set(ratingCategories);
  for (const [k, v] of Object.entries(raw)) {
    if (allowed.size > 0 && !allowed.has(k)) {
      throw new ValidationError(`Unknown category: ${k}`);
    }
    if (!Number.isInteger(v) || v < 1 || v > scale) {
      throw new ValidationError(`Rating for "${k}" must be between 1 and ${scale}`);
    }
  }
  return raw as unknown as Prisma.InputJsonValue;
}

export function parseCategoryRatingsForPatch(
  raw: Record<string, number> | undefined,
  scale: number,
  ratingCategories: string[],
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (Object.keys(raw).length === 0) {
    return Prisma.JsonNull;
  }
  return parseCategoryRatingsForCreate(raw, scale, ratingCategories);
}
