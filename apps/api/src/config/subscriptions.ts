// apps/api/src/config/subscriptions.ts
export const subscriptionConfig = {
  free: {
    maxInstances: 2,
    monthlyPrompts: 15,
  },
  pro: {
    maxInstances: 3,
    monthlyPrompts: 100,
  },
  premium: {
    maxInstances: 5,
    monthlyPrompts: 300,
  },
} as const;
