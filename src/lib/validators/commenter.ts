import { z } from "zod";

/**
 * Guest commenter on public API. Invalid optional emails are coerced to "" so a typo
 * in "Email (optional)" does not reject the whole POST.
 */
export const commenterAnonymousSchema = z.object({
  name: z.string().min(1).max(120),
  email: z
    .preprocess((v) => (v == null || v === "" ? "" : String(v)), z.string().max(200))
    .transform((t) => {
      const s = t.trim();
      if (!s) return "";
      return z.string().email().safeParse(s).success ? s : "";
    }),
});
