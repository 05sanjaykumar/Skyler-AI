# Skyler-Inbox-Demo
Demo Video, Architecture, etc. 

Video Demo: https://youtu.be/ATNYoNt6oBE

# Description

Skyler is an Organiser, Filter tool, Multi inbox and isolated management of workflow and productivity tool. Uses Semantic Search, ML models to classify and reduce the noise across social media. Privacy focused too. 

For now woking with Gmail as the MVP of product. Still in gmail improvement.

**Time line taken 42 days to deliver first MVP**

---

### Features:


- Credits based system for money conversion.
- Everyone gets 3 inbox for now on a free plan with 25 credits per month.
- Rule based template once set for a particular inbox by the user, AI will form drafts accordingly throughout the particular inbox. Once rules are set, just click the mail needed, generate a template, one click draft direct to gmail. Any mails just click and generate, once template is set, use anywhere and form drafts and reply it in gmail in one click direct transfer.
- Fill the form on each inbox once and just refresh to pull up to 200 mails in a single time costing just one credit, entirely organised and classified. Easy to remove and include from inbox and just select the needed one to batch reply.
- 200 credits on top of 25 credits for just 19 dollars per month up to 10 inboxes. Refresh with the same set up configuration and just cost 1 credit.
- Modern UI and smooth loading having visuals and easier.
- Full privacy, and data efficiency since the information is stored in the cache without loading into the server. We just save the transaction in list and some email account related info for processing, session storage and to buy credits.
- Advanced classification since we use sentiment analysis, semantic search that understands emotions and priority filters too.
- It has a search engine and a store box. Once searched, things get destroyed, we can search multiple times and add in the store box on the mails that are only needed. Search box gives you repeated results destroying the previous mails, storebox stores it and you can add on top of it the required mails. You can easily move from store to search.
- Everyone gets 25 monthly credits for a free plan.
- Everyone gets the same amount of inbox, there will be a problem if I just gave more inboxes to someone who is paid and unpaid, so what if their data get's lost or how would I manage it, so yeah everyone gets the same amount of inboxes, maybe 20-30 later.
- Give users manual control over reply, you can open the filtered mail in gmail, on just set one time rule in each inbox, just generate a summary for each mail that is needed, and use the draft and direct open in gmail to send through a button.
- Gives users so much manual control and power, so that they don't miss out anything, beautiful UI so that you don't have to type in gmail to: from:, so yeah direct form based one and change any time easily for each inbox.
- Data is not collected and mail is stored in cache. Maybe while summarising the body might be sent to groq, and other than that we use our ML models just to process data in the backend. Only uses restricted scope like gmail readonly. 

---

### Future idea

- To handle multiple platform, easy to filter organise
- To summarise organised one with AI, easy set reply from AI for batch replied mails, or user too has more control.
- Give access to web hooks to integrate on multiple platforms once rules are set, to easy classify separate.
- Maybe like even zapier work flows on combining instances and doing works.
- Batch Summarisation for inboxes.

---

## Problem

- Cloud Application and security(CASA), yeah may only add up to 100 users, need to get certificate for this one to quality this standard from any third party, for now using restirctive scope such as gmail readonly.

---

## Tech Stack


### Currently

- **Frontend**: Next js, Next Auth, Google Oauth, Session, Tailwind, ShadCN, Framer motion.  
- **Backend**: Express js with type script  
- **Database**: Supabase, Prisma ORM, Dexie for caching mails and adding in local storage of users.  
- **Email**: Gmail Pull from cloud console(Currently using pull method that uses user access token, refresh token) since we don't have a domain name.  
- **Architecture**: Turbo pack with PNPM package manager for scaling easily, taking to YC and for longer terms  
- **ML model**: Xenova/distilbert-base-uncased-finetuned-sst-2-english, sentence-transformers/all-MiniLM-L6-v2.  
- **AI**: Groq Llama 3.1-8b-instant and langchain for summaristation and for sending replies. 
- **Payments**: Paypal, Cashfree working.
- **Test**: Jest. 
- **Devops**: Docker, Docker-compose
- **Others**: Ngrok, Zustand, Nginx etc.

### Future addition

- **Analytics**: Google analytics, Plausible, etc.
- **Monitoring**: Sentry, Posthog, etc.
- **CI/CD**: Github actions
- **Payments**: Stripe in future if availabe. 

---


## Features to add and the business model for money making, and other doubts


1. Change payment end point and email address on cashfree and paypal, from sandbox. 

## Future things to add or in parallel while out reach. 

1. Seperate business email.
2. Video upload for demo
3. To add analytics like plausible, sentry, posthog, etc.
4. To update meta data.
5. uploading the logo that I have. 
6. Contact us, support for sending and collecting emails using resend and for now through direct mail. So yeah I am having another professional mail called contact@sanjaybuilds.com. I just going to put over here, yeah so much delaying I just wanna quickly test these things. While the website name used to be skylerInbox.com actually. To much time just going on setting up alone.
7. CI/CD structure for keep updating in parallel.

---

## Errors out there and things need to be updated

1. Oauth refresh token errors
2. change in cashfree and paypal urls.

---

## Directory structure currently
```
Directory structure:
└── 05sanjaykumar-skyler-ai/
    ├── README.md
    ├── docker-compose.yml
    ├── package.json
    ├── pnpm-workspace.yaml
    ├── turbo.json
    ├── .npmrc
    ├── apps/
    │   ├── api/
    │   │   ├── Dockerfile
    │   │   ├── jest.config.js
    │   │   ├── package.json
    │   │   ├── tsconfig.jest.json
    │   │   ├── tsconfig.json
    │   │   ├── .dockerignore
    │   │   └── src/
    │   │       ├── app.ts
    │   │       ├── server.ts
    │   │       ├── __mocks__/
    │   │       │   ├── auth.ts
    │   │       │   └── @xenova/
    │   │       │       └── transformers.ts
    │   │       ├── __tests__/
    │   │       │   ├── auth.test.ts
    │   │       │   ├── credits.test.ts
    │   │       │   └── mail.test.ts
    │   │       ├── AI_Services/
    │   │       │   ├── models.ts
    │   │       │   └── gmail_AI/
    │   │       │       ├── emailClassifier.ts
    │   │       │       └── groq_summariser.ts
    │   │       ├── config/
    │   │       │   └── subscriptions.ts
    │   │       ├── middleware/
    │   │       │   └── auth.ts
    │   │       ├── routes/
    │   │       │   ├── creditsRoute.ts
    │   │       │   ├── mail.ts
    │   │       │   ├── profile.ts
    │   │       │   ├── auth/
    │   │       │   │   ├── register.ts
    │   │       │   │   └── verify-user.ts
    │   │       │   ├── gmail/
    │   │       │   │   ├── gmailForms.ts
    │   │       │   │   ├── gmailInstances.ts
    │   │       │   │   ├── gmailRuleBox.ts
    │   │       │   │   ├── gmailSummariser.ts
    │   │       │   │   └── webhooks/
    │   │       │   │       └── gmailPull.ts
    │   │       │   └── payments/
    │   │       │       ├── cashfree/
    │   │       │       │   ├── cashfreeRoutes.ts
    │   │       │       │   └── client.ts
    │   │       │       └── paypal/
    │   │       │           ├── client.ts
    │   │       │           ├── paypalRoute.ts
    │   │       │           └── paypalServices.ts
    │   │       ├── testUtils/
    │   │       │   └── setup.ts
    │   │       └── utils/
    │   │           └── creditsPlan.ts
    │   └── web/
    │       ├── README.md
    │       ├── components.json
    │       ├── Dockerfile
    │       ├── eslint.config.js
    │       ├── next.config.js
    │       ├── package.json
    │       ├── postcss.config.js
    │       ├── tailwind.config.js
    │       ├── tsconfig.json
    │       ├── .dockerignore
    │       ├── app/
    │       │   ├── globals.css
    │       │   ├── layout.tsx
    │       │   ├── not-found.tsx
    │       │   ├── page.module.css
    │       │   ├── page.tsx
    │       │   ├── (main)/
    │       │   │   ├── layout.tsx
    │       │   │   ├── dashboard/
    │       │   │   │   ├── layout.tsx
    │       │   │   │   ├── page.tsx
    │       │   │   │   └── gmail/
    │       │   │   │       ├── page.tsx
    │       │   │   │       └── [instanceId]/
    │       │   │   │           └── page.tsx
    │       │   │   ├── payments/
    │       │   │   │   ├── checkout/
    │       │   │   │   │   └── [planId]/
    │       │   │   │   │       └── page.tsx
    │       │   │   │   ├── failure/
    │       │   │   │   │   └── page.tsx
    │       │   │   │   ├── plans/
    │       │   │   │   │   └── page.tsx
    │       │   │   │   └── success/
    │       │   │   │       └── page.tsx
    │       │   │   └── profile/
    │       │   │       └── page.tsx
    │       │   ├── about/
    │       │   │   └── page.tsx
    │       │   ├── api/
    │       │   │   └── auth/
    │       │   │       └── [...nextauth]/
    │       │   │           └── route.ts
    │       │   ├── contact/
    │       │   │   └── page.tsx
    │       │   ├── docs/
    │       │   │   ├── layout.tsx
    │       │   │   ├── page.tsx
    │       │   │   ├── credits/
    │       │   │   │   └── page.tsx
    │       │   │   ├── emails/
    │       │   │   │   └── page.tsx
    │       │   │   ├── faq/
    │       │   │   │   └── page.tsx
    │       │   │   ├── forms/
    │       │   │   │   └── page.tsx
    │       │   │   ├── getting-started/
    │       │   │   │   └── page.tsx
    │       │   │   ├── inboxes/
    │       │   │   │   └── page.tsx
    │       │   │   ├── legal/
    │       │   │   │   └── page.tsx
    │       │   │   ├── rules/
    │       │   │   │   └── page.tsx
    │       │   │   └── video/
    │       │   │       └── page.tsx
    │       │   ├── legal/
    │       │   │   ├── layout.tsx
    │       │   │   ├── disclaimer/
    │       │   │   │   └── page.tsx
    │       │   │   ├── privacy/
    │       │   │   │   └── page.tsx
    │       │   │   ├── refund/
    │       │   │   │   └── page.tsx
    │       │   │   └── terms/
    │       │   │       └── page.tsx
    │       │   ├── login/
    │       │   │   └── page.tsx
    │       │   ├── pricing/
    │       │   │   └── page.tsx
    │       │   ├── signin/
    │       │   │   └── page.tsx
    │       │   └── waitlist/
    │       │       └── page.tsx
    │       ├── src/
    │       │   ├── components/
    │       │   │   ├── CollapsibleFilters.tsx
    │       │   │   ├── footer.tsx
    │       │   │   ├── session-provider.tsx
    │       │   │   ├── theme-provider.tsx
    │       │   │   ├── top-bar.tsx
    │       │   │   ├── Gmail/
    │       │   │   │   ├── EmailDetail.tsx
    │       │   │   │   ├── EmailRules.tsx
    │       │   │   │   ├── GmailForm.tsx
    │       │   │   │   ├── SearchBox.tsx
    │       │   │   │   └── StoreBox.tsx
    │       │   │   ├── magicui/
    │       │   │   │   └── globe.tsx
    │       │   │   ├── payments/
    │       │   │   │   ├── CashfreeButton.tsx
    │       │   │   │   ├── PaymentMethodToggle.tsx
    │       │   │   │   ├── PaypalButton.tsx
    │       │   │   │   └── PlanCard.tsx
    │       │   │   └── ui/
    │       │   │       ├── avatar.tsx
    │       │   │       ├── badge.tsx
    │       │   │       ├── button.tsx
    │       │   │       ├── card.tsx
    │       │   │       ├── checkbox.tsx
    │       │   │       ├── dropdown-menu.tsx
    │       │   │       ├── input.tsx
    │       │   │       ├── label.tsx
    │       │   │       ├── mode-toggle.tsx
    │       │   │       ├── radio-group.tsx
    │       │   │       ├── select.tsx
    │       │   │       ├── separator.tsx
    │       │   │       ├── slider.tsx
    │       │   │       ├── sonner.tsx
    │       │   │       ├── switch.tsx
    │       │   │       ├── textarea.tsx
    │       │   │       └── vortex.tsx
    │       │   ├── hooks/
    │       │   │   └── use-mobile.tsx
    │       │   ├── lib/
    │       │   │   ├── auth-wrapper.tsx
    │       │   │   ├── credits.ts
    │       │   │   ├── plans.ts
    │       │   │   └── utils.ts
    │       │   └── store/
    │       │       ├── credits-store.ts
    │       │       └── gmail/
    │       │           ├── db.ts
    │       │           └── mails.ts
    │       └── types/
    │           ├── email.ts
    │           └── next-auth.d.ts
    └── packages/
        ├── package.json
        ├── tsconfig.json
        ├── eslint-config/
        │   ├── README.md
        │   ├── base.js
        │   ├── next.js
        │   ├── package.json
        │   └── react-internal.js
        ├── prisma/
        │   ├── package.json
        │   ├── schema.prisma
        │   ├── migrations/
        │   │   ├── migration_lock.toml
        │   │   ├── 20250824182505_init/
        │   │   │   └── migration.sql
        │   │   ├── 20250826062524_added_rule_box/
        │   │   │   └── migration.sql
        │   │   ├── 20250831031211_wait_list_contact_us_updated/
        │   │   │   └── migration.sql
        │   │   └── 20250902140146_daily_credit_usage/
        │   │       └── migration.sql
        │   └── src/
        │       ├── client.js
        │       └── client.ts
        ├── typescript-config/
        │   ├── base.json
        │   ├── nextjs.json
        │   ├── package.json
        │   └── react-library.json
        └── ui/
            ├── eslint.config.mjs
            ├── package.json
            ├── tsconfig.json
            └── src/
                ├── button.tsx
                ├── card.tsx
                └── code.tsx


```

---
