// apps/web/app/dashboard/layout.tsx
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TopBar from "@/components/top-bar";
import AuthGuard from "@/lib/auth-wrapper"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col">
        <AuthGuard>
          <TopBar />
          <main className="flex-1 p-4">{children}</main>
        </AuthGuard>
      </div>
    </ThemeProvider>
  );
}
