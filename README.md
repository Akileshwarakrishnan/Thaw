# Thaw: Early-Warning & Cash-Flow Shield Built for PayPal Sellers

> **Tagline:** Know before PayPal freezes your money.  
> **Core Promise:** PayPal won't tell you why your money gets held. Thaw tells you before it happens.  
> **Built for:** PayPal AI Hackathon 2026

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Demo Video: YouTube](https://img.shields.io/badge/YouTube-Watch%20Demo%20Video-red.svg)](https://youtu.be/om5k2e5uxz0)
[![Built with Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Database: SQLite / Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748.svg)](https://www.prisma.io/)
[![PayPal Sandbox](https://img.shields.io/badge/PayPal-Sandbox%20REST%20APIs-0070BA.svg)](https://developer.paypal.com/)
[![AI: Gemini / Claude Structured](https://img.shields.io/badge/AI-Structured%20Zod%20JSON-8A2BE2.svg)](#how-ai-is-used)

---

## ⚠️ Honest Limitation

> **PayPal's real underwriting and hold algorithms are strictly proprietary.**  
> Thaw is an intelligent early-warning proxy built from publicly documented triggers, dispute velocity thresholds, and merchant protection policies. It is **not** an internal replica of PayPal's private risk infrastructure.

---

## 1. The Problem & Solution

### The Merchant Dilemma
For e-commerce merchants relying on PayPal, cash flow is lifeblood. Yet thousands of merchants wake up to an unexpected email:
> *"Your funds are on a 21-day hold / Your account has been placed on a rolling reserve."*

PayPal's automated risk bots detect early signals—such as fulfillment delays, sudden promotional sales spikes, or early chargeback momentum—and unilaterally lock incoming cash to protect buyers. Merchants are left guessing which specific orders caused the hold, unable to pay suppliers, payroll, or fulfillment bills.

### The Solution: Thaw
**Thaw** gives merchants early-warning foresight and automated remediation:
1. **Connects to PayPal Sandbox:** Ingests transactions, customer disputes, refund velocity, and carrier tracking telemetry.
2. **Deterministic Risk Engine:** Scores the probability of an automated hold or limitation from 0 to 100 across 6 documented trigger signals.
3. **Plain-Language AI Diagnosis:** Explains in simple English why the score changed, pinpointing the exact orders responsible.
4. **Action Agent (Human Approval-Gated):** Proposes ranked remediation steps (uploading missing carrier tracking, issuing proactive refunds on mismatched orders, drafting rebuttals) and executes them via the PayPal API upon merchant approval.
5. **Cash-Flow Shield:** Forecasts cleared balance vs. estimated funds at risk (0% Low, 10% Medium, 30% High) and expected release timelines.
6. **Pre-Promotion Simulator:** Allows merchants to simulate upcoming marketing campaigns (e.g. Black Friday 3x velocity) and provides pre-notification packets for PayPal underwriting to avoid automated velocity flags.

---

## 2. Architecture

```
                  +----------------------------------------------+
                  |         Seller Browser (Next.js UI)          |
                  |  - Hold Risk Gauge & 6 Signal Meters         |
                  |  - Cash-Flow Cards (Available vs At-Risk)    |
                  |  - Action Queue (Approve / Reject)           |
                  |  - Orders & Disputes Ledger                  |
                  |  - Pre-Promotion Spike Simulator             |
                  |  - One-Click Demo Scenario Switcher          |
                  +-----------------------+----------------------+
                                          |
                                          v
                  +----------------------------------------------+
                  |            Next.js App Router API            |
                  |  - /api/risk (Snapshot & Cash-flow)          |
                  |  - /api/actions/[id]/approve (Gated exec)    |
                  |  - /api/appeal (AI Rebuttal Drafter)         |
                  |  - /api/webhooks/paypal (Idempotent events)  |
                  |  - /api/demo/scenario (Seeded store states)  |
                  +-------+---------------+--------------+-------+
                          |               |              |
                          v               v              v
     +--------------------+--+    +-------+------+  +----+-----------------+
     | PayPal REST & Agent   |    | Risk Engine  |  | AI Service           |
     | Sandbox Client        |    | (6 weighted  |  | (Gemini / LLM        |
     | - Shipment Tracking   |    |  signals)    |  |  Structured Zod      |
     | - Disputes & Appeals  |    +-------+------+  |  JSON Output)        |
     | - Payments & Refunds  |            |         +----------------------+
     | - Webhook Verify      |            v
     +-----------------------+    +-------+----------------------+
                                  | Action Executor & Guardrails |
                                  | - Approval record mandatory  |
                                  | - Idempotency enforcement    |
                                  | - Refund balance cap         |
                                  +---------------+--------------+
                                                  |
                                                  v
                                  +---------------+--------------+
                                  | Database (Prisma + SQLite)   |
                                  | - Immutable Audit Log        |
                                  | - Orders, Disputes, Signals  |
                                  +------------------------------+
```

### Architectural Guardrails
- **Deterministic Math Gating:** The risk score is calculated strictly by code, never by the LLM.
- **Human-in-the-Loop Gating:** No money moves and no tracking uploads occur without an explicit approval row in the database.
- **Refund Capping:** Refunds can never exceed the order's remaining balance.
- **Idempotency:** Action executions and webhook event deliveries are deduplicated and executed at most once.

---

## 3. Real-versus-Simulated Implementation Map

To provide full transparency to judges and developers, the table below documents precisely which operations interact with the live PayPal Sandbox REST API versus high-fidelity local simulation:

| Component / Action | When Sandbox Keys Present (`PAYPAL_CLIENT_ID`) | In Zero-Setup Demo Mode (`DEMO_MODE=true`) | Verification Proof |
|---|---|---|---|
| **Orders API (`/v2/checkout/orders`)** | **Live Sandbox:** Creates genuine sandbox order with capture intent | **Simulated:** Seeded order with realistic PayPal ID schema | Verified in `scripts/sandbox-e2e.ts` |
| **Shipment Tracking (`/v1/shipping/trackers`)** | **Live Sandbox:** Uploads carrier tracking telemetry directly to PayPal | **Simulated:** Generates tracker ID, satisfies delivery criteria | Marked as `LIVE_SANDBOX` or `SIMULATED` badge |
| **Payments Refund (`/v2/payments/captures/...`)** | **Live Sandbox:** Issues real partial/full capture refund | **Simulated:** Updates balance, checks refund cap guardrails | Audit logged & capped at order balance |
| **Customer Disputes (`/v1/customer/disputes`)** | **Live Sandbox:** Queries live sandbox dispute items | **Simulated:** 3 seeded realistic dispute claims with countdowns | Tested via `scripts/paypal-check.ts` |
| **Webhook Signature Verification** | **Live Sandbox:** Calls PayPal's certificate verification endpoint | **Simulated:** Verifies HMAC token format & deduplication | Idempotent by `paypal_event_id` |
| **Action Execution Path** | **PayPal Agent Toolkit (MCP):** Dispatched via MCP tool schema adapter | **PayPal Agent Toolkit:** MCP tool validation with simulated execution | Recorded with `executionChannel` tag |

Every record in the Orders Ledger and Action Queue displays a visible **🟢 LIVE SANDBOX** or **🟡 SIMULATED** badge for 100% transparency.

---

## 4. PayPal Platform & Agent Toolkit Integration

Thaw integrates with the PayPal Developer Platform through both direct REST APIs and the **PayPal Agent Toolkit / Model Context Protocol (MCP)**:

### PayPal Agent Toolkit (MCP Protocol)
Remediation actions in Thaw are dispatched through formal MCP tool interfaces defined in [`src/lib/paypal/agent-toolkit.ts`](src/lib/paypal/agent-toolkit.ts):
- `paypal_upload_tracking`: Formats carrier telemetry and dispatches delivery confirmation.
- `paypal_issue_refund`: Validates order remaining balance and dispatches capture refund.
- `paypal_get_disputes`: Queries open dispute cases and deadline timers.
- `paypal_submit_dispute_evidence`: Formats AI-drafted rebuttal documentation and submits evidence.

If the Agent Toolkit MCP channel encounters an error or timeout, the engine automatically routes execution through the PayPal REST client as a verified fallback.

---

## 5. Evidence Behind Each Hold Trigger

Every signal in Thaw's deterministic risk engine is grounded in publicly documented PayPal underwriting policies and help center documentation:

| Signal | Weight | Documented Underwriting Rule | Official Source Documentation |
|---|---|---|---|
| **Dispute Rate & Trend** | **30** | Accounts exceeding 1.5% dispute velocity enter excessive defect programs requiring 10%–30% rolling reserve holds. | [PayPal User Agreement §10 (Restricted Activities)](https://www.paypal.com/us/legalhub/useragreement-full#restricted-activities) & Chargeback Guide |
| **Missing Tracking** | **25** | Physical shipments dispatched without carrier delivery telemetry automatically trigger 21-day payment holds. | [PayPal Help Center: Why is my payment on hold?](https://www.paypal.com/us/smarthelp/article/why-is-my-payment-on-hold-faq1265) |
| **Volume Velocity Spike** | **20** | Unannounced sales velocity spikes exceeding 2x weekly baseline trigger automated risk bots to hold funds against delivery backlog. | [PayPal Merchant Risk Management: Sales Velocity](https://www.paypal.com/us/business/risk-management) |
| **Address Mismatch** | **10** | Orders shipped to addresses differing from PayPal transaction records forfeit 100% of Seller Protection coverage. | [PayPal Seller Protection Policy §3](https://www.paypal.com/us/webapps/mpp/security/seller-protection) |
| **Refund Velocity** | **10** | High refund rates (>6%) indicate stockouts or quality defects, leading underwriting to establish reserve accounts. | [PayPal Business Underwriting: Understanding Reserves](https://www.paypal.com/us/brc/article/understanding-reserves) |
| **Dispute Deadlines** | **5** | Claims unanswered within 48 hours of deadline automatically default to buyer with permanent defect penalty mark. | [PayPal Resolution Center 48h Response Rule](https://www.paypal.com/us/smarthelp/article/how-do-i-respond-to-a-dispute-faq406) |

---

## 6. How AI is Used

1. **Plain-Language Risk Diagnosis (`aiService.explainRisk`):**
   - Ingests the 6 mathematical signal scores and the top offending orders.
   - Outputs a clear, non-jargon explanation of why the store is in the Low, Medium, or High risk band.
   - Formulates the top 3 contributing factors, points impact, and specific actionable advice.
2. **Prioritized Action Planning (`aiService.proposeActions`):**
   - Automatically detects unfulfilled shipments older than 3 days, impending dispute deadlines, and Seller Protection discrepancies.
   - Produces ranked, executable payloads with projected score reductions.
3. **Dispute Appeal & Evidence Drafter (`aiService.draftDisputeAppeal`):**
   - Synthesizes carrier telemetry, delivery confirmations, warehouse timestamps, and PayPal Seller Protection criteria into a formal rebuttal letter ready for submission.
4. **Structured JSON Validation:**
   - All AI responses are validated server-side using **Zod schemas** (`RiskExplanationSchema`, `ProposedActionItemSchema`, `DisputeAppealSchema`).
   - If an LLM call fails or lacks an API key, an intelligent deterministic heuristic engine generates high-fidelity context-aware output seamlessly.

---

## 5. Risk Scoring Methodology

The score is calculated on a 0–100 scale using 6 documented PayPal underwriting signals:

| Signal | Description | Weight | Critical Trigger Threshold |
|---|---|---|---|
| **Dispute Rate & Trend** | Disputes divided by transactions in last 30d, plus worsening trend penalty | **30** | > 1.5% starts elevated risk; > 2.5% is critical |
| **Missing Tracking** | Percentage of physical shipments older than 3 days without carrier tracking | **25** | > 10% elevated; > 30% critical |
| **Volume Velocity Spike** | Trailing 7-day sales divided by historical weekly baseline | **20** | > 1.8x elevated; > 3.0x critical anomaly |
| **Address Mismatch** | Orders shipped to addresses different from PayPal checkout record (voids Seller Protection) | **10** | > 5% warning; > 15% critical |
| **Refund Velocity** | 30-day refunds divided by gross sales volume | **10** | > 6% warning; > 12% critical |
| **Dispute Deadlines** | Open disputes expiring within 48 hours without response | **5** | 1 dispute = 50%; >= 2 disputes = 100% |
| **Total Weight** | | **100** | |

### Risk Bands & Cash-Flow Estimation

| Risk Band | Score Range | Status | Estimated Hold (% of 14d Sales) | Release Window |
|---|---|---|---|---|
| **LOW** | 0 – 33 | Optimal Health | **0%** | Immediate (No Active Holds) |
| **MEDIUM** | 34 – 66 | Elevated Underwriting Scrutiny | **10%** | 14 – 21 Days (Rolling Reserve) |
| **HIGH** | 67 – 100 | Critical Limitation / Freeze Risk | **30%** | 60 – 180 Days (Account Limitation) |

---

## 6. Three Seeded Scenarios (One-Click Demo Mode)

Judges can toggle between 3 realistic store scenarios in the UI with a single click:

1. **🟢 Healthy Store (`NovaCraft Goods`):**
   - 40 orders over 45 days, 100% carrier tracking, 0 address mismatches, 1 resolved dispute.
   - **Score: ~25-30 (LOW BAND)**
   - Cash Flow: 100% available, $0 at risk.
2. **🟡 Drifting Store (`ApexGear Apparel`):**
   - 48 orders, 14 orders missing tracking (>3 days old), 4 address mismatches, 2 open disputes (one due in 28h).
   - **Score: ~55-63 (MEDIUM BAND)**
   - Cash Flow: 10% rolling reserve exposure, remediations in queue.
3. **🔴 Post-Spike Store (`LuminaTech Direct`):**
   - Sudden 3x sales volume surge in 72h, 16 late shipments missing tracking, 3 open disputes with urgent deadlines.
   - **Score: ~85-94 (HIGH BAND)**
   - Cash Flow: 30% hold risk ($3,800+ at risk), urgent action required.

---

## 7. Getting Started & Running Locally

### Prerequisites
- Node.js v18+ (tested on Node v20 / v22 / v25)
- npm or pnpm
- Git

### Quickstart (30 seconds)

```bash
# 1. Clone the repository
git clone https://github.com/Akileshwarakrishnan/Thaw.git
cd Thaw

# 2. Install dependencies
npm install

# 3. Initialize SQLite database
npx prisma db push

# 4. Seed with default "drifting" scenario
npm run seed

# 5. Start development server
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.  
The application starts immediately in **Demo Mode** with all 3 scenarios ready for testing. No login or external credentials required!

---

## 8. PayPal Sandbox Configuration (Optional)

If you have a PayPal Developer account and wish to connect your live sandbox:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your credentials:
   ```env
   PAYPAL_ENV=sandbox
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   PAYPAL_WEBHOOK_ID=your_webhook_id
   ```
3. Run the built-in diagnostic tool to test your sandbox connection:
   ```bash
   npx tsx scripts/paypal-check.ts
   ```

---

## 10. Automated Testing & Real PayPal Sandbox Proof

Thaw includes both deterministic unit test suites and an end-to-end sandbox verification runner:

### 1. Unit Test Suite (Vitest)
```bash
npx vitest run
```
- `tests/risk-engine.test.ts`: Verifies weights sum to 100, clean store lands in LOW band, defective store lands in HIGH band, cash-flow estimates match formula.
- `tests/actions-executor.test.ts`: Verifies human approval requirement, idempotency guardrail (blocks double execution), and refund balance capping.

### 2. End-to-End Real Sandbox Proof Suite
```bash
npm run paypal:e2e
```
Executes a 5-step automated cycle against the PayPal sandbox platform:
1. Creates & captures order (`/v2/checkout/orders`).
2. Uploads carrier shipment tracking (`/v1/shipping/trackers`).
3. Issues partial/full payment refund (`/v2/payments/captures/refund`).
4. Queries live customer disputes (`/v1/customer/disputes`).
5. Cryptographically verifies webhook signature (`/v1/notifications/verify-webhook-signature`).

---

## 11. Vision: How We'd Extend This With PayPal's Real Internal Data

In a production partnership with PayPal, Thaw would evolve from an outside-in proxy into an official Merchant Underwriting Co-Pilot:

1. **Pre-Dispute Message Ingestion:** Ingest early buyer inquiry threads before formal dispute claims open, enabling the AI agent to resolve issues before a defect is recorded.
2. **Direct Underwriting Reserve Telemetry:** Receive real-time reserve tier notifications (e.g. 10% rolling reserve active for 45 days) directly from PayPal's risk engine.
3. **Automated Reserve Release Requests:** When the merchant fulfills all missing tracking and lowers the dispute rate below 1%, Thaw would automatically dispatch a structured reserve appeal directly to PayPal's underwriting queue with verified logistics evidence.

---

## 12. Official Product Demo Video

> 📺 **Watch the Official 1080p Walkthrough on YouTube:** [https://youtu.be/om5k2e5uxz0](https://youtu.be/om5k2e5uxz0)

| Timestamp | Scene | Key Feature Demonstrated |
|---|---|---|
| **0:00 – 0:42** | Problem & Hook | Unannounced 21-day holds & $1.2B frozen annual merchant capital |
| **0:42 – 1:22** | Live Hold Risk Gauge | 63/100 Medium Risk score & $303.40 at-risk reserve quantification |
| **1:22 – 2:03** | AI Root-Cause Diagnosis | Plain-language breakdown & Action Queue with Weight Impact Badges (-6 pts) |
| **2:03 – 2:45** | The Hero Moment | Human approval-gated dispatch via PayPal Agent Toolkit MCP & score drop to 57 |
| **2:45 – 3:27** | Real Sandbox Proof | Proactive flash sale simulator & 5-step live PayPal REST API verification cycle |
| **3:27 – 3:48** | Production Architecture | Next.js 14, TypeScript, Prisma, and 21/21 passing automated tests |

---

## 13. What Was Built During the Hackathon

All code in this repository was conceived and created newly after October 1, 2026:
- **Frontend Dashboard:** Next.js 14 App Router, Tailwind CSS, SVG Risk Gauge, responsive Cash-Flow cards, interactive Action Queue, Orders & Underwriting table.
- **Deterministic Risk Engine:** Mathematical multi-factor evaluation with normalization curves and weighted scoring.
- **AI Service:** Zod-validated structured outputs, plain-language explanations, action prioritization, and formal dispute appeal drafter.
- **Action Executor & Agent Toolkit:** Human-gated approval pipeline, PayPal Agent Toolkit / MCP dispatch with REST fallback, refund cap validation, and immutable audit logging.
- **Webhook Telemetry:** Webhook receiver with deduplication idempotency and automated score recomputation.
- **Pre-Promotion Warning Simulator:** Marketing spike simulator with underwriting pre-notification checklist.

---

## 14. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
