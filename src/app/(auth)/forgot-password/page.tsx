import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-white">Forgot password</h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-400">
        Password reset by email is not wired up yet. Use a new account for local testing, or update your password via
        database tooling until email flows are added.
      </p>
      <p className="mt-8">
        <Link href="/login" className="link-brand text-base">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
