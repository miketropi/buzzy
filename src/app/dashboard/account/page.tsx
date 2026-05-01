import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { gravatarUrl } from "@/lib/gravatar";
import { prisma } from "@/lib/prisma";
import { AccountClient } from "./account-client";

export default async function DashboardAccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <AccountClient
      initialName={user.name}
      initialEmail={user.email}
      initialAvatarUrl={gravatarUrl(user.email, 192)}
    />
  );
}
