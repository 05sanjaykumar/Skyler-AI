// apps/web/app/dashboard/layout.tsx
import { ThemeProvider } from "@/components/theme-provider";
import TopBar from "@/components/top-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#1E1E1E]">
          <TopBar />
          <main >{children}</main>
      </div>
    </ThemeProvider>
  );
}
