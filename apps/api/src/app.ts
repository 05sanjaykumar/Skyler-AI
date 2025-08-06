import express from "express";
import bodyParser from "body-parser";
import { registerUser } from "./routes/auth/register";
import { verifyUser } from "./routes/auth/verify-user";

const app = express();

app.use(bodyParser.json());

app.get('/', (_req, res) => {
  res.send('Hello from TypeScript Express!')
})

app.post("/api/register", registerUser);
app.post("/api/verify-user", verifyUser);

export default app;
