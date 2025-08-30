// apps/web/app/legal/layout.tsx
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="p-4 bg-white shadow">
        <h1 className="text-xl font-bold">SkylerInbox Legal</h1>
      </header>
      <main className="max-w-4xl mx-auto py-10 px-4">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 SkylerInbox. All rights reserved.
      </footer>
    </div>
  );
}
