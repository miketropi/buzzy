import { ProjectSettingsSubnav } from "./project-settings-subnav";

export default function ProjectSettingsSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return (
    <div className="space-y-6">
      <ProjectSettingsSubnav projectId={params.projectId} />
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-[0.9375rem]">
        The <span className="font-medium text-[var(--foreground)]">General</span> tab covers name, widget mode, domains,
        and submission behavior. The{" "}
        <span className="font-medium text-[var(--foreground)]">Appearance</span> tab is for embed colors, layout, and
        typography — published when your site loads{" "}
        <code
          className="rounded-md px-1.5 py-0.5 text-[0.8rem]"
          style={{ background: "var(--surface-muted)", border: "1px solid var(--border)" }}
        >
          GET /api/v1/config
        </code>
        .
      </p>
      {children}
    </div>
  );
}
