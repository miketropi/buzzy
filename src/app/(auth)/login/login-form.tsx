"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }
      if (result?.url) {
        router.push(result.url);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-white">Sign in</h1>
      <p className="mt-2 text-base leading-relaxed text-zinc-400">
        Dashboard access for Buzzy project owners. Manage API keys, allowed domains, and widget appearance.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error ? (
          <p
            className="rounded-xl border border-red-500/25 bg-red-950/50 px-3 py-2.5 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-buzzy !mt-2"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-buzzy !mt-2"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-8 text-center text-base text-zinc-400">
        <Link href="/forgot-password" className="link-brand">
          Forgot password?
        </Link>
        {" · "}
        <Link href="/register" className="link-brand">
          Create an account
        </Link>
      </p>
      <p className="mt-5 text-center">
        <Link href="/" className="text-base text-zinc-500 transition hover:text-zinc-300">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
