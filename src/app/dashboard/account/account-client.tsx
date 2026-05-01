"use client";

import Link from "next/link";
import { KeyRound, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

type AccountClientProps = {
  initialName: string;
  initialEmail: string;
  initialAvatarUrl: string;
};

export function AccountClient({
  initialName,
  initialEmail,
  initialAvatarUrl,
}: AccountClientProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function onProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setProfileLoading(true);
    try {
      const res = await fetch("/api/internal/account/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { name: string; email: string; avatarUrl: string };
        error?: { message?: string };
      };
      if (!res.ok || !json.success || !json.data) {
        setProfileError(json.error?.message ?? "Could not update profile.");
        return;
      }
      setName(json.data.name);
      setAvatarUrl(json.data.avatarUrl);
      setProfileMessage("Profile saved.");
      await updateSession({
        name: json.data.name,
        image: json.data.avatarUrl,
      });
      router.refresh();
    } finally {
      setProfileLoading(false);
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/internal/account/password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: { message?: string };
      };
      if (!res.ok || !json.success) {
        setPasswordError(json.error?.message ?? "Could not change password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <p className="dash-kicker">Account</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Your profile
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Update how you appear in the dashboard and change your password. Your sign-in email cannot be changed
          here. Your avatar comes from{" "}
          <a
            href="https://gravatar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            Gravatar
          </a>{" "}
          (hashed from your email).
        </p>
      </div>

      <div className="dash-panel overflow-hidden">
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          <section className="p-5 sm:p-6 lg:p-7">
            <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- Gravatar external URL */}
                <img
                  src={avatarUrl}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-2xl border object-cover ring-2 ring-[var(--border)]"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/20 dark:bg-brand/20">
                    <UserRound className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">Profile</h2>
                    <p className="mt-1 text-sm leading-snug text-[var(--muted)]">
                      Display name for the dashboard. To change your photo, update the image tied to your email on
                      Gravatar.
                    </p>
                  </div>
                </div>

                <form onSubmit={onProfileSubmit} className="max-w-md space-y-4">
                  {profileError ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                      {profileError}
                    </p>
                  ) : null}
                  {profileMessage ? (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                      {profileMessage}
                    </p>
                  ) : null}

                  <div>
                    <p className="block text-sm font-medium text-[var(--foreground)]">Email</p>
                    <p
                      className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                      title={initialEmail}
                    >
                      {initialEmail}
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--muted)]">
                      Sign-in address cannot be changed in the dashboard.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="account-name" className="block text-sm font-medium text-[var(--foreground)]">
                      Display name
                    </label>
                    <input
                      id="account-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-hover disabled:opacity-60"
                    >
                      {profileLoading ? "Saving…" : "Save profile"}
                    </button>
                    <Link
                      href="https://gravatar.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand underline-offset-2 hover:underline"
                    >
                      Open Gravatar
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </section>

          <section className="p-5 sm:p-6 lg:p-7">
            <div className="mb-5 flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/20 dark:bg-brand/20">
                <KeyRound className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">Password</h2>
                <p className="mt-1 text-sm leading-snug text-[var(--muted)]">
                  Use at least 8 characters. You will stay signed in on this device.
                </p>
              </div>
            </div>

            <form onSubmit={onPasswordSubmit} className="max-w-md space-y-4">
              {passwordError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                  {passwordError}
                </p>
              ) : null}
              {passwordMessage ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                  {passwordMessage}
                </p>
              ) : null}

              <div>
                <label
                  htmlFor="account-current-password"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Current password
                </label>
                <input
                  id="account-current-password"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                />
              </div>

              <div>
                <label htmlFor="account-new-password" className="block text-sm font-medium text-[var(--foreground)]">
                  New password
                </label>
                <input
                  id="account-new-password"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="account-confirm-password"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Confirm new password
                </label>
                <input
                  id="account-confirm-password"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] disabled:opacity-60"
              >
                {passwordLoading ? "Updating…" : "Change password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
