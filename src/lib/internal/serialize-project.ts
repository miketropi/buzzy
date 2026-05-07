import type { Project } from "@prisma/client";

import { domainsFromJson } from "@/lib/json-domains";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";

export function toProjectResponse(project: Project) {
  const s = project.settings;
  let settings: Record<string, unknown> | null = null;
  if (s && typeof s === "object") {
    const { ssoSecretKey: _ignored, ...rest } = s as Record<string, unknown> & {
      ssoSecretKey?: string | null;
    };
    settings = { ...rest, hasSsoSecret: Boolean(_ignored) };
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
