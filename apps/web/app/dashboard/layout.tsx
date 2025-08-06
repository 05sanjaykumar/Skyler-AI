// apps/web/app/dashboard/layout.tsx
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TopBar from "@/components/top-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </ThemeProvider>
  );
}
