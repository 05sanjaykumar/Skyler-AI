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
        description: "For individuals and small teams getting started.",
        features: ["10 AI Instances", "20 Credits", "Approx 10 Completions", "Infinite Manual Edits"],
        isPopular: false,
        amount: 0,
        planId: "starter",
    },
    {
        name: "Mini",
        price: "$5",
        description: "For growing businesses and marketing professionals.",
        features: ["10 AI Instances", "100 Credits", "Approx 60-70 Completions", "Infinite Manual Edits"],
        isPopular: true,
        amount: 5,
        planId: "mini",
    },
    {
        name: "Pro",
        price: "$10",
        description: "For large organizations with custom needs.",
        features: ["10 AI Instances", "200 Credits", "Approx 120-140 Completions", "Infinite Manual Edits"],
        isPopular: false,
        amount: 10,
        planId: "pro",
    }
];

// Helper to get plan by id
export const getPlanById = (planId: string): Plan | undefined =>
    plans.find(plan => plan.planId === planId);
