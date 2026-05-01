/**
 * Coerce Prisma Json (allowedDomains) to string[] for API/dashboard use.
 */
export function domainsFromJson(value: unknown): string[] {
  if (Array.isArray(value) && value.every((x) => typeof x === "string")) {
    return value as string[]
  }
  return []
}
