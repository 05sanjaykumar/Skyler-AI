import express from "express";
import bodyParser from "body-parser";
import { registerUser } from "./routes/auth/register";
import { verifyUser } from "./routes/auth/verify-user";
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

export default app;
