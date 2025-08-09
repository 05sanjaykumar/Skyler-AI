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
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-user`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });

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
            id: user.id, // use whatever unique id you have
            email: user.email,
            name: user.name,
          },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        token.appToken = appJwt;
      }

      // Optionally store Google tokens separately if you want to call Google API later
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      // Pass your own app JWT to the client session for API auth
      session.appToken = token.appToken as string;
      // Optionally expose Google tokens to client if needed (careful with security)
      session.googleAccessToken = token.googleAccessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
