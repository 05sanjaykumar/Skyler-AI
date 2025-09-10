"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/app.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const register_1 = require("./routes/auth/register");
const verify_user_1 = require("./routes/auth/verify-user");
const gmailInstances_1 = __importDefault(require("./routes/gmail/gmailInstances"));
const gmailForms_1 = __importDefault(require("./routes/gmail/gmailForms"));
const gmailPull_1 = __importDefault(require("./routes/gmail/webhooks/gmailPull"));
const gmailRuleBox_1 = __importDefault(require("./routes/gmail/gmailRuleBox"));
const gmailSummariser_1 = __importDefault(require("./routes/gmail/gmailSummariser"));
const creditsRoute_1 = __importDefault(require("./routes/creditsRoute"));
const paypalRoute_1 = __importDefault(require("./routes/payments/paypal/paypalRoute"));
const cashfreeRoutes_1 = __importDefault(require("./routes/payments/cashfree/cashfreeRoutes"));
const profile_1 = __importDefault(require("./routes/profile"));
const mail_1 = __importDefault(require("./routes/mail"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // your frontend URL
    credentials: true // allows cookies, auth headers
}));
app.use(body_parser_1.default.json());
app.get('/', (_req, res) => {
    res.send('Hello from TypeScript Express!');
});
// AUTH
app.post("/api/register", register_1.registerUser);
app.post("/api/verify-user", verify_user_1.verifyUser);
// DEFAULT
app.use("/api/credits", creditsRoute_1.default);
app.use("/api/profile", profile_1.default);
app.use("/api/mail", mail_1.default);
// GMAIL
app.use("/api/gmail/form", gmailForms_1.default);
app.use("/api/gmail/pull", gmailPull_1.default);
app.use("/api/gmail/rulebox", gmailRuleBox_1.default);
app.use("/api/gmail/instances", gmailInstances_1.default);
app.use("/api/gmail/summarise", gmailSummariser_1.default);
// PAYMENTS
app.use("/api/payments/paypal", paypalRoute_1.default);
app.use("/api/payments/cashfree", cashfreeRoutes_1.default);
exports.default = app;
