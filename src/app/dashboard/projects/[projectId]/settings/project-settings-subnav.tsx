"use client";

import { ProjectSubnav } from "../project-subnav";

export function ProjectSettingsSubnav({ projectId }: { projectId: string }) {
  const base = `/dashboard/projects/${projectId}/settings`;
  return (
    <ProjectSubnav
      links={[
        { href: base, label: "General" },
        { href: `${base}/appearance`, label: "Appearance" },
      ]}
    />
  );
}
