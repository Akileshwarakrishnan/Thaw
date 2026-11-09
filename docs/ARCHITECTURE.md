# Thaw Architecture & Technical Specification

## 1. High-Level Architecture Overview

Thaw is designed with a strict separation of concerns between deterministic underwriting computation and generative AI explanation/drafting:

```
+-------------------------------------------------------------------------+
|                       Presentation Layer (Next.js 14)                   |
|  - App Router: app/page.tsx, layout.tsx, globals.css                    |
|  - Visual Gauge, Cash-Flow Shield, Signal Meters, Action Queue          |
|  - Orders Ledger, Pre-Promotion Simulator, Audit Trail                  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                    API & Orchestration Layer (Next.js Route Handlers)   |
|  - GET  /api/risk               -> Latest snapshot, score & cash-flow   |
|  - POST /api/risk/recompute     -> Manual recomputation trigger         |
|  - GET  /api/explanation        -> AI diagnosis & top factors           |
|  - GET  /api/actions            -> Ranked action queue                  |
|  - POST /api/actions/:id/approve-> Gated action execution               |
|  - POST /api/actions/:id/reject -> Mark rejected                        |
|  - POST /api/appeal             -> AI dispute rebuttal generator        |
|  - POST /api/demo/scenario      -> Switch Healthy/Drifting/Post-Spike   |
|  - POST /api/webhooks/paypal    -> Webhook receiver & idempotency check |
+------------------+-----------------+-------------------+----------------+
                   |                 |                   |
                   v                 v                   v
+-----------------------+ +--------------------+ +------------------------+
| Deterministic Engine  | | Generative AI      | | Action Executor &      |
| (Pure TypeScript)     | | (Server-Side LLM)  | | Guardrails             |
| - 6 Weighted Signals  | | - Structured Zod   | | - Approval row check   |
| - Normalization Curves| |   JSON schemas     | | - Idempotency lock     |
| - Cash-Flow Formula   | | - Plain English    | | - Refund balance cap   |
| - Zero LLM variance   | | - Fallback engine  | | - Audit event logger   |
+-----------+-----------+ +---------+----------+ +-----------+------------+
            |                       |                        |
            v                       v                        v
+-------------------------------------------------------------------------+
|                     Data & Integration Layer                            |
|  - Prisma ORM with SQLite (local/demo) or Postgres (Render deployment)  |
|  - PayPal Sandbox REST Client (Shipment Tracking, Disputes, Refunds)   |
|  - Immutable Audit Log Table (Every event recorded with actor timestamp)|
+-------------------------------------------------------------------------+
```

---

## 2. Risk Engine Mathematical Formulation

The Hold Risk Score $S \in [0, 100]$ is computed as:

$$S = \min\left(100, \max\left(0, \sum_{i=1}^{6} w_i \cdot N_i(v_i)\right)\right)$$

Where:
- $w_i$ is the fixed weight for signal $i$.
- $v_i$ is the raw metric extracted from transactions and disputes.
- $N_i(v_i) \in [0, 1]$ is the normalized risk function.

### Signal Weights and Normalization Curves

1. **Dispute Rate & Trend ($w_1 = 30$):**
   - Raw rate: $R = (\text{Disputes}_{30d} / \text{TxCount}_{30d}) \times 100$
   - $N_1 = \text{clamp}\left(\frac{R - 0.4}{1.8}, 0, 1\right)$
   - If dispute velocity is worsening vs. prior 30d, add $+0.15$ trend penalty.

2. **Missing Tracking ($w_2 = 25$):**
   - Untracked physical orders older than 3 days: $M = \text{Count}(\text{Unfulfilled}_{>3d}) / \text{Count}(\text{Total}_{>3d})$
   - $N_2 = \text{clamp}\left(\frac{M - 0.05}{0.28}, 0, 1\right)$

3. **Volume Velocity Spike ($w_3 = 20$):**
   - Velocity ratio: $V = \text{Sales}_{7d} / \text{BaselineWeekly}$
   - $N_3 = \text{clamp}\left(\frac{V - 1.2}{1.8}, 0, 1\right)$

4. **Address Mismatch ($w_4 = 10$):**
   - Orders shipped to unconfirmed addresses (voiding Seller Protection):
   - $N_4 = \text{clamp}\left(\frac{A - 0.03}{0.15}, 0, 1\right)$

5. **Refund Rate ($w_5 = 10$):**
   - Refunds divided by sales: $F = (\text{Refunds}_{30d} / \text{Sales}_{30d}) \times 100$
   - $N_5 = \text{clamp}\left(\frac{F - 3.0}{9.0}, 0, 1\right)$

6. **Dispute Deadlines ($w_6 = 5$):**
   - Disputes expiring within 48 hours without response:
   - 0 disputes = $0.0$; 1 dispute = $0.5$; $\ge 2$ disputes = $1.0$.

---

## 3. Cash-Flow Hold Estimation

PayPal's automated underwriting imposes reserves based on risk severity:
- **Low Risk ($S \le 33$):** 0% hold. Cleared balance released immediately.
- **Medium Risk ($34 \le S \le 66$):** 10% rolling reserve on the trailing 14-day sales, held for 14–21 days.
- **High Risk ($S \ge 67$):** 30% reserve hold or account limitation, held for 60–180 days.

$$\text{CashAtRisk} = \text{Sales}_{14d} \times \text{ReserveRate}(S)$$

---

## 4. Execution Guardrails

1. **Mandatory Approval Record:** The executor verifies that an `Approval` record exists with `decision = "approved"` before initiating any API call to PayPal.
2. **Idempotency Check:** Every action has an immutable `status` state machine:
   $$\text{proposed} \longrightarrow \text{approved} \longrightarrow \text{executed} \mid \text{failed}$$
   Attempting to execute an already `executed` action immediately aborts with a guardrail exception.
3. **Refund Balance Cap:** Before issuing a refund, the executor validates:
   $$\text{RequestedRefund} \le (\text{OrderAmount} - \text{RefundedAmount})$$
   Over-refunding is blocked at the application level.
4. **Immutable Audit Logging:** Every state transition, API call result, and recomputation is recorded in the `AuditLog` table with actor, timestamp, and metadata.
