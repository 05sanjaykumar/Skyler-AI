// apps/api/src/routes/payments/cashfree/client.ts
import { Cashfree, CFEnvironment } from "cashfree-pg";

const isProd = process.env.CASHFREE_ENV === "PROD";

export const cashfree = new Cashfree(
  isProd ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);
