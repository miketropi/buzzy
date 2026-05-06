"use client";

/**
 * Read-only composer block when Host SSO supplies identity (JWT on `X-Buzzy-Host-Identity`).
 */
export function BzComposerSsoSummary({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email: string;
  avatarUrl?: string;
}) {
  return (
    <div className="bz-form-field bz-host-identity-summary" aria-live="polite">
      <span className="bz-l">Your profile</span>
      <div className="bz-host-identity-row">
        {avatarUrl ? (
          // Host-supplied HTTPS avatar from verified SSO JWT (display mirror of server-trusted claims).
          // eslint-disable-next-line @next/next/no-img-element -- external user avatar URL
          <img className="bz-host-identity-avatar" src={avatarUrl} alt="" width={40} height={40} />
        ) : null}
        <div className="bz-host-identity-text">
          <span className="bz-host-identity-name">{name || "Signed-in user"}</span>
          {email ? <span className="bz-host-identity-email">{email}</span> : null}
        </div>
      </div>
      <p className="bz-host-identity-hint">Name and email are taken from your account and can&apos;t be changed here.</p>
    </div>
  );
}
