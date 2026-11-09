# Thaw: Early-Warning & Cash-Flow Shield Built for PayPal Sellers

> **Tagline:** Know before PayPal freezes your money.  
> **Core Promise:** PayPal won't tell you why your money gets held. Thaw tells you before it happens.  
> **Built for:** PayPal AI Hackathon 2026

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
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

## 3. PayPal Platform Integration

Thaw integrates with the PayPal Developer Sandbox platform across the following APIs:

| Capability | PayPal Endpoint | Implementation in Thaw |
|---|---|---|
| **Shipment Tracking** | `POST /v1/shipping/trackers` | Automated carrier tracking upload from the Action Queue to satisfy PayPal delivery gates and restore Seller Protection. |
| **Disputes Management** | `GET /v1/customer/disputes` | Real-time dispute ingestion, status tracking, and countdown timer for the 48-hour response deadline. |
| **Dispute Rebuttals** | Customer Disputes API | Structured AI appeal generation with carrier telemetry, pick-and-pack timestamps, and Seller Protection policy citations. |
| **Payments & Refunds** | `POST /v2/payments/captures/{id}/refund` | Approval-gated partial or full refunds to preempt high-defect disputes on mismatched address orders. |
| **Transaction Ingestion** | `GET /v1/reporting/transactions` | Sales history, rolling volume, baseline weekly average calculation. |
| **Webhooks** | `POST /api/webhooks/paypal` | Ingests `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`, `CUSTOMER.DISPUTE.CREATED`, `CUSTOMER.DISPUTE.RESOLVED` with cryptographic signature verification and idempotency deduplication. |
| **High-Fidelity Sandbox Fallback** | Local Mock & Simulation Layer | When credentials are not supplied, Thaw operates with authentic PayPal sandbox schemas and data models so judges can test instantly without setup friction. |

---

## 4. How AI is Used

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
git clone https://github.com/your-username/thaw.git
cd thaw

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

## 9. Automated Testing

Thaw includes unit tests covering risk score normalization, band thresholds, cash-flow calculations, idempotency, and approval guardrails.

```bash
# Run unit test suite
npx vitest run
```

Test Results:
- `tests/risk-engine.test.ts`: Verifies weights sum to 100, clean store lands in LOW band, defective store lands in HIGH band, cash-flow estimates match formula.
- `tests/actions-executor.test.ts`: Verifies human approval requirement, idempotency guardrail (blocks double execution), and refund balance capping.

---

## 10. What Was Built During the Hackathon

All code in this repository was conceived and created newly after October 1, 2026:
- **Frontend Dashboard:** Next.js 14 App Router, Tailwind CSS, SVG Risk Gauge, responsive Cash-Flow cards, interactive Action Queue, Orders & Underwriting table.
- **Deterministic Risk Engine:** Mathematical multi-factor evaluation with normalization curves and weighted scoring.
- **AI Service:** Zod-validated structured outputs, plain-language explanations, action prioritization, and formal dispute appeal drafter.
- **Action Executor:** Human-gated approval pipeline, PayPal REST tracking & refund integration, refund cap validation, and immutable audit logging.
- **Webhook Telemetry:** Webhook receiver with deduplication idempotency and automated score recomputation.
- **Pre-Promotion Warning Simulator:** Marketing spike simulator with underwriting pre-notification checklist.

---

## 11. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
