// apps/web/app/page.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";
import Image from "next/image";

const demoImages = [
  {
    src: "/images/Easy-quick-filter.png",
    alt: "Easy Quick Filter",
    title: "Easy Quick Filter",
    description: "Filter emails instantly with custom AI rules and smart labels."
  },
  {
    src: "/images/Multi-inbox.png",
    alt: "Multi Inbox",
    title: "Multi Inbox",
    description: "Manage multiple Gmail accounts seamlessly from a single interface."
  },
  {
    src: "/images/Semantic-Search.png",
    alt: "Semantic Search",
    title: "Semantic Search",
    description: "Search emails contextually, not just by keywords."
  },
  {
    src: "/images/Sentiment-Analysis.png",
    alt: "Sentiment Analysis",
    title: "Sentiment Analysis",
    description: "Understand the tone of your emails automatically."
  },
  {
    src: "/images/Generate-Replies.png",
    alt: "Generate Replies",
    title: "Generate Replies",
    description: "Automatically generate replies based on rules set."
  }
];

export default function LandingPage() {
  return (
    <main className="relative bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-start">

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
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = "/waitlist"}>
          Join Beta Now
        </Button>
      </motion.section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-6 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            badge: "AI Drafts",
            color: "blue",
            title: "Smart Draft Generation",
            desc: "Set rules for your inbox and let Skyler Inbox generate drafts with one click. Manual control still at your fingertips.",
          },
          {
            badge: "Privacy",
            color: "green",
            title: "Full Privacy Control",
            desc: "Email content stays local and cached. Skyler Inbox never stores your email permanently. Your data is yours.",
          },
          {
            badge: "Credits",
            color: "purple",
            title: "Credits System",
            desc: "Easy credit-based system for batch draft generation. 25 credits for free per month. Refresh inbox with 1 credit.",
          },
        ].map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardContent>
                <Badge className={`mb-2 bg-${feature.color}-100 text-${feature.color}-800`}>{feature.badge}</Badge>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Demo Images Full-Screen Section */}
      {demoImages.map((img, idx) => (
        <motion.section
          key={img.alt}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 * idx, duration: 0.8 }}
          className="w-10/12 relative h-[60vh] my-16 flex items-center justify-center"
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-contain rounded-xl shadow-lg"
          />
          <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col items-center justify-center text-center px-6">
            <h3 className="text-4xl font-bold text-white mb-4">{img.title}</h3>
            <p className="text-lg text-white">{img.description}</p>
          </div>
        </motion.section>
      ))}

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
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
