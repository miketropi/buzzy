"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark =
    "rounded-md border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-base font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-700 active:scale-[0.98]";
  const light = "btn-secondary !px-3 !py-2";

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={tone === "dark" ? dark : light}
    >
      Sign out
    </button>
  );
}
