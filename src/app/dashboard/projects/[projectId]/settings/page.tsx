import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { COLOR_PRESETS, type ColorPresetId } from "@/lib/appearance-presets";
import { domainsFromJson } from "@/lib/json-domains";
import { prisma } from "@/lib/prisma";
import { defaultProjectSettings } from "@/lib/project-defaults";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { SettingsAndAppearanceClient } from "./settings-and-appearance-client";

function inferPresetFromPrimary(hex: string): ColorPresetId {
  const norm = hex.trim().toLowerCase();
  for (const p of COLOR_PRESETS) {
    if (p.id !== "custom" && p.primary.toLowerCase() === norm) return p.id;
  }
  return "custom";
}

export default async function ProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await prisma.project.findFirst({
    where: { id: params.projectId, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      widgetMode: true,
      moderationMode: true,
      allowedDomains: true,
      settings: true,
    },
  });

  if (!project) {
    notFound();
  }

  const domainsText = domainsFromJson(project.allowedDomains).join("\n");

  const defs = defaultProjectSettings();
  const raw =
    project.settings && typeof project.settings === "object"
      ? (project.settings as unknown as Record<string, unknown>)
      : {};

  const str = (k: string, fallback: string) => {
    const v = raw[k];
    return typeof v === "string" ? v : fallback;
  };

  const bool = (k: string, fallback: boolean) => {
    const v = raw[k];
    return typeof v === "boolean" ? v : fallback;
  };

  const primary = str("primaryColor", defs.primaryColor);
  const rawPreset = typeof raw.colorPreset === "string" && raw.colorPreset ? raw.colorPreset : "";
  const initialColorPreset = COLOR_PRESETS.some((p) => p.id === rawPreset)
    ? (rawPreset as ColorPresetId)
    : inferPresetFromPrimary(primary);

  const rawLayout = str("entryLayout", defs.entryLayout);
  const initialEntryLayout = ["list", "card_grid", "carousel"].includes(rawLayout) ? rawLayout : defs.entryLayout;

  const initialRequireApproval = bool("requireApproval", defs.requireApproval);
  const initialAutoApprove = !initialRequireApproval;
  const initialEnableAttachments = bool("enableAttachments", defs.enableAttachments);
  const initialAllowAnonymous = bool("allowAnonymous", defs.allowAnonymous);

  const submitStyles = ["filled", "outline", "soft"] as const;
  const rawSubmit = str("submitButtonStyle", defs.submitButtonStyle);
  const initialSubmitButtonStyle = submitStyles.includes(rawSubmit as (typeof submitStyles)[number])
    ? rawSubmit
    : defs.submitButtonStyle;

  const textScales = ["sm", "md", "lg"] as const;
  const rawTextScale = str("composerTextScale", defs.composerTextScale);
  const initialComposerTextScale = textScales.includes(rawTextScale as (typeof textScales)[number])
    ? rawTextScale
    : defs.composerTextScale;

  return (
    <SettingsAndAppearanceClient
      projectId={project.id}
      initialName={project.name}
      initialWidgetMode={normalizeWidgetMode(project.widgetMode)}
      initialModerationMode={project.moderationMode}
      initialDomainsText={domainsText}
      initialAutoApprove={initialAutoApprove}
      initialEnableAttachments={initialEnableAttachments}
      initialAllowAnonymous={initialAllowAnonymous}
      appearance={{
        theme: str("theme", defs.theme),
        primary,
        colorPreset: initialColorPreset,
        entryLayout: initialEntryLayout,
        borderRadius: str("borderRadius", defs.borderRadius),
        fontFamily: str("fontFamily", defs.fontFamily),
        useHostTypography: bool("useHostTypography", defs.useHostTypography),
        submitButtonStyle: initialSubmitButtonStyle,
        composerTextScale: initialComposerTextScale,
      }}
    />
  );
}
