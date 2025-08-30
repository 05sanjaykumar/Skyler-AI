// apps/web/app/dashboard/layout.tsx
import { ThemeProvider } from "@/components/theme-provider";
import AuthGuard from "@/lib/auth-wrapper"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthGuard>
          <main >{children}</main>
        </AuthGuard>
    </ThemeProvider>
  );
}
