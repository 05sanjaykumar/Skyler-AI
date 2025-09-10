"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayPalAccessToken = void 0;
// apps/api/routes/payments/paypal/client.ts
const axios_1 = __importDefault(require("axios"));
const getPayPalAccessToken = async () => {
    const response = await axios_1.default.post(`${process.env.PAYPAL_API_BASE}/v1/oauth2/token`, new URLSearchParams({ grant_type: "client_credentials" }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        },
    });
    return response.data.access_token;
};
exports.getPayPalAccessToken = getPayPalAccessToken;
