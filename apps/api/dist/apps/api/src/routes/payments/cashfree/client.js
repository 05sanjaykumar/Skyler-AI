"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashfree = void 0;
// apps/api/src/routes/payments/cashfree/client.ts
const cashfree_pg_1 = require("cashfree-pg");
const isProd = process.env.CASHFREE_ENV === "PROD";
exports.cashfree = new cashfree_pg_1.Cashfree(isProd ? cashfree_pg_1.CFEnvironment.PRODUCTION : cashfree_pg_1.CFEnvironment.SANDBOX, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);
