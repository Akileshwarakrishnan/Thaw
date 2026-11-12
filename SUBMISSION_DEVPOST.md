# 🏆 THAW — Official Devpost Submission Master Kit

> **Event:** PayPal AI Hackathon 2026  
> **Project Name:** Thaw  
> **Tagline:** Early-warning & cash-flow shield built for PayPal sellers. Know before PayPal freezes your money.  
> **Submission Deadline:** November 12, 2026 at 12:00 PM Pacific (Nov 13, 1:30 AM IST)  
> **License:** MIT Open-Source License (included in repository)  

---

## 📋 Quick Copy-Paste Devpost Form Fields

### 0. Working Demo / Hosted Application URL
* **Hosted Application / Live Demo:**
  ```text
  https://thaw-2pa8.vercel.app
  ```
* **GitHub Repository URL:**
  ```text
  https://github.com/Akileshwarakrishnan/Thaw.git
  ```
* **YouTube Video Demo:**
  ```text
  https://youtu.be/om5k2e5uxz0
  ```

### 1. Project Title & Tagline
* **Project Name:**
  ```text
  Thaw
  ```
* **Elevator Pitch / Tagline (under 60 characters):**
  ```text
  Know before PayPal freezes your merchant cash flow.
  ```
* **Extended Tagline:**
  ```text
  Early-warning hold risk intelligence and human approval-gated AI remediation for PayPal sellers.
  ```

---

### 2. Built With (Tags / Technologies)
Copy-paste these tags into the **"Built With"** field on Devpost:
```text
next.js, typescript, paypal, paypal-api, agent-toolkit, mcp, prisma, sqlite, tailwindcss, vitest, zod, gemini-api, artificial-intelligence, fintech
```

---

### 3. About the Project (Devpost Story Section)

#### 💡 Inspiration
> For e-commerce merchants relying on PayPal, cash flow is survival. Yet every month, thousands of thriving sellers wake up to a devastating automated email:
>
> *"Your account has been placed on a 21-day hold, or a rolling reserve."*
>
> Automated risk algorithms detect fulfillment delays, sudden promotional sales spikes, or rising dispute velocity—and unilaterally lock 10% to 30% of incoming revenue to protect buyers. Worse, PayPal's automated emails never explain the root causes or which specific orders triggered the freeze. Merchants cannot pay suppliers, payroll is paralyzed, and healthy businesses collapse from sudden cash-flow starvation.
>
> **We built Thaw to solve this universal merchant dilemma.**
>
> PayPal protects buyers. **Thaw protects merchants.** Our promise is simple: **Know before PayPal freezes your money.**

---

#### 🚀 What It Does
> **Thaw** is an enterprise-grade early-warning and cash-flow shield built specifically for PayPal sellers:
>
> 1. **Deterministic 6-Signal Hold Risk Proxy Engine:** Evaluates merchant telemetry on a 0–100 scale across six publicly documented PayPal underwriting triggers: Missing Carrier Tracking (weight: 25), Dispute Rate Velocity (weight: 30), Sales Velocity Spikes (weight: 20), Address Mismatch (weight: 10), Refund Velocity (weight: 10), and Impending Dispute Deadlines (weight: 5).
> 2. **Dynamic Cash-Flow Shield:** Immediately quantifies the exact financial exposure—differentiating cleared, unrestricted funds from rolling reserve vulnerability (10% Medium Risk, 30% High Risk) based on trailing 14-day sales.
> 3. **Plain-Language AI Diagnosis:** Uses structured Gemini AI to translate complex database metrics into plain English, identifying the exact offending orders and explaining why the account is drifting.
> 4. **Human Approval-Gated Action Queue:** Our AI agent proposes prioritized remediations with exact **Weight Impact Badges** (e.g., uploading tracking removes `-6 points` directly). Following strict FinTech guardrails, zero money and zero tracking moves without explicit merchant approval.
> 5. **Instant Remediation via PayPal Agent Toolkit:** When approved, actions are dispatched through the PayPal Agent Toolkit (@paypal/agent-toolkit MCP) to PayPal's live Shipment Tracking and Disputes APIs, immediately reducing risk score and unlocking held reserves.
> 6. **Pre-Promotion Flash Sale Simulator:** Allows merchants to simulate upcoming marketing spikes (e.g., 2.5x holiday velocity) and generate underwriting pre-notification packets to prevent automated velocity freezes.
> 7. **100% Real PayPal Sandbox Proof Suite:** Executes an authentic 5-step verification cycle across PayPal's official REST APIs (Orders, Shipment Tracking, Payments Refund, Disputes, and Webhook signature verification).

---

#### 🛠️ How We Built It
> - **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Statsig-inspired clean design system, dynamic SVG risk gauge, and Geist typography.
> - **Backend & Risk Core:** Next.js API Routes running a pure deterministic mathematical model for risk scoring (math is 100% code-gated, never hallucinated by AI).
> - **AI Intelligence:** Gemini 1.5 Flash server-side with strict **Zod schema validation** for structured JSON output (`RiskExplanationSchema`, `ProposedActionItemSchema`, `DisputeAppealSchema`).
> - **Database & Audit Trail:** Prisma ORM with SQLite (local) and PostgreSQL (production), featuring immutable SHA-256 audit logs and unique constraint idempotency.
> - **PayPal Integration:** Live PayPal Sandbox REST APIs paired with `@paypal/agent-toolkit` (Model Context Protocol).
> - **Test Suite:** Vitest running 21 automated unit and integration tests with 100% passing coverage.

---

#### 🛡️ Challenges We Ran Into
> 1. **Preventing AI Hallucinations in Financial Operations:** We refused to let an LLM calculate risk scores or blindly transfer funds. We solved this by creating a strict architectural separation: the risk score and database mutations are 100% deterministic code. The AI is used exclusively for plain-language translation, legal appeal drafting, and action proposal.
> 2. **Human-in-the-Loop Safety Guardrails:** Ensuring actions can never be triggered accidentally or twice. We engineered database idempotency locks, refund balance cap safeguards, and an immutable audit trail.
> 3. **Real vs. Simulated Transparency:** To provide complete honesty for judges, every order and action displays a visible **🟢 LIVE SANDBOX** or **🟡 SIMULATED** telemetry badge.

---

#### 🏆 Accomplishments That We're Proud Of
> - **21/21 Automated Tests Passing:** Complete test coverage across risk math, idempotency, refund limits, foreign key integrity, and PayPal Sandbox proof.
> - **Zero Overlays / Clean Presentation:** Rebuilt our demo video to show 100% authentic application screen recordings with an articulate South Indian English voiceover.
> - **Zero-Setup Demo Mode:** Judges can test all 3 scenarios (`Healthy`, `Drifting`, `Post-Spike`) in their browser with zero configuration or API keys required.
> - **1-Click Remediation Feedback Loop:** Approving an action immediately uploads tracking to PayPal and triggers real-time score reduction in front of the judge's eyes.

---

#### 📚 What We Learned
> - The exact mathematical mechanics of PayPal's merchant underwriting policies, Seller Protection §3 requirements, and defect rate thresholds (1.5% dispute ceiling).
> - How to build agentic workflows using the Model Context Protocol (MCP) and `@paypal/agent-toolkit`.
> - How to build FinTech UX that feels trustworthy, spacious, and calming using the Statsig design system.

---

#### 🔮 What's Next for Thaw
> - **Direct Buyer Inquiry Ingestion:** Resolve customer questions before they turn into official dispute defects.
> - **Official PayPal Underwriting Integration:** Automatically submit verified logistics packets directly to PayPal underwriting for instant rolling reserve release.
> - **Multi-Account Merchant Shield:** Unified cash-flow protection across multiple PayPal merchant accounts for enterprise sellers.

---

#### ⚠️ Honest Limitation Statement
> **PayPal's actual underwriting risk models are strictly proprietary.**  
> Thaw is an intelligent early-warning proxy engineered from publicly documented triggers, dispute velocity policies, and merchant protection guidelines. It is not an internal replica of PayPal's private risk algorithms.

---

## 🖼️ Project Media: Image Gallery (3:2 Ratio, 1800×1200)

Devpost allows up to 15 images in JPG, PNG, or GIF format (5 MB max per file, 3:2 ratio).  
We have generated **9 high-definition, pixel-perfect 3:2 ratio screenshots** in `public/devpost-gallery/`. Upload these files directly to the Devpost **Image gallery**:

| # | Image File | Suggested Devpost Caption | File Size |
|---|---|---|---|
| **1** | `public/devpost-gallery/01-thaw-hero-overview.png` | **Thaw Overview:** Early-warning & cash-flow shield with active scenario selector | 239 KB |
| **2** | `public/devpost-gallery/02-risk-gauge-cash-flow-shield.png` | **Hold Risk Gauge & Cash-Flow Shield:** 63/100 Medium Risk with $303 rolling reserve exposure | 247 KB |
| **3** | `public/devpost-gallery/03-ai-risk-diagnosis.png` | **AI Risk Diagnosis:** Plain-language breakdown of missing tracking, dispute velocity & address mismatches | 240 KB |
| **4** | `public/devpost-gallery/04-action-queue-weight-badges.png` | **Action Queue:** Prioritized remediations featuring deterministic Weight Impact Badges (-6 pts) | 240 KB |
| **5** | `public/devpost-gallery/05-action-executed-score-drop.png` | **Hero Moment:** Human approval-gated dispatch drops risk from 63 to 57 in real-time | 235 KB |
| **6** | `public/devpost-gallery/06-paypal-sandbox-5-step-proof.png` | **Sandbox Telemetry Suite:** Real 5-step verification across PayPal REST APIs | 343 KB |
| **7** | `public/devpost-gallery/07-pre-promotion-simulator.png` | **Pre-Promotion Simulator:** Flash sale 2.5x velocity model & underwriting defense packet | 273 KB |
| **8** | `public/devpost-gallery/08-auto-drafted-dispute-appeal.png` | **Legal Dispute Drafter:** Auto-drafted evidence under PayPal Seller Protection Policy §3 | 272 KB |
| **9** | `public/devpost-gallery/09-orders-underwriting-ledger.png` | **Orders Ledger:** Real-time tracking verification and Seller Protection compliance status | 286 KB |

---

## 🎬 Demo Video Details

* **Live YouTube URL:** [https://youtu.be/om5k2e5uxz0](https://youtu.be/om5k2e5uxz0)
* **Local Master File:** `public/thaw-demo-video.mp4`
* **Duration:** 3 minutes 48 seconds (1080p Full HD)
* **Voiceover:** South Indian English Narration (`en-IN-PrabhatNeural`)
* **Subtitles:** Line-by-line synchronized captions burned into video + master `.srt` file included

Paste this URL into the **"Video Demo"** field on Devpost:
```text
https://youtu.be/om5k2e5uxz0
```

---

## 🧪 Testing Instructions for Judges

Judges can test the full application locally in under 2 minutes:

```bash
# 1. Clone repository
git clone https://github.com/Akileshwarakrishnan/Thaw.git
cd Thaw

# 2. Install dependencies
npm install

# 3. Seed database to default "Drifting" scenario (63/100 risk score)
npm run seed

# 4. Start local development server
npm run dev
```

### 2-Minute Judge Evaluation Walkthrough:
1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. **Observe the Risk Gauge:** Notice the Hold Risk score of **63/100** (Medium Risk) and the **Cash-Flow Shield** showing **$303.40 at risk** (10% rolling reserve).
3. **Review AI Diagnosis:** Scroll down to the AI Risk Diagnosis panel to view the plain-English breakdown of missing tracking and rising disputes.
4. **Execute Hero Remediation:** In the Action Queue, click **"Approve & Execute"** on the first action (`Upload Proof of Shipment for Order #5O987112001`). Notice:
   - The green dispatch alert banner appears (*"Remediation dispatched to PayPal successfully · Dropped 6 points"*).
   - The Risk Gauge drops dynamically from **63 ➔ 57 / 100**.
   - Held reserve funds update in real time.
5. **Verify Real PayPal Sandbox APIs:** Click **"Verify Sandbox Proof"** in the top navbar to inspect the 5-step verification cycle (Orders, Tracking, Refunds, Disputes, and Webhook signature verification).
6. **Test Marketing Spike Simulator:** Click the **"Pre-Promotion Simulator"** tab to simulate a 2.5x flash sale velocity increase (+18 pts risk) and preview the underwriting documentation packet.
7. **Run Automated Test Suite:** In your terminal, run:
   ```bash
   npm test
   ```
   All **21 unit and integration tests** will pass with green checkmarks.

---

## ✅ Pre-Submission Final Verification Checklist

- [x] Project runs locally without errors (`npm run dev`)
- [x] All 21 Vitest tests passing (`npm test`)
- [x] Database seeded to clean Drifting scenario (`npm run seed`)
- [x] Demo video rendered in 1080p Full HD (`public/thaw-demo-video.mp4`)
- [x] South Indian English voiceover active
- [x] Zero overlapping templates or AI-slop visual boxes
- [x] In-app video player & download modal operational
- [x] Open-source MIT License present in root (`LICENSE`)
- [x] Clean Git commit history conceiving project after Oct 1, 2026
- [x] Honest limitation clearly stated across README, UI, and video
