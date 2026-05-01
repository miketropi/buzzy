import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultProjectSettings } from "@/lib/project-defaults";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { EmbedHowToPanel } from "@/components/embed-howto-panel";

export default async function ProjectHowToUsePage({
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
    select: { id: true, settings: true, widgetMode: true },
  });

  if (!project) {
    notFound();
  }

  const defs = defaultProjectSettings();
  const raw =
    project.settings && typeof project.settings === "object"
      ? (project.settings as unknown as Record<string, unknown>)
      : {};
  const widgetMode = normalizeWidgetMode(
    typeof raw.widgetMode === "string" && raw.widgetMode
      ? raw.widgetMode
      : project.widgetMode || defs.widgetMode,
  );

  const sdkUrl = process.env.NEXT_PUBLIC_SDK_URL ?? "http://localhost:3000/buzzy.js";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <EmbedHowToPanel
        projectId={project.id}
        sdkUrl={sdkUrl}
        widgetMode={widgetMode}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  );
}
