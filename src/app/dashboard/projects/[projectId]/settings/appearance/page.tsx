import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProjectAppearanceForm } from "../../appearance/project-appearance-form";
import { loadProjectSettingsPageDataForOwner } from "../project-settings-data";

export default async function ProjectSettingsAppearancePage({
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

  const a = data.appearance;

  return (
    <div className="dash-panel overflow-hidden p-5 sm:p-6 lg:p-7">
      <ProjectAppearanceForm
        projectId={data.projectId}
        previewWidgetMode={data.normalizedWidgetMode}
        initialTheme={a.theme}
        initialPrimaryColor={a.primary}
        initialColorPreset={a.colorPreset}
        initialBorderRadius={a.borderRadius}
        initialFontFamily={a.fontFamily}
        initialUseHostTypography={a.useHostTypography}
        initialSubmitButtonStyle={a.submitButtonStyle}
        initialSubmitButtonFgColor={a.submitButtonFgColor}
        initialMutedTextColor={a.mutedTextColor}
      />
    </div>
  );
}
