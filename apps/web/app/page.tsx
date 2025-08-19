'use client'

// app/page.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, CheckCircle, BotMessageSquare, Inbox, SlidersHorizontal, Users } from "lucide-react";
import { Globe } from "@/components/magicui/globe";
import { Vortex } from "@/components/ui/vortex";

// --- DUMMY COMPONENTS (Replace with actual components from the libraries) ---
// You would get the code for these from aceternity.dev and magicui.design
const HeroParallax = ({ products, children }: { products: any[]; children: React.ReactNode }) => (
  <div className="relative h-[150vh]">{children} {/* Placeholder for the actual parallax component */}</div>
);
const BentoGrid = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ${className}`}>{children}</div>
);
const BentoGridItem = ({ className, title, description, header, icon }: { className?: string; title?: string; description?: string; header?: React.ReactNode; icon?: React.ReactNode }) => (
  <div className={`row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 ${className}`}>
    {header}
    <div className="group-bento/card-content">
      {icon}
      <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">{title}</div>
      <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">{description}</div>
    </div>
  </div>
);
const AnimatedShinyText = ({ children }: { children: React.ReactNode }) => <div className="animate-pulse">{children}</div>;
const ShimmerButton = ({ children }: { children: React.ReactNode }) => <Button size="lg">{children}</Button>;
// --- END DUMMY COMPONENTS ---


// --- Main Page Component ---
export default function SkylerLandingPage() {
  return (
    <main className="bg-[#0A0A0A] text-gray-200 antialiased">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />
      <AboutUsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}


// --- 1. Navbar Component ---
const Navbar = () => (
  <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-sm">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-4xl font-bold tracking-tighter">Skyler</h1>
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#features" className="text-gray-400 hover:text-white transition-colors">How it Works</a>
        <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
        <a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a>
      </nav>
      <Button variant="secondary">Request a Demo</Button>
    </div>
  </header>
);

// --- 2. Hero Section ---
// Uses Aceternity UI's HeroParallax for a stunning visual showcase
const HeroSection = () => {
    // The products array is no longer needed if you're not using HeroParallax
    // const products = [ ... ];

    return (
        // The main container for the Vortex effect. It needs a defined height.
        // Using h-screen makes it take up the full viewport height.
        <div className="w-full mx-auto h-screen overflow-hidden">
            <Vortex
                backgroundColor="black" // Or your specific dark theme color e.g., #0A0A0A
                className="flex items-center justify-center px-2 md:px-10 py-4 w-full h-full"
                particleCount={60}
                rangeY={250}
                baseHue={240} // A nice blue/purple hue
            >
                {/* All your original content goes inside the Vortex component */}
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="mb-4">
                        <AnimatedShinyText>
                            <div className="inline-flex items-center justify-center px-4 py-1 text-sm font-medium tracking-wide text-white transition-colors duration-200 rounded-full bg-slate-800">
                                ✨ Introducing Skyler AI
                            </div>
                        </AnimatedShinyText>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text  bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                      Tame the Social Media Chaos
                    </h1>

                    <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-400">
                        Skyler is your AI-powered social media co-pilot. Organize content with smart prompts, manage multiple inboxes effortlessly, and retain full creative control.
                    </p>
                    <div className="mt-8 flex justify-center items-center gap-4">
                        <ShimmerButton>
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                               Get Started for Free
                            </span>
                        </ShimmerButton>
                        <Button variant="outline">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                </div>
            </Vortex>
        </div>
    );
};

// --- 3. How It Works Section ---
// Uses Aceternity UI's BentoGrid for a modern, clean feature showcase
const HowItWorksSection = () => {
  const features = [
    {
      title: "Prompt-Based Inboxes",
      description: "Automatically classify and organize content using customizable AI prompts. Create an inbox for anything.",
      // A minimalist representation of a code/prompt editor.
      header: (
        <div className="bg-zinc-900 rounded-xl h-full w-full p-4 flex flex-col justify-start font-mono text-sm">
          <p className="text-gray-500">// inbox-prompt.js</p>
          <p className="text-gray-300 mt-2">
            <span className="text-purple-400">classify</span>(
            <span className="text-sky-300">'new mentions'</span>)
          </p>
          <p className="text-gray-300">
            &nbsp;&nbsp;.where(topic.is(
            <span className="text-amber-300">'product_feedback'</span>))
          </p>
          <p className="text-gray-300">
            &nbsp;&nbsp;.moveTo(<span className="text-sky-300">'Feedback Inbox'</span>);
          </p>
          <div className="mt-4 h-2 w-12 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      ),
      icon: <BotMessageSquare className="h-4 w-4 text-neutral-400" />,
      className: "md:col-span-2",
    },
    {
      title: "Unified Workspace",
      description: "Connect all your social accounts from around the world into one clean interface.",
      // A dynamic, interactive globe. This is highly professional.
      header: (
        <div className="bg-zinc-900 rounded-xl h-full w-full flex items-center justify-center relative overflow-hidden">
            <Globe className="absolute -right-20 -bottom-10" />
        </div>
      ),
      icon: <Inbox className="h-4 w-4 text-neutral-400" />,
      className: "md:col-span-1",
    },
    {
      title: "Full Transparency & Control",
      description: "The AI suggests, you decide. Easily tweak and approve every piece of content with intuitive controls.",
       // A minimalist mockup of UI toggles.
      header: (
        <div className="bg-zinc-900 rounded-xl h-full w-full p-4 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center">
                <p className="text-gray-300">Auto-publish to X</p>
                <div className="w-12 h-6 rounded-full bg-green-500 flex items-center p-1">
                    <div className="w-4 h-4 rounded-full bg-white ml-auto"></div>
                </div>
            </div>
             <div className="flex justify-between items-center">
                <p className="text-gray-300">Post approval required</p>
                <div className="w-12 h-6 rounded-full bg-gray-600 flex items-center p-1">
                    <div className="w-4 h-4 rounded-full bg-white"></div>
                </div>
            </div>
        </div>
      ),
      icon: <SlidersHorizontal className="h-4 w-4 text-neutral-400" />,
      className: "md:col-span-1",
    },
    {
      title: "Collaborate with Your Team",
      description: "Assign tasks, leave comments, and work together on social campaigns seamlessly within Skyler.",
      // A clean representation of team collaboration with stacked avatars.
      header: (
         <div className="bg-zinc-900 rounded-xl h-full w-full p-4 flex items-center justify-center gap-4">
            <div className="flex -space-x-4">
                <img className="w-12 h-12 rounded-full border-2 border-black" src="https://i.pravatar.cc/150?img=1" alt="avatar 1" />
                <img className="w-12 h-12 rounded-full border-2 border-black" src="https://i.pravatar.cc/150?img=2" alt="avatar 2" />
                <img className="w-12 h-12 rounded-full border-2 border-black" src="https://i.pravatar.cc/150?img=3" alt="avatar 3" />
            </div>
            <div className="text-left">
                <p className="font-bold">Team Sync</p>
                <p className="text-xs text-gray-400">3 members online</p>
            </div>
         </div>
      ),
      icon: <Users className="h-4 w-4 text-neutral-400" />,
      className: "md:col-span-2",
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center tracking-tighter">A Smarter Way to Manage Social</h2>
        <p className="mt-4 text-lg text-gray-400 text-center max-w-2xl mx-auto">
          Skyler isn't just another scheduler. It's an intelligent organizer that adapts to your workflow.
        </p>
        <BentoGrid className="mt-12">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};


// --- 4. Pricing Section ---
const PricingSection = () => {
    const plans = [
        {
            name: "Starter",
            price: "$29",
            description: "For individuals and small teams getting started.",
            features: ["3 Social Accounts", "10 AI Inboxes", "500 AI Prompts/mo", "Basic Analytics"],
            isPopular: false,
        },
        {
            name: "Pro",
            price: "$79",
            description: "For growing businesses and marketing professionals.",
            features: ["10 Social Accounts", "Unlimited AI Inboxes", "2,000 AI Prompts/mo", "Advanced Analytics", "Team Collaboration (3 users)"],
            isPopular: true,
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For large organizations with custom needs.",
            features: ["Unlimited Accounts", "Custom AI Models", "Dedicated Support", "API Access", "SSO & Security"],
            isPopular: false,
        }
    ];

    return (
        <section id="pricing" className="py-20 bg-[#111111] rounded-t-3xl">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center tracking-tighter">Find the Plan That's Right for You</h2>
                <p className="mt-4 text-lg text-gray-400 text-center">Simple, transparent pricing. No hidden fees.</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map(plan => (
                        <Card key={plan.name} className={`bg-black border-2 ${plan.isPopular ? 'border-violet-500' : 'border-gray-800'} transition-all hover:border-violet-500`}>
                            <CardHeader>
                                {plan.isPopular && <div className="text-violet-400 font-bold mb-2">MOST POPULAR</div>}
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <div className="text-4xl font-bold pt-2">
                                    {plan.price}
                                    {plan.price !== "Custom" && <span className="text-lg font-normal text-gray-400">/ month</span>}
                                </div>
                                <CardDescription className="pt-2">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button className={`w-full mt-8 ${plan.isPopular ? '' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                    {plan.price === "Custom" ? "Contact Sales" : "Choose Plan"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- 5. About Us Section ---
const AboutUsSection = () => (
    <section id="about" className="py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
             <h2 className="text-4xl font-bold tracking-tighter">Built for Creators, by Creators</h2>
             <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                We're a small, passionate team of developers and social media managers who got tired of the constant juggle. We built Skyler to be the tool we always wished we had—smart, flexible, and respectful of the creative process. Our mission is to give you back your most valuable asset: time. Time to create, connect, and grow your brand without getting lost in the noise.
             </p>
        </div>
    </section>
);


// --- 6. Final Call to Action ---
// Uses Magic UI's BackgroundGradient for an appealing container
const FinalCTA = () => (
    <section className="py-20">
        <div className="container mx-auto px-6">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-12 text-center">
                <h2 className="text-4xl font-bold">Ready to Revolutionize Your Workflow?</h2>
                <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
                    Join hundreds of businesses streamlining their social media with Skyler. Start your free trial today. No credit card required.
                </p>
                <div className="mt-8">
                    <ShimmerButton>
                        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                           Start Your 14-Day Free Trial
                        </span>
                    </ShimmerButton>
                </div>
            </div>
        </div>
    </section>
);

// --- 7. Footer ---
const Footer = () => (
    <footer className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
                <h3 className="text-xl font-bold">Skyler</h3>
                <p className="text-gray-500 mt-2">© 2025 Skyler Inc. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            </div>
        </div>
    </footer>
);