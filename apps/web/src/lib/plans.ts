// apps/web/src/lib/plans.ts
export type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular: boolean;
  amount: number;
  planId: string;
};

export const plans: Plan[] = [
  {
    name: "Starter",
    price: "FREE",
    description: "All AI features included. Perfect to try Skyler Inbox.",
    features: ["3 Inboxes", "25 Credits / month", "All AI Features"],
    isPopular: false,
    amount: 0,
    planId: "starter",
  },
  {
    name: "Mini",
    price: "$19",
    description: "Great for individuals who need more inboxes and credits.",
    features: ["10 Inboxes", "200 Credits / month", "All AI Features"],
    isPopular: true,
    amount: 19,
    planId: "mini",
  },
  {
    name: "Pro",
    price: "$39",
    description: "For power users and teams who want maximum capacity.",
    features: ["25 Inboxes", "500 Credits / month", "All AI Features"],
    isPopular: false,
    amount: 39,
    planId: "pro",
  },
];

// Helper to get plan by id
export const getPlanById = (planId: string): Plan | undefined =>
  plans.find(plan => plan.planId === planId);
