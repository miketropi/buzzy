import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateApiKeyForm } from "./create-api-key-form";
import { HostSsoCard } from "./host-sso-card";
import { RevokeApiKeyButton } from "./revoke-api-key-button";

export default async function ProjectApiKeysPage({
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
    select: { id: true },
  });

  if (!project) {
    notFound();
  }

  const keys = await prisma.apiKey.findMany({
    where: { projectId: project.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, environment: true, keyPrefix: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <CreateApiKeyForm projectId={project.id} />

      <HostSsoCard projectId={project.id} />

      <div>
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-200">Active keys</h2>
        {keys.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No keys yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {keys.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{k.name}</p>
                  <p className="font-mono text-xs text-slate-500">
                    {k.keyPrefix} · {k.environment}
                  </p>
                  <p className="text-xs text-slate-400">{k.createdAt.toLocaleString()}</p>
                </div>
                <RevokeApiKeyButton projectId={project.id} keyId={k.id} label={k.name} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
