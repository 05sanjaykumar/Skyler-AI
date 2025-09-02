// apps/web/app/contact/page.tsx
"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Mail } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- FAQ Data ---
const faqData = [
  {
    question: "Do credits get added on top of the previous one?",
    answer:
      "Yes, any new credits will be added to your existing balance on top, only when the plan is expired it will switch back to free plan again, else you can keep topping up without loosing the remaining credits.",
  },
  {
    question: "Where can I find my invoice history?",
    answer:
      "You can view and download all invoices from the Billing section in your account dashboard.",
  },
  {
    question: "How can I contact the support team? Or Want to enquire about other things?",
    answer:
      "Fill out the form below, and our team will get back to you as soon as possible.",
  },
];

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("");

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("Submitting...");

    try {
      const response = await fetch(`${backendUrl}/api/mail/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormStatus("✅ Thank you! Your message has been received. We’ll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setFormStatus(`❌ ${data.error || "Something went wrong. Please try again."}`);
      }
    } catch (error) {
      console.error(error);
      setFormStatus("❌ Something went wrong. Please try again.");
    }
  };


  return (
    <main className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Hero */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions or reach out directly.
          </p>
        </header>

        {/* FAQs */}
        <section className="mb-16">
          <div className="flex justify-center items-center mb-6">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">FAQs</h2>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
              >
                <button
                  className="w-full flex justify-between items-center text-left p-5 font-medium hover:bg-muted/50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{item.question}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="text-muted-foreground" size={20} />
                  ) : (
                    <ChevronDown className="text-muted-foreground" size={20} />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="p-5 border-t border-border text-muted-foreground">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-card p-8 rounded-2xl shadow-lg border border-border">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Still need help?
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Send us a message and our team will get back to you quickly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 shadow-sm focus:ring-ring focus:border-ring"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 shadow-sm focus:ring-ring focus:border-ring"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message"
              rows={4}
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 shadow-sm focus:ring-ring focus:border-ring"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
            {formStatus && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {formStatus}
              </p>
            )}
          </form>
          {/* <div className="text-center text-sm text-muted-foreground mt-2">
            <a
              href="mailto:contact@sanjaybuilds.com"
              className="text-primary font-medium hover:underline"
              >
              contact@sanjaybuilds.com
            </a>
          </div> */}
        </section>
      </div>
    </main>
  );
}
