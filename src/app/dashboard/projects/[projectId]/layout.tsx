import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectSubnav } from "./project-subnav";

function tabLinks(projectId: string) {
  const base = `/dashboard/projects/${projectId}`;
  return [
    { href: base, label: "Overview" },
    { href: `${base}/messages`, label: "Messages" },
    { href: `${base}/reports`, label: "Reports" },
    { href: `${base}/appeals`, label: "Appeals" },
    { href: `${base}/settings`, label: "Settings" },
    { href: `${base}/api-keys`, label: "API keys" },
    { href: `${base}/how-to-use`, label: "How to use" },
  ] as const;
}

export default async function ProjectSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await prisma.project.findFirst({
    where: { id: params.projectId, ownerId: session.user.id },
    select: { id: true, name: true, slug: true },
  });

  if (!project) {
    notFound();
  }

  const links = tabLinks(project.id);

  return (
    <div className="space-y-8">
      <div className="dash-hero">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-brand/10 blur-3xl dark:bg-brand/[0.07]" aria-hidden />
        <p className="relative text-sm text-[var(--muted)]">
          <Link href="/dashboard/projects" className="link-brand !text-sm font-medium">
            Projects
          </Link>
          <span className="mx-2 text-[var(--border-strong)]">/</span>
          <span className="font-medium text-[var(--foreground)]">{project.slug}</span>
        </p>
        <h1 className="relative mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-[2rem] md:leading-tight">
          {project.name}
        </h1>
        <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Domains, behavior, and appearance stay in sync with your embed. Changes apply on the next{" "}
          <code className="rounded-md border px-1.5 py-0.5 text-[0.8rem]" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
            GET /api/v1/config
          </code>
          .
        </p>
        <div className="relative mt-6">
          <ProjectSubnav links={links} />
        </div>
      </div>
      {children}
    </div>
  );
}
