# Skyler AI 🤖

A search-engine-style inbox task manager where the user defines precise prompts for what they want tracked, and your system keeps collecting, organizing, and surfacing those results — with automation around categorization, notification, and batch replies.

Skyler is a prompt-based email and message organizer that lets users create AI-powered tasks to automatically collect, filter, and batch replies based on the intent and content of incoming emails — all through natural language prompts.

To help builders, support teams, and product owners organize incoming communication (like bug reports, feature requests, feedback) into focused, ongoing semantic tasks — so they can respond faster, smarter, and in batches, without depending on rigid automation tools or AI that strips away control.


## Sample Folder Structure
````
skyler-ai/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router (Next.js 13+)
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── prompts/
│   │   │   │   │   ├── messages/
│   │   │   │   │   └── settings/
│   │   │   │   ├── api/              # API routes
│   │   │   │   │   └── auth/
│   │   │   │   ├── globals.css
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   └── dialog.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard-header.tsx
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   └── stats-cards.tsx
│   │   │   │   ├── prompts/
│   │   │   │   │   ├── prompt-creator.tsx
│   │   │   │   │   ├── prompt-list.tsx
│   │   │   │   │   └── prompt-editor.tsx
│   │   │   │   ├── messages/
│   │   │   │   │   ├── message-list.tsx
│   │   │   │   │   ├── message-viewer.tsx
│   │   │   │   │   └── batch-reply.tsx
│   │   │   │   └── email/
│   │   │   │       ├── oauth-connect.tsx
│   │   │   │       └── account-list.tsx
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── validations.ts
│   │   │   └── hooks/
│   │   │       ├── use-prompts.ts
│   │   │       ├── use-messages.ts
│   │   │       └── use-auth.ts
│   │   ├── public/
│   │   ├── tailwind.config.js
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── api/                          # Node.js backend API
│       ├── src/
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── prompts.controller.ts
│       │   │   ├── messages.controller.ts
│       │   │   ├── email-accounts.controller.ts
│       │   │   └── ai.controller.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── email-processor.service.ts
│       │   │   ├── ai.service.ts
│       │   │   ├── prompt-engine.service.ts
│       │   │   ├── notification.service.ts
│       │   │   └── oauth.service.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rate-limit.middleware.ts
│       │   │   ├── validation.middleware.ts
│       │   │   └── error.middleware.ts
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── prompts.routes.ts
│       │   │   ├── messages.routes.ts
│       │   │   ├── email-accounts.routes.ts
│       │   │   └── webhooks.routes.ts
│       │   ├── utils/
│       │   │   ├── redis.ts
│       │   │   ├── email-connectors.ts
│       │   │   ├── vector-store.ts
│       │   │   ├── encryption.ts
│       │   │   └── logger.ts
│       │   └── app.ts
│       ├── prisma/
│       │   ├── schema.prisma          # Database schema
│       │   ├── migrations/            # Auto-generated migrations
│       │   │   ├── 20240101000000_init/
│       │   │   │   └── migration.sql
│       │   │   └── migration_lock.toml
│       │   └── seed.ts               # Seed data
│       ├── tests/
│       │   ├── controllers/
│       │   ├── services/
│       │   └── utils/
│       └── package.json
│
├── packages/                         # Shared libraries
│   ├── types/
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── prompt.types.ts
│   │   │   ├── message.types.ts
│   │   │   ├── api.types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/
│   │   ├── src/
│   │   │   ├── database.config.ts
│   │   │   ├── ai.config.ts
│   │   │   ├── email.config.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── utils/
│       ├── src/
│       │   ├── validation.ts
│       │   ├── encryption.ts
│       │   ├── constants.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── workers/                          # Background job processors
│   ├── email-ingestion/
│   │   ├── src/
│   │   │   ├── workers/
│   │   │   │   ├── gmail.worker.ts
│   │   │   │   ├── outlook.worker.ts
│   │   │   │   └── imap.worker.ts
│   │   │   ├── services/
│   │   │   │   ├── email-fetcher.service.ts
│   │   │   │   └── message-parser.service.ts
│   │   │   ├── utils/
│   │   │   │   └── oauth-helper.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── ai-processing/
│   │   ├── src/
│   │   │   ├── workers/
│   │   │   │   ├── semantic-analyzer.worker.ts
│   │   │   │   ├── prompt-matcher.worker.ts
│   │   │   │   └── batch-processor.worker.ts
│   │   │   ├── services/
│   │   │   │   ├── openai.service.ts
│   │   │   │   ├── vector.service.ts
│   │   │   │   └── classification.service.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── notifications/
│       ├── src/
│       │   ├── workers/
│       │   │   ├── email.worker.ts
│       │   │   └── webhook.worker.ts
│       │   ├── services/
│       │   │   └── notification.service.ts
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/                   # DevOps and deployment
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.worker
│   │   └── docker-compose.yml
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── k8s/
│       ├── deployments/
│       ├── services/
│       └── ingress/
│
├── docs/
│   ├── api/
│   │   ├── authentication.md
│   │   ├── prompts.md
│   │   └── webhooks.md
│   ├── architecture.md
│   ├── deployment.md
│   └── contributing.md
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   ├── deploy.sh
│   └── backup.sh
│
├── .env.example
├── .gitignore
├── package.json                      # Root package.json for monorepo
├── turbo.json                        # Turborepo configuration
├── tsconfig.json                     # Root TypeScript config
└── README.md
````
# Skyler AI - Complete Setup Guide 🚀

## Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Docker (optional but recommended)

## 1. Root Setup

```bash
mkdir skyler-ai && cd skyler-ai
npm init -y
npm install -D turbo @turbo/gen typescript
npm install -g pnpm  # Better package manager for monorepos
```

**Root package.json:**
```json
{
  "name": "skyler-ai",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "workers/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:migrate": "turbo run db:migrate",
    "setup": "./scripts/setup.sh"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "@turbo/gen": "^1.10.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

## 2. Frontend App (apps/web)

```bash
mkdir -p apps/web && cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ../..
```

**apps/web/package.json additions:**
```json
{
  "dependencies": {
    "@skyler/types": "workspace:*",
    "@skyler/config": "workspace:*",
    "next-auth": "^4.24.0",
    "@tanstack/react-query": "^4.36.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.263.1",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  }
}
```

## 3. Backend API (apps/api)

```bash
mkdir -p apps/api && cd apps/api
pnpm init
cd ../..
```

**apps/api/package.json:**
```json
{
  "name": "@skyler/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@skyler/types": "workspace:*",
    "@skyler/config": "workspace:*",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "@prisma/client": "^5.7.0",
    "redis": "^4.6.0",
    "bull": "^4.12.0",
    "openai": "^4.20.0",
    "nodemailer": "^6.9.0",
    "imap": "^0.8.19",
    "googleapis": "^128.0.0",
    "langchain": "^0.0.190",
    "pinecone-database": "^1.1.0",
    "zod": "^3.22.0",
    "express-rate-limit": "^7.1.0",
    "express-validator": "^7.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/node": "^20.8.0",
    "prisma": "^5.7.0",
    "tsx": "^4.1.0",
    "typescript": "^5.0.0"
  }
}
```

## 4. Shared Packages

### Types Package (packages/types)
```bash
mkdir -p packages/types && cd packages/types
pnpm init
cd ../..
```

**packages/types/package.json:**
```json
{
  "name": "@skyler/types",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

### Config Package (packages/config)
```bash
mkdir -p packages/config && cd packages/config
pnpm init
cd ../..
```

**packages/config/package.json:**
```json
{
  "name": "@skyler/config",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

## 5. Workers Setup

```bash
mkdir -p workers/email-ingestion && cd workers/email-ingestion
pnpm init
cd ../..

mkdir -p workers/ai-processing && cd workers/ai-processing
pnpm init
cd ../..
```

**workers/email-ingestion/package.json:**
```json
{
  "name": "@skyler/email-worker",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@skyler/types": "workspace:*",
    "@skyler/config": "workspace:*",
    "bull": "^4.12.0",
    "redis": "^4.6.0",
    "googleapis": "^128.0.0",
    "imap": "^0.8.19"
  },
  "devDependencies": {
    "tsx": "^4.1.0",
    "typescript": "^5.0.0"
  }
}
```

## 6. Prisma Setup (apps/api)

**apps/api/prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String    @map("password_hash")
  name         String?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  emailAccounts EmailAccount[]
  prompts       Prompt[]
  messages      Message[]

  @@map("users")
}

model EmailAccount {
  id           String  @id @default(cuid())
  userId       String  @map("user_id")
  provider     String  // 'gmail', 'outlook', 'imap'
  email        String
  accessToken  String? @map("access_token")
  refreshToken String? @map("refresh_token")
  settings     Json    @default("{}")
  createdAt    DateTime @default(now()) @map("created_at")

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@map("email_accounts")
}

model Prompt {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  name        String
  description String?
  promptText  String   @map("prompt_text")
  filters     Json     @default("{}")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  matches PromptMatch[]

  @@map("prompts")
}

model Message {
  id             String    @id @default(cuid())
  userId         String    @map("user_id")
  emailAccountId String    @map("email_account_id")
  messageId      String    @map("message_id") // Provider's message ID
  subject        String?
  fromEmail      String?   @map("from_email")
  fromName       String?   @map("from_name")
  bodyText       String?   @map("body_text")
  bodyHtml       String?   @map("body_html")
  receivedAt     DateTime? @map("received_at")
  processedAt    DateTime? @map("processed_at")
  metadata       Json      @default("{}")
  // embedding field will be handled separately with pgvector
  createdAt      DateTime  @default(now()) @map("created_at")

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailAccount EmailAccount  @relation(fields: [emailAccountId], references: [id], onDelete: Cascade)
  matches      PromptMatch[]

  @@index([userId])
  @@index([receivedAt])
  @@map("messages")
}

model PromptMatch {
  id              String   @id @default(cuid())
  promptId        String   @map("prompt_id")
  messageId       String   @map("message_id")
  confidenceScore Float?   @map("confidence_score")
  aiAnalysis      Json?    @map("ai_analysis")
  status          String   @default("pending") // 'pending', 'reviewed', 'replied'
  createdAt       DateTime @default(now()) @map("created_at")

  prompt  Prompt  @relation(fields: [promptId], references: [id], onDelete: Cascade)
  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@index([promptId])
  @@index([status])
  @@map("prompt_matches")
}
```

**apps/api/prisma/seed.ts:**
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'demo@skyler.ai',
      passwordHash: hashedPassword,
      name: 'Demo User',
    },
  })

  // Create demo prompt
  await prisma.prompt.create({
    data: {
      userId: user.id,
      name: 'Bug Reports',
      description: 'Track all bug reports and issues',
      promptText: 'Find emails about bugs, errors, crashes, or technical issues that need immediate attention',
      filters: {
        keywords: ['bug', 'error', 'crash', 'issue', 'broken'],
        priority: 'high'
      }
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 7. Environment Setup

**Root .env.example:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skyler_ai"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Services
OPENAI_API_KEY="your_openai_key"
PINECONE_API_KEY="your_pinecone_key"
PINECONE_ENVIRONMENT="your_pinecone_env"

# OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
MICROSOFT_CLIENT_ID="your_microsoft_client_id"
MICROSOFT_CLIENT_SECRET="your_microsoft_client_secret"

# JWT
JWT_SECRET="your_jwt_secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email"
SMTP_PASS="your_app_password"

# App
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
API_URL="http://localhost:3001"
```

## 8. Installation Commands

```bash
# Install all dependencies
pnpm install

# Set up Prisma (in apps/api directory)
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed
cd ../..

# Start development
pnpm dev

# This will start:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
# - Workers: Background processes

# Useful Prisma commands (run from apps/api):
# npx prisma studio      # Visual database browser
# npx prisma migrate dev # Create and apply migrations
# npx prisma db push     # Push schema changes without migrations
```

## 9. Docker Setup (Optional)

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: skyler_ai
      POSTGRES_USER: skyler
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Ready to Scale! 🚀

This setup gives you:
- **Monorepo architecture** for easy shared code
- **Microservices ready** - each app can be deployed independently
- **Background job processing** for email ingestion
- **Vector database ready** for AI semantic search
- **OAuth integration** for Gmail/Outlook
- **Type safety** across the entire stack

Start with `pnpm dev` and you'll have a full-stack TypeScript application running! 🔥