"use client";

import Link from "next/link";
import { ArrowUpRight, KeyRound, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

type AccountClientProps = {
  initialName: string;
  initialEmail: string;
  initialAvatarUrl: string;
};

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[0.8125rem] font-semibold tracking-[-0.01em] text-[var(--foreground)]"
    >
      {children}
    </label>
  );
}

function FieldLegend({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex text-[0.8125rem] font-semibold tracking-[-0.01em] text-[var(--foreground)]">
      {children}
    </div>
  );
}

function AlertSuccess({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-xl border px-3.5 py-2.5 text-[0.8125rem] leading-snug text-emerald-900 dark:text-emerald-100"
      style={{
        borderColor: "color-mix(in srgb, rgb(16 185 129) 28%, var(--border))",
        background: "color-mix(in srgb, rgb(16 185 129) 7%, var(--surface))",
      }}
      role="status"
    >
      {children}
    </p>
  );
}

function AlertError({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-xl border px-3.5 py-2.5 text-[0.8125rem] leading-snug text-red-900 dark:text-red-100"
      style={{
        borderColor: "color-mix(in srgb, rgb(239 68 68) 30%, var(--border))",
        background: "color-mix(in srgb, rgb(239 68 68) 7%, var(--surface))",
      }}
      role="alert"
    >
      {children}
    </p>
  );
}

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
    <div className="space-y-6 pb-10 md:space-y-8">
      <header className="dash-hero">
        <p className="dash-kicker">Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.75rem]">
          Your profile
        </h1>
        <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--muted)]">
          How you appear in the dashboard header, and credentials for signing in. Your email can’t be changed here;
          profile photos come from{" "}
          <a
            href="https://gravatar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand underline-offset-[3px] transition hover:text-brand-hover hover:underline"
          >
            Gravatar
          </a>{" "}
          (derived from your address).
        </p>
      </header>

      <section className="dash-panel overflow-hidden p-0" aria-labelledby="account-profile-heading">
        <div className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-muted)]/55 to-transparent px-5 py-4 md:px-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Identity</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- Gravatar external URL */}
              <img
                src={avatarUrl}
                alt=""
                width={96}
                height={96}
                className="h-[5.75rem] w-[5.75rem] rounded-[1.25rem] border object-cover shadow-sm ring-[3px] ring-[var(--surface)] outline outline-1 outline-[var(--border)]"
              />
              <p className="mt-2 max-w-[11rem] text-center text-[0.625rem] leading-snug text-[var(--muted)] sm:text-left">
                Synced via Gravatar
              </p>
            </div>
            <div className="flex min-w-0 flex-1 gap-3 sm:items-start">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/14 text-brand ring-1 ring-brand/22">
                <UserRound className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="account-profile-heading"
                  className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]"
                >
                  Display name & email
                </h2>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                  Adjust your dashboard name below. Avatar uses the image tied to your email on Gravatar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:px-6 md:pb-6 md:pt-5">
          <form onSubmit={onProfileSubmit} className="mx-auto max-w-md space-y-4">
            {profileError ? <AlertError>{profileError}</AlertError> : null}
            {profileMessage ? <AlertSuccess>{profileMessage}</AlertSuccess> : null}

            <div>
              <FieldLegend>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 opacity-70" strokeWidth={2} aria-hidden />
                  Email
                </span>
              </FieldLegend>
              <div
                id="account-email-readonly"
                className="rounded-xl border px-3.5 py-2.5 text-[0.875rem] text-[var(--foreground)] opacity-92"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-muted)",
                }}
              >
                {initialEmail}
              </div>
              <p className="mt-1.5 text-[0.7rem] leading-relaxed text-[var(--muted)]">
                Sign-in address isn’t editable in the dashboard.
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="account-name">Display name</FieldLabel>
              <input
                id="account-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="input-buzzy mt-1.5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button type="submit" disabled={profileLoading} className="btn-primary text-sm disabled:opacity-60">
                {profileLoading ? "Saving…" : "Save profile"}
              </button>
              <Link
                href="https://gravatar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary gap-2 text-sm"
              >
                Gravatar site
                <ArrowUpRight className="h-3.5 w-3.5 opacity-75" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="dash-panel overflow-hidden p-0" aria-labelledby="account-password-heading">
        <div className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-muted)]/55 to-transparent px-5 py-4 md:px-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Security</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/14 text-brand ring-1 ring-brand/22">
              <KeyRound className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2
                id="account-password-heading"
                className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]"
              >
                Password
              </h2>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                Minimum 8 characters. You’ll remain signed in on this device after a successful update.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 md:px-6 md:pb-6 md:pt-5">
          <form onSubmit={onPasswordSubmit} className="mx-auto max-w-md space-y-4">
            {passwordError ? <AlertError>{passwordError}</AlertError> : null}
            {passwordMessage ? <AlertSuccess>{passwordMessage}</AlertSuccess> : null}

            <div>
              <FieldLabel htmlFor="account-current-password">Current password</FieldLabel>
              <input
                id="account-current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="input-buzzy mt-1.5"
              />
            </div>

            <div>
              <FieldLabel htmlFor="account-new-password">New password</FieldLabel>
              <input
                id="account-new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="input-buzzy mt-1.5"
              />
            </div>

            <div>
              <FieldLabel htmlFor="account-confirm-password">Confirm new password</FieldLabel>
              <input
                id="account-confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="input-buzzy mt-1.5"
              />
            </div>

            <div className="pt-1">
              <button type="submit" disabled={passwordLoading} className="btn-secondary text-sm disabled:opacity-60">
                {passwordLoading ? "Updating…" : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
