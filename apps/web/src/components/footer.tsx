// apps/web/src/components/footer.tsx
"use client"

import { Github, Twitter, Linkedin, Heart } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Company */}
        <div>
          <h3 className="font-semibold mb-3">SkylerInbox</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered tools for modern businesses. Currently in beta — building fast, improving daily.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-medium mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link href="/docs" className="hover:text-foreground">Docs</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-medium mb-3">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
            <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
          </ul>
        </div>

        {/* Legal & Social */}
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            © 2025 Skyler Inbox. All rights reserved. 
            <div>
              <a href="/legal/terms" className="underline mx-1">Terms</a>
              <a href="/legal/privacy" className="underline mx-1">Privacy</a>
              <a href="/legal/disclaimer" className="underline mx-1">Disclaimer</a>
              <a href="/legal/refund" className="underline mx-1">Refund</a>
            </div>
          </ul>

          <div className="flex gap-4 mt-4">
            <Link href="https://github.com/05sanjaykumar" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://x.com/sky_bolt20907" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="https://www.linkedin.com/in/sanjay-kumar-6382a1372/" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
        <div className="border-t text-xs text-muted-foreground py-4 px-4 md:px-6 text-center space-y-1">
            <p className="flex items-center justify-center gap-1">
                © {new Date().getFullYear()} SkylerInbox. Built with
                <Heart className="w-3 h-3 text-red-500" /> by Sanjay Kumar.
            </p>
            <p className="text-[11px] text-muted-foreground">
                Beta release — things may change quickly.
            </p>
            <p className="text-[11px] text-muted-foreground">
                SkylerInbox is an independent product and is not affiliated with or endorsed 
                by Gmail, Slack, WhatsApp, Discord, or any other third-party platforms mentioned.
            </p>
        </div>
    </footer>
  )
}
