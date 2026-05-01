"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: { message?: string };
      };
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Could not create account.");
        return;
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (signInResult?.error) {
        setError("Account created but sign-in failed. Try logging in.");
        return;
      }
      if (signInResult?.url) {
        router.push(signInResult.url);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-white">Create account</h1>
      <p className="mt-2 text-base leading-relaxed text-zinc-400">
        Register to manage Buzzy projects, API keys, embed settings, and domains — all in one dashboard.
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
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-buzzy !mt-2"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-buzzy !mt-2"
          />
          <p className="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full !py-3"
        >
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      <p className="mt-8 text-center text-base text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="link-brand">
          Sign in
        </Link>
      </p>
    </div>
  );
}
