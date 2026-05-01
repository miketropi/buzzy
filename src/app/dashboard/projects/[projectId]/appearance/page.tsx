import { redirect } from "next/navigation";

export default function ProjectAppearanceRedirectPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/dashboard/projects/${params.projectId}/settings`);
}
