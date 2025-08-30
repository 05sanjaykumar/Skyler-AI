// apps/web/src/components/session-provider.tsx
"use client";
import { SessionProvider } from "next-auth/react";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
