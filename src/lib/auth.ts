import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { promisify } from "util";
import { authConfig } from "@/lib/auth.config";
import { gravatarUrl } from "@/lib/gravatar";
import { credentialsSchema } from "@/lib/validators/auth";

const compareAsync = promisify(bcrypt.compare);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) {
          return null;
        }
        const ok = await compareAsync(password, user.passwordHash);
        if (!ok) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar ?? gravatarUrl(user.email, 160),
        };
      },
    }),
  ],
});
