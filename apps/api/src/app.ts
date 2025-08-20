// apps/api/src/app.ts
import express from "express";
import bodyParser from "body-parser";
import { registerUser } from "./routes/auth/register";
import { verifyUser } from "./routes/auth/verify-user";
import instancesRouter from "./routes/instances";
import gmailPromptRouter from "./routes/gmailPrompt";
import googlePull from './routes/webhooks/gmailPull';
import creditsRoute from './routes/Credits';
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

app.post("/api/register", registerUser);
app.post("/api/verify-user", verifyUser);
app.use("/api/instances", instancesRouter);
app.use("/api/gmail/prompt", gmailPromptRouter);
app.use("/api/gmail/pull", googlePull);
app.use("/api/credits", creditsRoute);

export default app;
