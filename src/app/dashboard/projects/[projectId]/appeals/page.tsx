import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectAppealsClient } from "./project-appeals-client";

export default async function ProjectAppealsPage({
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

  return <ProjectAppealsClient projectId={project.id} />;
}
