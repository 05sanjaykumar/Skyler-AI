// apps/web/app/layout.tsx
import "./globals.css";
import { SessionProviderWrapper } from "@/components/session-provider"; // <- client component

export const metadata = {
  title: "Skyler Inbox – Smarter Gmail Management",
  description: "AI-powered Gmail inbox with drafts, semantic search, and full privacy control.",
  openGraph: {
    title: "Skyler Inbox",
    description: "Supercharge your Gmail with AI-powered productivity.",
    url: "https://skylerinbox.com",
    images: ["/og-image.png"], // put in /public
  },
  twitter: {
    card: "summary_large_image",
    title: "Skyler Inbox",
    description: "Organize, filter, and manage your Gmail inbox like never before.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
