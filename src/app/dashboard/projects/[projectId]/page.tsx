import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { domainsFromJson } from "@/lib/json-domains";
import { prisma } from "@/lib/prisma";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { DeleteProjectButton } from "./delete-project-button";

export default async function ProjectOverviewPage({
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
      slug: true,
      widgetMode: true,
      moderationMode: true,
      allowedDomains: true,
      createdAt: true,
    },
  });

  if (!project) {
    notFound();
  }

  const allowedDomains = domainsFromJson(project.allowedDomains);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Widget mode
          </h2>
          <p className="mt-2 font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            {normalizeWidgetMode(project.widgetMode)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
            Controls comment thread vs review/rating flows in the public API and widget config.
          </p>
        </div>
        <div className="card-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Moderation
          </h2>
          <p className="mt-2 font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            {project.moderationMode}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
            Auto-approved content or manual review before it appears on your pages.
          </p>
        </div>
      </div>

      <div className="card-surface p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Allowed domains</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Origins that may call the public API with your key. Wildcards like{" "}
          <code className="rounded bg-slate-100 px-1 font-mono text-[0.7rem] dark:bg-slate-800">*.example.com</code> are
          supported.
        </p>
        {allowedDomains.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">None yet — add them in Settings.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {allowedDomains.map((d) => (
              <li
                key={d}
                className="rounded-lg border border-slate-200/90 bg-slate-50/80 px-3 py-2 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
              >
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400">Created {project.createdAt.toLocaleString()}</p>

      <div className="rounded-2xl border border-red-200/90 bg-red-50/40 p-5 dark:border-red-900/50 dark:bg-red-950/25">
        <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">Danger zone</h2>
        <p className="mt-2 text-sm leading-relaxed text-red-800/90 dark:text-red-300/90">
          Deleting removes the project and related data (API keys, comments, reviews) from the database. This cannot be
          undone.
        </p>
        <div className="mt-4">
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </div>
    </div>
  );
}
