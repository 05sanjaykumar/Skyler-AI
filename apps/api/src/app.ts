// apps/api/src/app.ts
import express from "express";
import bodyParser from "body-parser";
import { registerUser } from "./routes/auth/register";
import { verifyUser } from "./routes/auth/verify-user";
import gmailInstance from "./routes/gmail/gmailInstances";
import gmailForms from "./routes/gmail/gmailForms";
import googlePull from './routes/gmail/webhooks/gmailPull';
import gmailRuleBox from './routes/gmail/gmailRuleBox';
import gmailSummariser from './routes/gmail/gmailSummariser';
import creditsRoute from './routes/creditsRoute';
import payPalRoute from './routes/payments/paypal/paypalRoute';
import cashfreeRoute from './routes/payments/cashfree/cashfreeRoutes';
import profile from './routes/profile';
import mail from './routes/mail';
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
app.use("/api/profile", profile);
app.use("/api/mail", mail);

// GMAIL
app.use("/api/gmail/form", gmailForms);
app.use("/api/gmail/pull", googlePull);
app.use("/api/gmail/rulebox", gmailRuleBox);
app.use("/api/gmail/instances", gmailInstance);
app.use("/api/gmail/summarise", gmailSummariser);
// PAYMENTS
app.use("/api/payments/paypal", payPalRoute);
app.use("/api/payments/cashfree", cashfreeRoute);

export default app;
