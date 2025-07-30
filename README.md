# Skyler AI 🤖

A search-engine-style inbox task manager where the user defines precise prompts for what they want tracked, and your system keeps collecting, organizing, and surfacing those results — with automation around categorization, notification, and batch replies.

Skyler is a prompt-based email and message organizer that lets users create AI-powered tasks to automatically collect, filter, and batch replies based on the intent and content of incoming emails — all through natural language prompts.

To help builders, support teams, and product owners organize incoming communication (like bug reports, feature requests, feedback) into focused, ongoing semantic tasks — so they can respond faster, smarter, and in batches, without depending on rigid automation tools or AI that strips away control.


## Sample Folder Structure
````
skyler-ai/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   ├── dashboard/            # Dashboard-specific components
│   │   │   ├── prompts/              # Prompt creation/management
│   │   │   └── email/                # Email display/batch reply
│   │   ├── pages/
│   │   │   ├── api/                  # Next.js API routes
│   │   │   ├── dashboard/
│   │   │   ├── prompts/
│   │   │   └── settings/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── api-client.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   └── api/                          # Node.js backend API
│       ├── src/
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── prompts.controller.ts
│       │   │   ├── emails.controller.ts
│       │   │   └── ai.controller.ts
│       │   ├── services/
│       │   │   ├── email-processor.service.ts
│       │   │   ├── ai.service.ts
│       │   │   ├── prompt-engine.service.ts
│       │   │   └── notification.service.ts
│       │   ├── models/
│       │   │   ├── user.model.ts
│       │   │   ├── prompt.model.ts
│       │   │   ├── message.model.ts
│       │   │   └── task.model.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rate-limit.middleware.ts
│       │   │   └── validation.middleware.ts
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── prompts.routes.ts
│       │   │   ├── emails.routes.ts
│       │   │   └── webhooks.routes.ts
│       │   ├── utils/
│       │   │   ├── database.ts
│       │   │   ├── redis.ts
│       │   │   ├── email-connectors.ts
│       │   │   └── vector-store.ts
│       │   └── app.ts
│       └── package.json
│
├── packages/                         # Shared libraries
│   ├── types/                        # TypeScript definitions
│   │   ├── user.types.ts
│   │   ├── prompt.types.ts
│   │   ├── message.types.ts
│   │   └── index.ts
│   ├── config/                       # Shared configurations
│   │   ├── database.config.ts
│   │   ├── ai.config.ts
│   │   └── email.config.ts
│   └── utils/                        # Shared utilities
│       ├── validation.ts
│       ├── encryption.ts
│       └── constants.ts
│
├── workers/                          # Background job processors
│   ├── email-ingestion/
│   │   ├── gmail.worker.ts
│   │   ├── outlook.worker.ts
│   │   └── imap.worker.ts
│   ├── ai-processing/
│   │   ├── semantic-analyzer.worker.ts
│   │   ├── prompt-matcher.worker.ts
│   │   └── batch-processor.worker.ts
│   └── notifications/
│       ├── email.worker.ts
│       └── webhook.worker.ts
│
├── infrastructure/                   # DevOps and deployment
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   └── docker-compose.yml
│   ├── terraform/                    # Infrastructure as code
│   └── k8s/                         # Kubernetes manifests
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   └── deployment.md
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   └── deploy.sh
│
├── .env.example
├── .gitignore
├── package.json                      # Root package.json for monorepo
├── turbo.json                        # Turborepo configuration
└── README.md
````