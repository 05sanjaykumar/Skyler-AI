// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@skyler-ai/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Extend the Session type to include googleAccessToken and appToken
declare module "next-auth" {
  interface Session {
    appToken?: string;
    googleAccessToken?: string;
  }
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-user`,
          {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          }
        );

        const user = await res.json();
        if (res.ok && user) return user;
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On first login (user object exists), generate your own JWT with user info
      if (user) {
        const appJwt = jwt.sign(
          {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        token.appToken = appJwt;
      }

      // Store Google tokens if provider is Google
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.appToken = token.appToken as string;
      session.googleAccessToken = token.googleAccessToken as string;
      return session;
    },
    async signIn({ user, account }) {
      if (!user.email) return true;

      // Ensure user exists and seed free trial if new
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {}, // if already exists, leave untouched
        create: {
          email: user.email,
          name: user.name,
          creditsRemaining: 25,
          planExpirationDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Ensure OAuth account record is linked/updated
      if (account) {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            userId: dbUser.id,
            access_token: account.access_token ?? undefined,
            refresh_token: account.refresh_token ?? undefined,
            expires_at: account.expires_at ?? undefined,
          },
          create: {
            userId: dbUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token ?? undefined,
            refresh_token: account.refresh_token ?? undefined,
            expires_at: account.expires_at ?? undefined,
            id_token: account.id_token ?? undefined,
            token_type: account.token_type ?? undefined,
            scope: account.scope ?? undefined,
            session_state: account.session_state ?? undefined,
          },
        });
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
