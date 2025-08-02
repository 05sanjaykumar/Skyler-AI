import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }

  interface User {
    id: string;
  }

  interface JWT {
    accessToken?: string;
  }
}
