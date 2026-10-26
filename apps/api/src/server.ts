// apps/api/src/server.ts
import dotenv from 'dotenv'
import app from "./app";
import { loadModels } from "./AI_Services/models";
dotenv.config()

const port =  Number(process.env.PORT) || 4000

// Warm up the classification models once at boot so the first Gmail pull
// request isn't the one paying for ONNX model load time.
loadModels()
  .then(() => console.log("AI classification models loaded"))
  .catch((err) => console.error("Failed to pre-load AI models:", err));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`)
})
