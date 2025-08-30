// web/app/page.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";

export default function LandingPage() {
  return (
    <main className="relative bg-gradient-to-b from-white to-gray-50 min-h-screen flex flex-col items-center justify-start">
      
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl px-6 mt-20 text-center"
      >
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Skyler Inbox
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Organize, filter, and manage your Gmail inbox like never before. AI-powered drafts, semantic search, and full privacy control.
        </p>
      </motion.section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-6 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent>
              <Badge className="mb-2 bg-blue-100 text-blue-800">AI Drafts</Badge>
              <h3 className="text-xl font-semibold mb-2">Smart Draft Generation</h3>
              <p className="text-gray-600 text-sm">
                Set rules for your inbox and let Skyler Inbox generate drafts with one click. Manual control still at your fingertips.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent>
              <Badge className="mb-2 bg-green-100 text-green-800">Privacy</Badge>
              <h3 className="text-xl font-semibold mb-2">Full Privacy Control</h3>
              <p className="text-gray-600 text-sm">
                Email content stays local and cached. Skyler Inbox never stores your email permanently. Your data is yours.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent>
              <Badge className="mb-2 bg-purple-100 text-purple-800">Credits</Badge>
              <h3 className="text-xl font-semibold mb-2">Credits System</h3>
              <p className="text-gray-600 text-sm">
                Easy credit-based system for batch draft generation. 25 credits for free per month. Refresh inbox with 1 credit.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-3xl px-6 mt-24 text-center mb-10"
      >
        <h2 className="text-3xl font-bold">Ready to Supercharge Your Inbox?</h2>
        <p className="text-gray-600 mb-6">
          Join the Skyler Inbox beta today and experience smarter, faster, and more organized email management.
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = "/waitlist"}>
          Join Beta
        </Button>
      </motion.section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
