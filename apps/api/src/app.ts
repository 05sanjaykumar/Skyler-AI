// apps/api/src/app.ts
import express from "express";
import bodyParser from "body-parser";
import { registerUser } from "./routes/auth/register";
import { verifyUser } from "./routes/auth/verify-user";
import gmailInstance from "./routes/gmail/gmailInstances";
import gmailPromptRouter from "./routes/gmail/gmailPrompt";
import googlePull from './routes/gmail/webhooks/gmailPull';
import gmailRuleBox from './routes/gmail/gmailRuleBox';
import creditsRoute from './routes/creditsRoute';
import payPalRoute from './routes/payments/paypal/paypalRoute';
import cashfreeRoute from './routes/payments/cashfree/cashfreeRoutes';
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL, // your frontend URL
  credentials: true // allows cookies, auth headers
}));

app.use(bodyParser.json());

app.get('/', (_req, res) => {
  res.send('Hello from TypeScript Express!')
})

// AUTH
app.post("/api/register", registerUser);
app.post("/api/verify-user", verifyUser);

// DEFAULT
app.use("/api/credits", creditsRoute);

// GMAIL
app.use("/api/gmail/prompt", gmailPromptRouter);
app.use("/api/gmail/pull", googlePull);
app.use("/api/gmail/storebox", gmailRuleBox);
app.use("/api/gmail/instances", gmailInstance);
// PAYMENTS
app.use("/api/paypal", payPalRoute);
app.use("/api/cashfree", cashfreeRoute);

export default app;
