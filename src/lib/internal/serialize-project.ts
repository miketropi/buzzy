import type { Project } from "@prisma/client";

import { domainsFromJson } from "@/lib/json-domains";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";

export function toProjectResponse(project: Project) {
  const s = project.settings;
  let settings: Record<string, unknown> | null = null;
  if (s && typeof s === "object") {
    const secretKeys = ["ssoSecretKey", "akismetApiKey", "captchaSecretKey"] as const;
    const rest = { ...(s as Record<string, unknown>) };
    for (const k of secretKeys) {
      delete rest[k];
    }
    settings = { ...rest, hasSsoSecret: Boolean((s as Record<string, unknown>).ssoSecretKey) };
  }
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    ownerId: project.ownerId,
    allowedDomains: domainsFromJson(project.allowedDomains),
    widgetMode: normalizeWidgetMode(project.widgetMode),
    settings,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
