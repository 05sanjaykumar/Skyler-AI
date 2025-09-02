// apps/web/app/docs/layout.tsx
'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const sections = [
  { title: "General", href: "/docs" },
  { title: "Getting Started", href: "/docs/getting-started" },
  { title: "Inboxes", href: "/docs/inboxes" },
  { title: "Forms", href: "/docs/forms" },
  { title: "Emails", href: "/docs/emails" },
  { title: "Rules", href: "/docs/rules" },
  { title: "Credits", href: "/docs/credits" },
  { title: "Legal", href: "/docs/legal" },
  { title: "FAQ", href: "/docs/faq" },
  { title: "Video Demonstration", href: "/docs/video" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-background p-4">
        <h2 className="text-lg font-bold mb-4">Documentation</h2>
        <nav className="space-y-2">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block px-2 py-1 rounded hover:bg-gray-100 hover:dark:bg-zinc-800 transition-colors"
            >
              {s.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="mb-6"
                >
                  ← Back to Dashboard
                </Button>
        {children}
        </main>
    </div>
  );
}
