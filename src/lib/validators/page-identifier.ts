import { z } from "zod";

/**
 * Value sent as `page_url` / `pageUrl`: stable id for the screen being commented on.
 * Use a full https URL when you can; otherwise a path (`/products/slug`), CMS slug, or internal id —
 * as long as the same string is reused for the same logical page.
 */
export const pageIdentifierSchema = z
  .string()
  .trim()
  .min(1, "page_url is required")
  .max(2048, "page_url is too long");
