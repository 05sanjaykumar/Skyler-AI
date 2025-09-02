// apps/web/app/pricing/page.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";

const plans = [
  {
    name: "Free",
    inboxes: 3,
    credits: 25,
    price: "$0",
    description: "All AI features included. Perfect to try Skyler Inbox.",
    color: "blue",
  },
  {
    name: "Starter",
    inboxes: 10,
    credits: 200,
    price: "$19",
    description: "Great for individuals who need more inboxes and credits.",
    color: "green",
  },
  {
    name: "Pro",
    inboxes: 25,
    credits: 500,
    price: "$39",
    description: "For power users and teams who want maximum capacity.",
    color: "red",
  },
];

// Predefined Tailwind classes for safe usage
const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
};

const buttonColorMap: Record<string, string> = {
  blue: "bg-blue-600 hover:bg-blue-700",
  green: "bg-green-600 hover:bg-green-700",
  red: "bg-purple-600 hover:bg-purple-700",
};

export default function PricingPage() {
  return (
    <main className="relative bg-gradient-to-b from-white to-gray-50 min-h-screen flex flex-col items-center justify-start py-16">
      
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl px-6 text-center"
      >
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Skyler Inbox Plans
        </h1>
        <p className="text-gray-600 text-lg">
          Choose the plan that fits your workflow. All plans include every AI feature. Only difference is inboxes and monthly credits.
        </p>
      </motion.section>

      {/* Plans Section */}
      <section className="w-full max-w-7xl px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            viewport={{ once: true }}
          >
            <Card className="h-full hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <CardContent className="flex flex-col justify-between h-full">
                <div>
                  <Badge className={`mb-2 ${colorMap[plan.color]}`}>
                    {plan.name}
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">{plan.price}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <ul className="text-gray-700 space-y-1">
                    <li>✅ {plan.inboxes} Inbox{plan.inboxes > 1 ? "es" : ""}</li>
                    <li>✅ {plan.credits} Credits / month</li>
                    <li>✅ All AI Features</li>
                  </ul>
                </div>

                <Button
                  className={`mt-6 w-full ${buttonColorMap[plan.color]}`}
                  size="lg"
                  onClick={() => window.location.href = "/waitlist"}
                >
                  Join {plan.name}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
