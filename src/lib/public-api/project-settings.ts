import type { Prisma } from "@prisma/client";

import { defaultProjectSettings } from "@/lib/project-defaults";

export type EffectiveProjectSettings = ReturnType<typeof defaultProjectSettings>;

export function getEffectiveSettings(settings: Prisma.JsonValue | null | undefined): EffectiveProjectSettings {
  const base = defaultProjectSettings();
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return { ...base, ...(settings as Record<string, unknown>) } as EffectiveProjectSettings;
  }
  return base;
}
