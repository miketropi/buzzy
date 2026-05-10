import { SlidersHorizontal } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { loadProjectSettingsPageDataForOwner } from "./project-settings-data";
import { ProjectSettingsForm } from "./project-settings-form";

export default async function ProjectSettingsGeneralPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await loadProjectSettingsPageDataForOwner({
    projectId: params.projectId,
    ownerUserId: session.user.id,
  });

  if (!data) {
    notFound();
  }

  return (
    <div className="dash-panel overflow-hidden">
      <section className="p-5 sm:p-6 lg:p-7">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/20 dark:bg-brand/20">
            <SlidersHorizontal className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">Behavior &amp; access</h2>
            <p className="mt-1 text-sm leading-snug text-[var(--muted)]">
              Project identity, embedding rules, and who can submit. Use <strong className="font-medium text-[var(--foreground)]">Advanced settings</strong> on this page for spam filters, captcha, and third-party checks.
            </p>
          </div>
        </div>
        <ProjectSettingsForm
          projectId={data.projectId}
          initialName={data.initialName}
          initialWidgetMode={data.normalizedWidgetMode}
          initialDomainsText={data.initialDomainsText}
          initialAutoApprove={data.initialAutoApprove}
          initialEnableAttachments={data.initialEnableAttachments}
          initialAllowAnonymous={data.initialAllowAnonymous}
          initialEnableSpamFilter={data.initialEnableSpamFilter}
          initialBlockedWordsText={data.initialBlockedWordsText}
          initialBlockedIPsText={data.initialBlockedIPsText}
          initialSpamMatchWholeWords={data.initialSpamMatchWholeWords}
          initialSpamMaxUrlsPerPost={data.initialSpamMaxUrlsPerPost}
          initialSpamBlockedRegexText={data.initialSpamBlockedRegexText}
          initialSpamDuplicateWindowSeconds={data.initialSpamDuplicateWindowSeconds}
          initialSpamPerIdentityCommentLimit={data.initialSpamPerIdentityCommentLimit}
          initialSpamPerIdentityReviewLimit={data.initialSpamPerIdentityReviewLimit}
          initialSpamPerIdentityWindowSeconds={data.initialSpamPerIdentityWindowSeconds}
          initialAkismetEnabled={data.initialAkismetEnabled}
          initialAkismetHasKey={data.initialAkismetHasKey}
          initialAkismetBlogUrl={data.initialAkismetBlogUrl}
          initialAkismetRejectSpam={data.initialAkismetRejectSpam}
          initialCaptchaProvider={data.initialCaptchaProvider}
          initialCaptchaSiteKey={data.initialCaptchaSiteKey}
          initialCaptchaHasSecretKey={data.initialCaptchaHasSecretKey}
          initialCaptchaMode={data.initialCaptchaMode}
          initialCaptchaRiskMinLinks={data.initialCaptchaRiskMinLinks}
          initialCaptchaRiskMinScore={data.initialCaptchaRiskMinScore}
          embedded
        />
      </section>
    </div>
  );
}
