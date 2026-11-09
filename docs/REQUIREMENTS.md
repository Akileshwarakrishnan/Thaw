# Thaw: Full Development Requirements

PayPal AI Hackathon build spec. Submission deadline: Nov 12, 2026, 12:00 pm Pacific (Nov 13, 1:30 am IST). Target internal finish: Nov 11.

## 1. Project summary

**Thaw** is an early-warning and cash-flow shield for PayPal sellers. It connects to a seller's PayPal sandbox account, scores the risk of a fund hold or account limitation using known trigger signals, explains the score in plain language, proposes fixes that an AI agent can carry out after the seller approves them, and forecasts how much cash is available versus at risk.

**Tagline:** Know before PayPal freezes your money.

**Core promise:** PayPal won't tell you why your money gets held. Thaw tells you before it happens.

**Honest limitation (state it in the README, UI and video):** PayPal's real risk model is proprietary. Thaw is a proxy built from publicly documented triggers, not a replica.

**Naming rule:** Do not use "PayPal" inside the product name. Describe Thaw as "built for PayPal sellers".

## 2. Hackathon compliance checklist

- PayPal developer platform (sandbox) is central to every main feature.
- At least one AI model is used for explanations, drafting and the action agent.
- Project is newly built after Oct 1, 2026 (clean git history from day one).
- Text description of features and functionality on the Devpost form.
- Working demo: hosted URL or a repo with complete run instructions. No mockups.
- Public GitHub repo with a detectable open-source license (MIT or Apache-2.0) shown in the About section.
- Demo video under 3 minutes, public on YouTube, showing the app running end to end. No copyrighted music or third-party logos without permission.
- All materials in English.
- Test access: demo credentials or a one-click demo mode in the README.
- Original work, no PayPal or Devpost funding, third-party licenses respected.
- Free of charge for judges until the Judging Period ends (Dec 15).

## 3. Scope

### Must have
1. Connect a PayPal sandbox seller account and ingest transactions, disputes, refunds and shipment/tracking status.
2. Deterministic hold-risk score (Low, Medium, High) from documented trigger signals.
3. Plain-language explanation of the score, linked to the specific orders behind it.
4. Action agent with human approval: upload missing tracking, propose refunds for at-risk orders, draft buyer replies.
5. Cash-flow view: available now, estimated at risk, expected release.
6. Three seeded scenarios: healthy store, drifting store, post-spike store.

### Should have
7. Appeal and evidence drafter for a hold or limitation.
8. Webhook-driven live updates of the score.
9. Audit log of every score change and agent action.

### Could have
10. Pre-promotion warning (notify PayPal before a big sale).
11. Email or Slack alerts.

### Out of scope
- Replicating PayPal's real risk model.
- Other processors (Stripe, Square).
- Real money, live PayPal, or real merchant data.
- Mobile apps, billing, multi-tenant user management.

## 4. Architecture

```
Seller browser (Next.js UI)
        |
        v
Next.js API routes / Node backend
   |-- PayPal client (REST + Agent Toolkit)  <--> PayPal Sandbox
   |-- Webhook receiver  <-- PayPal webhooks
   |-- Risk engine (deterministic rules)
   |-- AI service (LLM: explain, draft, plan actions)
   |-- Action executor (approval-gated)
   |-- Database (Postgres or SQLite)
```

**Design rule:** the risk score and every money-moving action are computed and gated by code. The LLM only explains, drafts and proposes. It can never execute an action without an approval record in the database.

## 5. Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API routes or a small Node/Express service |
| Database | Postgres (Render) or SQLite for local, via Prisma or Drizzle |
| PayPal | REST APIs plus @paypal/agent-toolkit (MCP or ai-sdk integration) |
| AI | One LLM with structured JSON output (Claude API / Gemini suggested), called server-side |
| Validation | Zod schemas for all LLM output and webhook payloads |
| Hosting | Render (web service plus Postgres) |
| Testing | Vitest or Jest, Playwright for end-to-end paths |
