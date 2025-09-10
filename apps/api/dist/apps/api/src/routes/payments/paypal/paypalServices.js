"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.capturePayment = exports.createOrder = void 0;
// apps/api/routes/payments/paypal/paypalServices.ts
const axios_1 = __importDefault(require("axios"));
const client_1 = require("./client");
const createOrder = async (amount) => {
    const accessToken = await (0, client_1.getPayPalAccessToken)();
    const response = await axios_1.default.post(`${process.env.PAYPAL_API_BASE}/v2/checkout/orders`, {
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
    }, { headers: { Authorization: `Bearer ${accessToken}` } });
    return response.data;
};
exports.createOrder = createOrder;
const capturePayment = async (orderId) => {
    const accessToken = await (0, client_1.getPayPalAccessToken)();
    const response = await axios_1.default.post(`${process.env.PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
    return response.data;
};
exports.capturePayment = capturePayment;
