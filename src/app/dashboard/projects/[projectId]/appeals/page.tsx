import { redirect } from "next/navigation";

/** Appeals were removed; old links land on Messages. */
export default function ProjectAppealsRedirectPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/dashboard/projects/${params.projectId}/messages`);
}
