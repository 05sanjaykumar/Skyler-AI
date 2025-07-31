// apps/api/src/server.ts
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.get('/', (_req, res) => {
  res.send('Hello from TypeScript Express!')
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
