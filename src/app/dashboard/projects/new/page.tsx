import Link from "next/link";
import { NewProjectForm } from "./new-project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">New project</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Projects isolate API keys, allowed domains, and widget styling. You can add domains and generate keys right
          after creation.
        </p>
      </div>
      <NewProjectForm />
      <Link href="/dashboard/projects" className="inline-block text-sm font-medium text-slate-500 hover:text-brand">
        ← Back to projects
      </Link>
    </div>
  );
}
