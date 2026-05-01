import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectMessagesClient } from "./project-messages-client";

export default async function ProjectMessagesPage({
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
    select: { id: true, widgetMode: true },
  });

  if (!project) {
    notFound();
  }

  return <ProjectMessagesClient projectId={project.id} widgetMode={project.widgetMode} />;
}
