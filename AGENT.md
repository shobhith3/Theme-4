# AGENTS.md — ProcureIQ Final Product Build Instructions

You are building **ProcureIQ**, a final deploy-ready procurement intelligence platform for multi-branch businesses.

The full source of truth is the PRD:

`ProcureIQ_Complete_PRD_v2.2_Updated.docx`

This AGENTS.md is designed from the PRD for **final product development**, not only a hackathon MVP.

---

## 0. Prime Directives

1. **Build the final product, not only a demo.**
   - Do not reduce the product to a hackathon-only hero path.
   - Do not skip production-critical features permanently.
   - The app must become backend-driven, authenticated, secure, auditable, and deploy-ready.

2. **The PRD is the source of truth.**
   - If any older hackathon or MVP instruction conflicts with this file, this file and the PRD win.
   - Appendix C / hackathon instructions may be used only for demo sequencing, not final scope reduction.

3. **The product is not a dashboard. It is a procurement decision engine.**
   - Every major workflow must support the loop:
   - `Data → Stock Ledger → Forecast → Risk Detection → Decision Recommendation → AI Explanation → Manager Approval → PO / Transfer Execution → Outcome Learning`

4. **No fake AI.**
   - Structured forecasting, risk rules, option scoring, and approval rules decide the recommendation.
   - The LLM explains structured decisions; it must not blindly decide quantities, risk levels, or procurement actions.

5. **No direct stock mutation.**
   - Every stock change must create a `StockTransaction`.
   - `currentStock` is only a cached projection updated inside the same transaction as the ledger write.

6. **Every visible action must work.**
   - Buttons must navigate, open a modal, call an API, update state, create a record, apply a filter, export data, or show a permission/validation message.
   - No dead buttons, fake dropdowns, broken routes, or static-only workflows.

7. **Every business action must be secure and auditable.**
   - Every API must validate session, organization access, branch access, role permission, and object ownership.
   - Every approval, stock movement, PO, transfer, import, rule change, and rejection must create an audit/activity trail.

---

## 1. Product Definition

ProcureIQ is an **exception-based procurement intelligence platform**.

It monitors:

- inventory
- demand
- suppliers
- branches
- transfers
- purchases
- expiry
- wastage
- stock movements
- purchase orders
- transfer orders
- forecast signals
- manager overrides

It recommends the best action:

- Purchase Only
- Transfer Only
- Hybrid Replenishment
- Wait / Monitor
- Change Supplier
- Substitute Item
- Reject / No Action

Main promise:

> ProcureIQ monitors thousands of inventory items in the background and shows managers only the procurement decisions that matter today.

Strong pitch line:

> Most inventory tools show what stock exists. ProcureIQ shows what decision needs to be made.

---

## 2. Final Product Scope

The final product must include:

1. Authentication
2. Signup, login, forgot password, onboarding
3. Organization setup
4. Branch management
5. Role-based access control
6. Protected routes
7. Backend API layer
8. PostgreSQL database
9. Prisma schema and migrations
10. Stock ledger as source of truth
11. Stock reservation model
12. Inventory intake workflows
13. Forecasting engine
14. Risk detection engine
15. Decision scoring engine
16. AI explanation layer
17. AI assistant with scoped data access
18. Supplier intelligence
19. Transfer feasibility engine
20. Guided decision review
21. Approval execution workflow
22. Purchase order lifecycle
23. Transfer lifecycle
24. Reports and outcome tracking
25. Notifications
26. Global search
27. Command palette
28. Invoice and CSV file intake
29. Audit logs
30. Server-side authorization
31. Input validation
32. Security hardening
33. Deployment configuration
34. Monitoring and error logging
35. QA and acceptance testing

Do not treat these as optional roadmap items unless explicitly marked as a later phase by the product owner.

---

## 3. Recommended Tech Stack

Use the PRD-aligned stack unless explicitly changed by the team.

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts for forecast/scenario charts

### Backend

- Next.js API routes, server actions, or NestJS/Express if separated
- Server-side service layer for all mutations
- No direct database writes from UI components

### Database

- PostgreSQL
- Prisma ORM
- Prisma migrations
- Seed scripts for demo and development data

### Authentication

Choose one real auth option:

- Clerk
- Supabase Auth
- Auth.js / NextAuth

For local demo only, seeded demo users are allowed, but final production must use secure auth.

### Storage

- Supabase Storage or S3 for invoices, CSV uploads, exports, and PO PDFs

### AI

- OpenAI API or Anthropic API for explanation and assistant layer
- Internal deterministic rule/forecast/scoring engine for actual decisions

### Background Jobs

- Cron jobs or queue worker for scheduled risk scans, forecast runs, notifications, reconciliation, and stale-decision expiry

### Monitoring

- Sentry or equivalent
- Server logs
- Job health tracking

---

## 4. Architecture Rules

1. Use a service-layer architecture.
   - API routes call services.
   - Services own validation, authorization, transactions, and database writes.

2. All queries must be organization-scoped.
   - Every table that belongs to an organization must include `organizationId`.
   - Never return data across organizations.

3. All branch-specific queries must respect branch access.
   - Regional Manager may access multiple branches.
   - Branch Manager and Inventory Staff may access only assigned branches.

4. Every `:id` endpoint must perform object-level authorization.
   - Check that the object belongs to the caller's organization.
   - Check that the branch is within the caller's branch scope.
   - Prevent IDOR/BOLA issues.

5. Every mutation must be transaction-safe.
   - Stock updates and ledger writes happen in the same database transaction.
   - Approval creating PO/Transfer/Activity/Notification happens in a controlled transaction.

6. The decision engine must be pure where possible.
   - Math modules must not directly call the database or LLM.
   - They receive structured input and return structured output.

---

## 5. Required Database Domains

Implement these domains in Prisma.

### Auth / Organization

- Organization
- User
- OrganizationMember
- Role
- Permission
- BranchAccess
- Invite
- Session / provider mapping if needed

### Branches

- Branch
- BranchSettings

### Inventory

- InventoryItem
- BranchInventory
- InventoryBatch
- StockTransaction
- StockReservation

### Suppliers

- Supplier
- SupplierItem
- SupplierPerformance
- SupplierDeliveryHistory
- SupplierPriceHistory

### Decisions

- ProcurementDecision
- DecisionOption
- BatchApprovalGroup
- DecisionSnapshot

### Purchasing

- PurchaseOrder
- PurchaseOrderItem
- PurchaseReceipt
- PurchaseReceiptItem

### Transfers

- TransferOrder
- TransferOrderItem
- TransferDispatch
- TransferReceipt

### Forecasting

- Forecast
- ForecastRun
- ForecastInputSnapshot
- ConsumptionHistory
- ScenarioRun

### Rules

- AutoApprovalRule
- ApprovalPolicy

### Operations

- StockIntakeRecord
- AuditRecord
- ActivityLog
- Notification
- OutcomeRecord

### Files

- FileRecord
- InvoiceUpload
- CSVImport
- ExportRecord

---

## 6. Authentication and Access Control

Build authentication before advanced workflows.

Required pages:

- `/login`
- `/signup`
- `/forgot-password`
- `/onboarding`
- `/unauthorized`

Required app behavior:

- Logged-out users are redirected to `/login`.
- Logged-in users without permission are redirected to `/unauthorized` or shown a disabled action with reason.
- Session persists after refresh.
- Logout clears session and redirects to login.
- Profile menu works.
- Branch selector respects branch access.

Required roles:

- Owner
- Admin
- Regional Manager
- Branch Manager
- Inventory Staff
- Viewer

Permission rules:

- Owner: full access.
- Admin: manage users, inventory, suppliers, POs, transfers, rules, reports.
- Regional Manager: approve decisions, manage suppliers, view reports, create POs/transfers across assigned branches.
- Branch Manager: approve branch decisions, stock intake, POs, transfers, receiving for assigned branch.
- Inventory Staff: receive stock, audits, wastage, view inventory; cannot approve high-value decisions.
- Viewer: read-only.

Backend must enforce permissions. Frontend-only hiding is not enough.

---

## 7. Stock Ledger Requirements

The ledger is the trust layer.

Rule:

> No stock number exists without transaction history.

`BranchInventory.currentStock` is a cached projection. The ledger is the source of truth.

Every stock movement must create a `StockTransaction`.

Transaction types:

- opening_stock
- receive_stock
- po_receipt
- sales_consumption
- transfer_in
- transfer_out
- manual_adjustment
- wastage
- expiry
- damage
- return

Every transaction must include:

- organizationId
- itemId
- branchId
- quantity
- unit
- direction
- transactionType
- referenceType
- referenceId
- reason
- notes
- createdBy
- createdAt
- balanceAfter

Rules:

- Never mutate `currentStock` without a matching `StockTransaction`.
- Compute `balanceAfter` inside the transaction.
- Reconciliation job must verify ledger sum equals current stock.
- Stock movements must create ActivityLog records.

---

## 8. Stock Reservation Model

Recommended or pending stock must not be accidentally consumed by another action.

Implement:

- `reservedStock` on `BranchInventory` or separate `StockReservation` table.
- Available stock = `currentStock - reservedStock`.
- Reserve donor stock when a transfer recommendation is accepted or pending dispatch.
- Release reservation on rejection, cancellation, expiry, or completion.
- Audit every reservation and release.

---

## 9. Stock Intake Center

Build `/stock-intake` with working workflows:

1. Receive from Supplier
2. Add New Item / Opening Stock
3. Upload Invoice
4. Import CSV / Excel
5. Transfer from Branch
6. Stock Count / Audit Correction
7. Record Wastage / Expiry / Damage

Every flow must:

- validate input
- call backend service/API
- create ledger transaction where stock changes
- update inventory
- create activity log
- create notification where relevant
- persist data
- show success/error states

Perishable items must require expiry/batch data during receiving.

---

## 10. Forecasting Engine

Forecasting must be real, transparent, and based on data.

Initial deterministic forecasting is acceptable.

Inputs:

- historical sales/consumption
- current stock
- safe stock
- reserved stock
- expired/damaged stock
- incoming POs
- incoming transfers
- supplier lead time
- day-of-week patterns
- trend
- seasonality/festival adjustment
- wastage history
- forecast error history

Outputs:

- expected daily demand
- usable stock
- stock cover
- time to breach
- risk level
- confidence score

Base formula:

```txt
expectedDailyDemand = baseDemand × dayOfWeekFactor × trendFactor × seasonalFactor
usableStock = currentStock - reservedStock - expiredOrDamagedStock + confirmedImmediateIncoming
stockCover = usableStock / expectedDailyDemand
timeToBreach = (usableStock - safeStock) / expectedDailyDemand
```

Confidence should consider:

- days of history
- demand volatility
- recent anomalies
- cold-start item status
- past forecast error

---

## 11. AI Brain and Decision Engine

The AI brain has layers:

1. Data Layer
2. Data Normalization
3. Stock Ledger Context
4. Forecasting Engine
5. Risk Detection Engine
6. Option Generator
7. Decision Scoring Engine
8. Rules + Approval Engine
9. LLM Explanation Layer
10. Manager Action
11. Outcome Learning

LLM rule:

> The LLM explains. The deterministic engine decides.

The LLM must not invent quantities, suppliers, risk levels, or actions.

The decision engine must generate options:

- Purchase Only
- Transfer Only
- Hybrid Replenishment
- Wait / Monitor
- Change Supplier
- Substitute Item

For every option, calculate:

- urgency fit
- risk reduction
- revenue protection
- supplier reliability
- transfer feasibility
- cost efficiency
- overstock risk
- expiry risk
- donor branch risk
- net business impact
- final score

Store each score component so the UI can show why an option won.

---

## 12. Transfer Feasibility Engine

Transfers must not be recommended blindly.

Check:

- source branch stock
- source safe stock after transfer
- destination shortage
- distance
- travel time
- transport cost
- cold storage requirement
- perishability
- expiry risk
- urgency window
- local purchase cost
- supplier lead time

A transfer is feasible only if:

- source branch remains safe unless manager override is allowed
- travel time fits urgency
- cost makes sense
- cold-chain risk is acceptable
- transfer meaningfully reduces shortage
- transfer does not create another branch shortage

Output:

- feasible
- recommendation
- transferScore
- riskLevel
- blockingReasons
- supportingReasons
- reasonSummary

---

## 13. Supplier Intelligence

Supplier recommendations must not choose only the cheapest supplier.

Track:

- supplier name
- items supplied
- categories supplied
- branch coverage
- average lead time
- on-time delivery rate
- fulfillment rate
- quality score
- partial deliveries
- late deliveries
- average price
- price trend
- return/replacement issues
- minimum order quantity

Supplier scoring should consider:

- reliability
- speed
- quality
- fulfillment
- price
- urgency
- branch coverage
- MOQ

For urgent decisions, reliability and speed weigh more than price.

---

## 14. Guided Decision Review

Build a guided review for every procurement decision.

Steps:

1. Understand Risk
2. Compare Options
3. Approve Action

Step 1 must show:

- item
- branch
- current stock
- safe stock
- usable stock
- stock cover
- time to breach
- revenue at risk
- confidence
- risk drivers

Step 2 must show:

- Purchase Only
- Transfer Only
- Hybrid
- Wait / Monitor
- Change Supplier if applicable
- score breakdown for each option
- why the recommended option won

Step 3 must show:

- exact purchase quantity
- exact transfer quantity
- supplier
- source/destination branch
- expected delivery/arrival
- cost
- approval effects

Actions:

- Approve Strategy
- Modify Quantities
- Reject Recommendation
- Mark as Monitored

Approve must create actual execution records.

---

## 15. Approval-to-Execution Workflow

Approval must not only change a badge.

When a decision is approved:

- update decision status
- create purchase order if purchase quantity > 0
- create transfer order if transfer quantity > 0
- reserve stock if needed
- create activity log
- create notification
- link all records back to decision
- persist all changes

When manager modifies:

- validate quantities
- store override reason
- recalculate plan
- create activity log

When manager rejects:

- require reason
- release reservations
- store rejection for outcome learning
- create activity log

---

## 16. Purchase Order Lifecycle

Statuses:

- Draft
- Sent
- Confirmed
- Partially Received
- Received
- Cancelled

Actions:

- Create Order
- Open PO
- Send
- Mark Confirmed
- Receive Stock
- Cancel
- Export PO
- Download PDF
- Send Message

Receive Stock must:

- support partial receipt
- require expiry for perishables
- create `po_receipt` transaction
- increase inventory
- update ledger
- update PO received quantities
- update PO status
- create activity log
- create notification

---

## 17. Transfer Lifecycle

Statuses:

- Draft
- Approved
- Dispatched
- In Transit
- Received
- Cancelled

Actions:

- Create Transfer
- Open Transfer
- Dispatch
- Receive
- Cancel
- View Ledger
- View Source Branch
- View Destination Branch

Dispatch must:

- validate source stock
- create `transfer_out` transaction
- reduce source stock
- update transfer status
- create activity log

Receive must:

- create `transfer_in` transaction
- increase destination stock
- update transfer status
- create activity log

---

## 18. Reports and Outcome Tracking

Reports:

- Revenue at Risk Trend
- Stockout Avoided
- Waste Avoided
- Supplier Performance
- Auto-Approval Summary
- Forecast Accuracy
- Purchase Spend
- Transfer Savings

Outcome records must track:

- predicted demand
- actual demand
- forecast accuracy
- stockout avoided
- waste avoided
- revenue protected
- supplier delivered on time
- manager accepted/rejected/modified
- manual override reason

Reports must support:

- date filter
- branch filter
- category filter
- supplier filter
- status filter
- export CSV
- view details

---

## 19. Notifications, Search, and AI Assistant

### Notifications

Notification bell must support:

- unread count
- dropdown
- mark as read
- mark all as read
- click to related record

Notification types:

- decision needs review
- decision approved
- PO created
- PO confirmed
- stock received
- transfer dispatched
- transfer received
- supplier delay risk
- low stock warning
- audit required

### Global Search

Search across:

- items
- suppliers
- branches
- decisions
- purchase orders
- transfers
- reports

Clicking a result must navigate to the correct record.

### Command Palette

Ctrl+K actions:

- Open Today’s Decisions
- Search Inventory
- Receive Stock
- Create Purchase Order
- Create Transfer
- Open Chicken Breast Decision
- Open FreshRoute Foods
- Open Stock Intake

### AI Assistant

The assistant must answer using current organization-scoped data.

It must not make unsupported claims.

Suggested questions:

- Why is Chicken Breast critical?
- Which supplier is best for Chicken Breast?
- What decisions need review today?
- What items are expiring soon?
- Which transfers are in transit?
- Why was hybrid recommended?

---

## 20. API Requirements

Every frontend action must call a real backend function/API.

Required API groups:

### Auth

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `POST /api/auth/invite`
- `POST /api/auth/forgot-password`

### Inventory

- `GET /api/inventory`
- `GET /api/inventory/:id`
- `POST /api/inventory/items`
- `PATCH /api/inventory/:id`

### Stock

- `POST /api/stock/receive`
- `POST /api/stock/adjust`
- `POST /api/stock/wastage`
- `GET /api/stock/ledger`

### Decisions

- `GET /api/decisions`
- `GET /api/decisions/:id`
- `POST /api/decisions/:id/approve`
- `POST /api/decisions/:id/reject`
- `POST /api/decisions/:id/modify`
- `POST /api/decisions/:id/monitor`

### Purchase Orders

- `GET /api/purchase-orders`
- `POST /api/purchase-orders`
- `POST /api/purchase-orders/:id/send`
- `POST /api/purchase-orders/:id/confirm`
- `POST /api/purchase-orders/:id/receive`
- `POST /api/purchase-orders/:id/cancel`
- `GET /api/purchase-orders/:id/export`

### Transfers

- `GET /api/transfers`
- `POST /api/transfers`
- `POST /api/transfers/:id/dispatch`
- `POST /api/transfers/:id/receive`
- `POST /api/transfers/:id/cancel`

### Suppliers

- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/suppliers/:id`
- `GET /api/suppliers/:id/performance`

### Forecasts

- `POST /api/forecast/run`
- `GET /api/forecast/:itemId`
- `POST /api/forecast/scenario`

### AI

- `POST /api/ai/analyze-risk`
- `POST /api/ai/explain-decision`
- `POST /api/ai/assistant`

### Reports

- `GET /api/reports/overview`
- `GET /api/reports/details`
- `GET /api/reports/export`

### Notifications

- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`

---

## 21. Security Requirements

Security is mandatory for final product.

Implement:

- real authentication
- backend-enforced RBAC
- branch-level access
- organization isolation
- object-level authorization
- server-side validation
- input sanitization
- secure file upload validation
- API rate limiting where needed
- secret management through environment variables
- safe error handling
- audit logs
- AI prompt-injection defense
- CSV formula-injection defense
- session revocation after role changes

Never expose API keys in frontend.

Never allow users to access another organization’s data.

Never rely only on frontend permissions.

---

## 22. Deployment Requirements

Production deployment must include:

- Vercel or approved hosting
- production PostgreSQL database
- Prisma migrations applied
- auth provider configured
- file storage configured
- AI API key configured
- environment variables documented
- seed data for demo org
- monitoring/logging
- database backup/export strategy
- error boundary and safe error states
- production QA checklist completed

---

## 23. Build Phases

Build in phases. Do not jump randomly.

### Phase 1 — Foundation

Definition of Done:

- project runs cleanly
- database connected
- Prisma schema created
- migrations work
- seed data works
- auth pages exist
- protected routes work
- roles and branch access exist

### Phase 2 — Inventory and Ledger

Definition of Done:

- inventory loads from database
- stock intake flows create ledger entries
- current stock updates transactionally
- ledger explains stock quantities
- audit correction and wastage work

### Phase 3 — Forecasting and Decision Engine

Definition of Done:

- forecast uses historical consumption
- risk levels are calculated
- decision options are generated
- score breakdown is stored
- D-2048 hero decision is generated from data

### Phase 4 — Guided Decision and Execution

Definition of Done:

- decision review shows risk math
- options are compared
- approve creates PO/transfer
- reject stores reason
- modify recalculates
- activities and notifications are created

### Phase 5 — Suppliers and Transfers

Definition of Done:

- supplier performance is visible
- supplier comparison works
- transfer feasibility is calculated
- dispatch/receive update ledger

### Phase 6 — Reports, Search, Assistant

Definition of Done:

- reports use real data
- outcome tracking works
- export CSV works
- notifications work
- global search works
- Ctrl+K works
- AI assistant answers with scoped data

### Phase 7 — Security, QA, Deployment

Definition of Done:

- all protected routes tested
- permissions tested
- object-level auth tested
- no dead buttons
- no 404 routes
- no console errors
- production env configured
- deployment succeeds
- QA checklist completed

---

## 24. Demo Seed Data Requirements

Seed data must include:

Branches:

- Hyderabad Central
- Warangal Hub
- Siddipet Main

Users:

- Rohit — Regional Manager
- Sanjay — Branch Manager
- Kavya — Inventory Staff
- Viewer User — Viewer

Items:

- Chicken Breast
- Paneer
- Tomatoes
- Basmati Rice
- Milk
- Wheat Flour
- Cooking Oil
- French Fries
- Frozen Peas
- Mineral Water
- Soft Drinks
- Takeaway Boxes
- Paper Cups
- Dishwash Liquid
- Sanitizer
- Curd

Suppliers:

- FreshRoute Foods
- Deccan Traders
- Warangal Agri Co-op
- Sri Lakshmi Provisions
- Telangana Fresh Farms

Hero decision:

- Decision ID: D-2048
- Item: Chicken Breast
- Branch: Hyderabad Central
- Current stock: 8 kg
- Safe stock: 15 kg
- Stock cover: 0.7 days
- Time to breach: 46 hours
- Revenue at risk: ₹33,600
- Recommended action: Hybrid Replenishment
- Transfer: 18 kg from Warangal Hub
- Purchase: 22 kg from FreshRoute Foods
- Supplier reliability: 96%

Seed ledger must prove current stock = 8 kg.

---

## 25. QA Acceptance Criteria

Before final release, verify:

- login/signup/logout work
- protected routes redirect properly
- roles and branch access work
- dashboard loads real data
- every visible button works
- inventory table loads
- stock intake updates ledger
- audit correction works
- wastage works
- decision review opens
- score breakdown is visible
- approve creates PO/transfer
- PO receive updates inventory and ledger
- transfer dispatch/receive updates inventory and ledger
- supplier comparison works
- forecast scenario works
- reports filter and export real data
- notifications work
- global search works
- command palette works
- AI explanation uses structured data
- AI assistant is scoped to organization data
- no broken routes
- no console errors
- data persists after refresh
- deployment environment is configured

---

## 26. Working Agreement for Builder Agents

At the start of every work session, state:

- current phase
- definition of done
- files you will touch
- tests you will run

At the end of every work session, report:

- what was implemented
- what commands were run
- test output
- known issues
- whether the phase definition of done is complete

Never claim something works without running it.

Do not move to the next phase with a broken build.

Do not refactor unrelated parts unless required.

Do not remove final-product requirements to make the build look complete.

---

## 27. Final Product Standard

ProcureIQ is complete only when it works as:

`Data → Analysis → Decision → Approval → Execution → Learning`

The product must not be only a nice dashboard.

It must be a backend-driven procurement intelligence platform where:

- data is trusted
- stock is ledger-backed
- recommendations are explainable
- approvals create execution records
- outcomes are measured
- users and branches are permission-protected
- every visible action works
