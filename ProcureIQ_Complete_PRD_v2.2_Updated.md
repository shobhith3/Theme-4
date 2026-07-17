# ProcureIQ

## Complete Product Requirements Document

**Deploy-Ready Procurement Intelligence Platform**

> Product Definition<br>ProcureIQ is an exception-based procurement intelligence system for multi-branch businesses. It monitors inventory, demand, suppliers, branches, transfers, purchases, expiry, and stock movements, then recommends the best action: purchase, transfer, hybrid replenishment, monitor, or reject.


Version: 2.0 | Prepared for product build planning | Date: 17 Jul 2026

| Document Purpose | What this PRD covers |  |  |
| --- | --- | --- | --- |
| Product foundation | Problem, solution, positioning, target users, charm, uniqueness, and success metrics. |  |  |
| Deploy-ready build scope | Backend, authentication, database, APIs, stock ledger, AI brain, forecasting, security, deployment, and QA. |  |  |
| Feature requirements | Every page, button, workflow, and module required for a serious business product. |  |  |
| Missing feature tracking | Clear list of current gaps and what must be built before release. |  |  |
| P0 | Concurrency & Idempotency | Prevents double-spend of stock and duplicate orders under concurrent use. | Row locks/serializable txns, version fields, idempotency keys on all mutations. |
| P0 | Stock Reservation Model | Recommended stock can be taken before dispatch, invalidating decisions. | reservedStock field; reserve on recommendation/PO; release on reject/expiry. |
| P0 | Object-Level Authorization | Org scoping alone leaves IDOR/BOLA; #1 multi-tenant leak. | Per-object org+branch ownership check on every :id endpoint, explicitly tested. |
| P0 | Financial Correctness | Wrong costs/tax undermine the whole value proposition. | Currency, GST/tax, receipt-vs-order reconciliation, UoM conversion. |
| P1 | Decision Staleness / Expiry | Approving stale decisions executes wrong quantities. | Snapshot + re-validate at approval; expire/supersede open decisions. |
| P1 | Returns / PO Amendments | Real procurement needs RMAs and PO edits, not just create/cancel. | Supplier-return flow with credit notes; editable sent POs with audit. |
| P1 | File & AI Injection Security | Invoices/CSV and AI inputs are untrusted attack surfaces. | Magic-byte + malware validation, CSV formula-injection guard, LLM input sanitization. |
| P1 | Notification Channels | In-app bell misses time-critical breaches. | Email/SMS/WhatsApp for critical alerts; delivery tracking. |
| P1 | Audit-Log Immutability | Approvals move money/stock; logs must be trustworthy. | Append-only, tamper-evident audit store. |
| P2 | Observability / Job Health | Silent scan failure stops decisions with no signal. | Per-org job completion checks, dead-letter queue, alerting. |
| P2 | Compliance / Data Retention | PII handling under India DPDP Act. | Retention, deletion, export-on-request policies. |


# Document Map

- 1. Executive Summary

- 2. Problem Statement

- 3. Solution and Unique Value

- 4. Product Principles

- 5. Users, Roles, and Permissions

- 6. End-to-End Product Workflow

- 7. Feature Requirements by Module

- 8. Backend Architecture

- 9. Database and Data Model

- 10. API Requirements

- 11. AI Brain and Decision Engine

- 12. Forecasting Logic

- 13. Supplier and Transfer Intelligence

- 14. Security and Compliance

- 15. Deployment Readiness

- 16. QA and Acceptance Criteria

- 17. Missing Features Priority Matrix

- 18. Release Plan and Risks

# 1. Executive Summary

ProcureIQ must be built as a real deploy-ready business product, not only a visual dashboard. The core product is a procurement decision engine that turns messy inventory, branch, supplier, demand, and stock movement data into clear decisions that managers can approve and execute.

> Core Product Loop<br>Data → Stock Ledger → Forecast → Risk Detection → Decision Recommendation → AI Explanation → Manager Approval → PO / Transfer Execution → Outcome Learning


The app should not force a manager to check thousands of items manually. It should monitor everything in the background and surface only the few procurement decisions that need attention today.

> Main Product Promise<br>ProcureIQ monitors thousands of inventory items in the background and shows managers only the procurement decisions that matter today.


## 1.1 Non-Negotiable Build Direction

- Build the product foundation before doing more visual redesign.

- Every visible button must map to a real workflow, backend action, modal, route, state update, or API call.

- No fake AI labels. The AI brain must have structured forecasting, rules, scoring, and explanation layers.

- No direct inventory mutation. Every stock change must be backed by a stock ledger transaction.

- No frontend-only final state. Use a real database, backend APIs, authentication, and role-based access.

- Every business action must be auditable, permission-protected, and organization-scoped.

# 2. Problem Statement

Official problem statement:

> Problem<br>Businesses reorder inventory manually without demand forecasting or automated purchasing recommendations.


Expanded business problem:

Multi-branch businesses struggle to know what stock will run out, when it will run out, which supplier to order from, whether stock can be transferred from another branch, and which action will save the most money. Most decisions are still made manually using current stock levels, spreadsheets, phone calls, and manager experience.

| Pain Point | Business Impact |
| --- | --- |
| Late reorder | Stockout, lost sales, unhappy customers, emergency purchases. |
| Over-ordering | Blocked cash, expiry, wastage, storage pressure. |
| Wrong supplier choice | Late delivery, partial fulfillment, quality issues, higher operational risk. |
| No branch coordination | One branch has shortage while another branch holds excess stock. |
| No trusted stock history | Managers cannot verify why the system shows a certain stock quantity. |
| Too many items to review | Managers waste time checking thousands of normal items instead of urgent exceptions. |


## 2.1 Why Existing Basic Dashboards Are Not Enough

- A low-stock alert only says what is wrong; it does not decide the best action.

- A generic inventory table shows current stock, but not future risk.

- A purchase order module creates orders, but it does not know whether transfer would be faster or cheaper.

- Forecasting alone predicts demand, but it does not execute procurement decisions.

- AI chat alone can explain, but without trusted structured data it cannot be safely used for procurement decisions.

# 3. Solution and Unique Value

> Solution<br>ProcureIQ is an exception-based procurement intelligence platform that detects inventory risk, compares purchase/transfer/hybrid actions, explains recommendations with AI, and converts approvals into purchase orders or transfer orders.


## 3.1 What ProcureIQ Does

- Monitors stock, demand, suppliers, branches, expiry, purchase orders, and transfers.

- Predicts stock cover, time to breach, revenue at risk, and forecast confidence.

- Compares Purchase Only, Transfer Only, Hybrid Replenishment, Wait/Monitor, Change Supplier, and Substitute Item options.

- Uses business rules to decide what can be auto-approved and what needs manager review.

- Uses an AI explanation layer to explain the recommendation in simple business language.

- Creates purchase orders and transfer orders after approval.

- Updates inventory through ledger-backed receiving, dispatch, transfer, wastage, and audit workflows.

- Tracks outcomes so future recommendations become better.

## 3.2 Charm and Uniqueness

| Unique Angle | Explanation |
| --- | --- |
| Decision-first, not table-first | The landing page is Today’s Decisions, not a massive inventory table. |
| Exception-based workflow | The system filters 10,000 items into the few decisions requiring action. |
| Purchase vs transfer vs hybrid intelligence | The system recommends whether to buy, move stock between branches, or combine both. |
| Transfer feasibility engine | Transfers are evaluated using donor safety, distance, urgency, cost, perishability, and cold-chain risk. |
| Supplier intelligence | Recommendations use reliability, speed, fulfillment, and quality, not only cheapest price. |
| Ledger trust layer | Every stock number can be traced to stock transactions. |
| Explainable AI | AI explains the calculated decision; it does not randomly invent procurement actions. |
| Approval-to-execution loop | Approval creates PO/transfer records and tracks receiving, outcome, and accuracy. |


> Strong Pitch Line<br>Most inventory tools show what stock exists. ProcureIQ shows what decision needs to be made.


# 4. Product Principles

| Principle | Requirement |
| --- | --- |
| Simple for managers | The UI should show clear decisions, not complex analytics first. |
| Powerful behind scenes | Forecasting, risk scoring, rules, supplier logic, and transfer logic run in the engine. |
| Explainable decisions | Every recommendation must show why it was made and what data supports it. |
| Ledger-backed trust | No stock number exists without transaction history. |
| Workflow completion | A recommendation must lead to execution, not stop at an alert. |
| Role-safe operations | Users only see and do what their role/branch access allows. |
| Organization-scoped data | No cross-organization data leakage. |
| No dead UI | Every visible button must work or clearly show a permission/disabled reason. |


## 4.1 Success Metrics

- Reduction in manual reorder decisions per week.

- Reduction in stockout incidents.

- Reduction in wastage/expiry losses.

- Forecast accuracy improvement over time.

- Supplier on-time performance visibility.

- Manager decision acceptance rate.

- Time saved from exception-based review.

- Revenue protected by timely replenishment actions.

# 5. Users, Roles, and Permissions

ProcureIQ must include authentication and role-based access control. This is a major missing feature and must be implemented before calling the product deploy-ready.

| Role | Access Scope | Key Permissions |
| --- | --- | --- |
| Owner | All organization data | Full access, users, rules, branches, billing/future account controls. |
| Admin | All organization data | Manage inventory, suppliers, users, POs, transfers, rules, reports. |
| Regional Manager | Multiple/all branches | Approve decisions, manage suppliers, view reports, create POs/transfers. |
| Branch Manager | Assigned branch | Approve branch decisions, stock intake, POs, transfers, receiving. |
| Inventory Staff | Assigned branch | Receive stock, audits, wastage, view inventory; cannot approve high-value decisions. |
| Viewer | Assigned read-only scope | View dashboards, inventory, reports; cannot create/edit/approve. |


## 5.1 Authentication Requirements

- Login page: /login with email/password, forgot password, create account link.

- Signup page: /signup with organization name and business type.

- Onboarding: organization setup, branch setup, role setup, sample data option.

- Forgot password page: /forgot-password with secure reset flow.

- Unauthorized page: /unauthorized for permission failures.

- Protected routes: all app routes require valid session.

- Session persistence: refresh should not log out a valid user.

- Profile menu: profile, organization settings, switch branch, invite team, logout.

- Invite users: email, role, assigned branches, pending invite status.

# 6. End-to-End Product Workflow

> Primary Product Flow<br>Inventory and supplier data enters → Ledger records movements → Forecast engine predicts risk → Decision engine compares options → AI explains recommendation → Manager approves/modifies/rejects → System creates PO/transfer → Receiving updates inventory → Outcome is measured


## 6.1 Daily Manager Workflow

- Manager logs in and selects branch or all branches based on access.

- Command Center shows Today’s Decisions and summary cards.

- Manager reviews only exceptions: critical stock risk, supplier risk, expiry risk, low confidence, transfer opportunity.

- Manager opens a decision, understands the risk, compares options, and approves/modifies/rejects.

- Approved decisions create purchase orders and/or transfer orders.

- Inventory staff receive stock, dispatch transfers, or record wastage/audit corrections.

- Ledger updates every stock movement.

- Reports and outcomes show stockouts avoided, waste avoided, forecast accuracy, and revenue protected.

## 6.2 Example Chicken Breast Workflow

| Field | Value |
| --- | --- |
| Decision ID | D-2048 |
| Item / Branch | Chicken Breast / Hyderabad Central |
| Current stock | 8 kg |
| Safe stock | 15 kg |
| Stock cover | 0.7 days |
| Time to breach | 46 hours |
| Revenue at risk | ₹33,600 |
| Recommended action | Hybrid Replenishment |
| Transfer | 18 kg from Warangal Hub |
| Purchase | 22 kg from FreshRoute Foods |
| Supplier reliability | 96% on-time delivery |
| Manager action | Approve Strategy creates PO + Transfer Order |


# 7. Feature Requirements by Module

## 7.1 Command Center / Today’s Decisions

Purpose: the main landing page where managers see what needs attention today.

| Feature | Requirement |
| --- | --- |
| Summary Cards | Needs Review, Revenue at Risk, Auto-Approved, Waste Risk Avoided, Supplier Issues. Cards must filter/sort/open related views. |
| Decision Queue | Rows for critical/high/medium decisions sorted by priority, time to breach, and revenue at risk. |
| Review Button | Opens Guided Decision Review. Must not route to broken recommendations page. |
| Row Actions | View Forecast, View Inventory, View Supplier, Approve, Modify, Reject, Mark as Monitored. |
| Branch Context | Dashboard data changes with selected branch and user permission. |
| Recent Activities | Ledger/decision/order/transfer events show in chronological order. |


## 7.2 Guided Decision Review

- Step 1: Understand Risk — show stock, safe level, stock cover, time to breach, revenue at risk, confidence, risk drivers.

- Step 2: Compare Options — Purchase Only, Transfer Only, Hybrid, Wait/Monitor, Change Supplier if applicable.

- Step 3: Approve Action — show exact PO/transfer outputs before confirmation.

- Approve Strategy creates real execution records; it must not only change a status badge.

- Modify Quantities opens a modal, validates inputs, stores override reason, and recalculates action plan.

- Reject Recommendation requires a reason and stores rejection for outcome learning.

## 7.3 Inventory Network

| Requirement Area | Details |
| --- | --- |
| Inventory table | Item, product type, branch, current stock, safe stock, stock cover, priority, status, supplier, recommended action, last updated. |
| Filters | Search, Branch, Product Type, Priority, Status, Supplier, Expiry Window, Transfer Availability. |
| Quick views | All Inventory, Critical Now, Low Stock, Perishables, Expiring Soon, Overstock, Transfer Opportunities, Needs Audit. |
| Row actions | View Item, Update Stock, View Ledger, View Forecast, Create PO, Create Transfer, Record Wastage. |
| Item detail | Stock summary, branch-wise stock, batches/expiry, ledger, related decisions, POs, transfers. |


## 7.4 Stock Intake Center

| Flow | Required Functionality |
| --- | --- |
| Receive from Supplier | Item, branch, supplier, quantity, unit cost, date, expiry, batch, linked PO, notes. Creates batch + receive_stock transaction. |
| Add New Item | Item metadata, category, unit, safe stock, reorder level, perishable settings, branch, opening stock. Creates item + opening_stock transaction. |
| Upload Invoice | Upload or sample invoice, preview extracted items, edit values, confirm stock receipt. Store file record. |
| Import CSV/Excel | Download sample, upload, parse, validate, preview, confirm, create inventory + ledger entries. |
| Transfer from Branch | Create transfer order or instant transfer with source/destination validation. |
| Stock Count / Audit | Compare system vs actual count, require reason, create manual_adjustment transaction. |
| Record Loss | Expired/damaged/spoiled/wastage/other; reduce stock and create transaction. |


## 7.5 Stock Ledger

The ledger is the trust layer. Current stock must be derived from ledger-backed operations or updated only through transaction-backed services.

| Transaction Type | Direction | Example |
| --- | --- | --- |
| opening_stock | In | Initial stock when item/branch is created. |
| receive_stock | In | Manual supplier receipt. |
| po_receipt | In | Receiving items against a purchase order. |
| sales_consumption | Out | POS/recipe consumption or manual sales usage. |
| transfer_out | Out | Dispatch from source branch. |
| transfer_in | In | Receive into destination branch. |
| manual_adjustment | In/Out | Audit correction with reason. |
| wastage/expiry/damage | Out | Loss recording with reason and batch if applicable. |
| return | In/Out | Return to supplier/customer depending on context. |


## 7.6 Purchase Orders

- Statuses: Draft, Sent, Confirmed, Partially Received, Received, Cancelled.

- Actions: Create Order, Open PO, Send, Mark Confirmed, Receive Stock, Cancel, Export PO, Download PDF, Send Message.

- Receive Stock must support partial receipt and update PO status, inventory, ledger, activity log, and notification.

- Perishable PO receipts must require expiry date/batch details.

- POs created from decision approval must link back to ProcurementDecision.

## 7.7 Transfers

- Statuses: Draft, Approved, Dispatched, In Transit, Received, Cancelled.

- Actions: Create Transfer, Open Transfer, Dispatch, Receive, Cancel, View Ledger, View Source Branch, View Destination Branch.

- Dispatch creates transfer_out transaction and reduces source stock.

- Receive creates transfer_in transaction and increases destination stock.

- Transfer must be validated against source availability, donor safe stock, urgency, distance, travel time, transport cost, cold storage, and expiry risk.

## 7.8 Suppliers

| Supplier Requirement | Details |
| --- | --- |
| Profile | Name, categories, items supplied, branch coverage, contact details, MOQ. |
| Performance | Average lead time, on-time delivery, fulfillment rate, quality score, partial deliveries, late deliveries. |
| Commercials | Average price, price trend, return/replacement issues. |
| Actions | Add Supplier, Open Supplier, View Items Supplied, View Past Orders, Compare Supplier, Create PO. |
| Recommendation logic | Supplier selection should consider reliability/speed/quality/urgency, not only cheapest price. |


## 7.9 Reports and Outcome Tracking

- Reports: Revenue at Risk Trend, Stockout Avoided, Waste Avoided, Supplier Performance, Auto-Approval Summary, Forecast Accuracy, Purchase Spend, Transfer Savings.

- Outcome records must compare predicted demand vs actual demand, forecast accuracy, stockout avoided, waste avoided, revenue protected, supplier delivery status, and manager override reason.

- Export CSV must download real data. View Details must open detail modal/page.

- Reports must be filterable by date range, branch, item category, supplier, and status.

## 7.10 Notifications, Search, AI Assistant, Settings

| Module | Required Functionality |
| --- | --- |
| Notifications | Bell dropdown, unread count, decision/PO/transfer/stock/supplier alerts, mark as read, click opens record. |
| Global Search | Search items, suppliers, branches, decisions, POs, transfers, reports; click navigates to record. |
| Command Palette | Ctrl+K opens actions: receive stock, create PO, create transfer, open decision, open supplier. |
| AI Assistant | Side panel answers questions using current org-scoped app data; no fake generic answers. |
| Settings | Organization, branches, users/roles, auto-approval rules, data intake, reset demo data. |


# 7.11 Concurrency, Data Integrity, and Reliability (Added)

This section closes gaps that can silently corrupt stock, cause double-spending of inventory, or execute decisions against stale data. These requirements are mandatory before the ledger and approval flows can be trusted in production.

## 7.11.1 Source of Truth for Stock

> Rule<br>currentStock on BranchInventory is a cached projection. The StockTransaction ledger is the single source of truth. Every stock change writes the ledger and updates the cache inside the SAME database transaction. A periodic reconciliation job re-derives currentStock from the ledger and flags any drift.


- Never mutate currentStock without a matching StockTransaction in the same DB transaction.

- balanceAfter must be computed from a locked read of the latest balance, not a stale application-level value.

- A reconciliation job (per item/branch) verifies sum(ledger) == currentStock and raises an alert on mismatch.

## 7.11.2 Concurrency and Race Conditions

| Risk | Required Control |
| --- | --- |
| Two managers approve the same decision | Idempotency key + optimistic concurrency (version field) on ProcurementDecision; second approval is rejected, not duplicated. |
| Two branches dispatch the same donor stock | Row-level lock (SELECT ... FOR UPDATE) or serializable transaction on the source BranchInventory row during dispatch. |
| Ledger balance corruption | balanceAfter derived inside the locked transaction; concurrent writers serialize. |
| Duplicate PO/transfer from double-click or retry | Every mutation endpoint accepts an idempotency key; repeated keys return the original result. |


## 7.11.3 Stock Reservation and Allocation

> New requirement<br>BranchInventory gains a reservedStock field. When a decision recommends a transfer or a PO is pending receipt, the relevant quantity is reserved. Available stock = currentStock - reservedStock. Reservations expire if the decision is rejected or times out.


- Recommended transfers reserve donor-branch stock between recommendation and dispatch so it cannot be sold or moved elsewhere.

- Reservations are released on rejection, cancellation, or expiry, writing an audit entry.

## 7.11.4 Decision Staleness and Re-validation

- Each decision records the stock snapshot and timestamp it was computed from.

- At approval time the engine re-validates feasibility against LIVE stock; if the underlying numbers changed materially, it recomputes and asks the manager to reconfirm rather than executing stale quantities.

- Decisions expire after a configurable window. A new risk scan supersedes (does not duplicate) an open decision for the same item/branch.

## 7.11.5 Financial and Unit-Cost Integrity

- All monetary fields carry an explicit currency; PurchaseOrder and PurchaseOrderItem store unit cost, tax/GST, and computed totals.

- On receipt, actual received price and quantity are reconciled against the ordered values; variances are recorded, not silently overwritten.

- Partial receipts account cost per received quantity; totals recompute from line items.

- Unit-of-measure conversion (e.g. order in cases, stock in kg) is defined per item so cost and quantity stay consistent.

## 7.11.6 Additional Missing Workflows

| Workflow | Requirement |
| --- | --- |
| Returns to supplier / RMA | PO-linked return flow with reason, credit-note handling, and a ledger return transaction. |
| PO amendments | Edit quantity, price, or line items on a sent PO with an audit trail; not only create/cancel. |
| Multi-item PO / MOQ batching | Batch multiple item decisions into one PO to meet supplier MOQ; scoring accounts for combined order. |
| Backorder / unmet demand | Define whether stockout demand is lost or backordered; feed this into forecast-accuracy measurement. |
| Item / supplier lifecycle | Deactivate or discontinue items and suppliers while preserving history; enforce SKU/barcode uniqueness. |
| Approval delegation / escalation | Delegate or escalate approvals on absence or timeout so time-critical decisions do not stall. |
| Notification channels | Email/SMS/WhatsApp for time-critical breaches (e.g. 46-hour windows), not only the in-app bell. |
| Bulk / batch approval | Explicit eligibility rules, conflict handling, and per-item audit for batch approvals. |


## 7.11.7 Observability and Job Health

- Background jobs (daily scan, forecast run) report completion per organization; a failed or skipped run raises an alert.

- Failed jobs go to a dead-letter queue with retry; silent failure (decisions simply not appearing) must be detectable.

- Consistent timezone handling for time-to-breach and daily cutoffs across branches/regions.

# 8. Backend Architecture

Backend is one of the largest missing parts. ProcureIQ cannot be deploy-ready without real APIs, persistent database, authentication, authorization, background jobs, file storage, and AI service integration.

| Layer | Recommended Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js / React | App UI, protected routes, server actions/API integration. |
| Backend API | Next.js API routes or NestJS/Express | Business workflows, validation, database access, permissions. |
| Database | PostgreSQL | Persistent transactional data. |
| ORM | Prisma | Typed schema, migrations, queries. |
| Auth | Clerk / Supabase Auth / Auth.js | Login, sessions, password reset, invitations. |
| File Storage | Supabase Storage / S3 | Invoices, CSV uploads, PO PDFs. |
| AI Layer | OpenAI API + internal rule/forecast engine | Explanations, assistant, structured decision support. |
| Background Jobs | Cron / Queue worker | Daily scans, risk detection, forecast runs, notifications. |
| Monitoring | Sentry / logs | Error tracking and production reliability. |


## 8.1 Service Boundaries

- Auth Service: sessions, users, organization membership, permissions.

- Inventory Service: stock items, branch inventory, batches, stock transactions.

- Procurement Service: decisions, purchase orders, transfers, approvals.

- Supplier Service: supplier profile, performance, item coverage, supplier comparison.

- Forecast Service: demand prediction, stock cover, risk scoring.

- AI Service: explanation generation, assistant answers, reasoning summaries from structured data.

- Reporting Service: outcome aggregation, accuracy, savings, exports.

- Notification Service: system alerts, unread state, action links.

# 9. Database and Data Model

All core data must include organizationId where applicable. Backend queries must always be organization-scoped and permission-checked.

| Domain | Models |
| --- | --- |
| Auth / Org | Organization, User, OrganizationMember, Role, BranchAccess, Invite |
| Branches | Branch, BranchSettings |
| Inventory | InventoryItem, BranchInventory, InventoryBatch, StockTransaction |
| Suppliers | Supplier, SupplierItem, SupplierPerformance |
| Decisions | ProcurementDecision, DecisionOption, BatchApprovalGroup |
| Purchasing | PurchaseOrder, PurchaseOrderItem |
| Transfers | TransferOrder, TransferOrderItem |
| Forecasting | Forecast, ForecastRun, ForecastInputSnapshot |
| Rules | AutoApprovalRule |
| Operations | StockIntakeRecord, AuditRecord, ActivityLog, Notification, OutcomeRecord |
| Files | InvoiceUpload, FileRecord |


## 9.1 Key Model Fields

| Model | Essential Fields |
| --- | --- |
| InventoryItem | id, organizationId, name, sku, category, productType, unit, isPerishable, shelfLifeDays, coldStorageRequired, defaultSupplierId |
| BranchInventory | id, organizationId, itemId, branchId, currentStock, safeStockLevel, reorderLevel, incomingStock, status, priority, lastUpdated |
| StockTransaction | id, organizationId, itemId, branchId, quantity, unit, direction, transactionType, referenceType, referenceId, reason, balanceAfter, createdBy |
| ProcurementDecision | id, organizationId, itemId, branchId, status, priority, riskLevel, currentStock, safeStock, stockCover, timeToBreach, revenueAtRisk, confidence, recommendedAction |
| DecisionOption | id, decisionId, optionType, purchaseQty, transferQty, supplierId, sourceBranchId, cost, riskScore, netImpact, explanation |
| PurchaseOrder | id, organizationId, supplierId, branchId, status, expectedDeliveryDate, linkedDecisionId, totalAmount |
| TransferOrder | id, organizationId, sourceBranchId, destinationBranchId, status, expectedArrival, transportCost, linkedDecisionId |
| SupplierPerformance | supplierId, leadTimeAvg, onTimeRate, fulfillmentRate, qualityScore, lateDeliveries, partialDeliveries, priceLevel |
| OutcomeRecord | decisionId, predictedDemand, actualDemand, forecastAccuracy, stockoutAvoided, wasteAvoided, revenueProtected, managerAction |


# 10. API Requirements

Every frontend action must call a real backend function or API. APIs must validate input, check session, enforce permissions, scope by organization, and return clear errors.

| Area | Required Endpoints |
| --- | --- |
| Auth | POST /api/auth/login, POST /api/auth/signup, POST /api/auth/logout, POST /api/auth/invite, POST /api/auth/forgot-password |
| Inventory | GET /api/inventory, GET /api/inventory/:id, POST /api/inventory/items, PATCH /api/inventory/:id |
| Stock | POST /api/stock/receive, POST /api/stock/adjust, POST /api/stock/wastage, GET /api/stock/ledger |
| CSV/Invoice | POST /api/import/csv, POST /api/import/invoice, GET /api/import/sample-csv |
| Decisions | GET /api/decisions, GET /api/decisions/:id, POST /api/decisions/:id/approve, reject, modify, monitor |
| Purchase Orders | GET /api/purchase-orders, POST /api/purchase-orders, POST /api/purchase-orders/:id/send, confirm, receive, cancel, export |
| Transfers | GET /api/transfers, POST /api/transfers, POST /api/transfers/:id/dispatch, receive, cancel |
| Suppliers | GET /api/suppliers, POST /api/suppliers, GET /api/suppliers/:id, GET /api/suppliers/:id/performance |
| Forecasts | POST /api/forecast/run, GET /api/forecast/:itemId, POST /api/forecast/scenario |
| AI | POST /api/ai/analyze-risk, POST /api/ai/explain-decision, POST /api/ai/assistant |
| Reports | GET /api/reports/overview, GET /api/reports/details, GET /api/reports/export |
| Settings | GET/POST/PATCH/DELETE /api/rules, branches, users, roles |
| Notifications | GET /api/notifications, POST /api/notifications/:id/read, POST /api/notifications/read-all |


# 11. AI Brain and Decision Engine

> AI Principle<br>The LLM should not blindly make procurement decisions. Structured data, forecasting, scoring, and business rules generate the decision. The AI layer explains it clearly and answers manager questions.


> AI Brain Pipeline<br>Data Sources → Data Normalization → Stock Ledger → Forecasting Engine → Risk Scoring → Option Generator → Decision Scoring → Rules + Approval → LLM Explanation → Manager Action → Outcome Learning


## 11.1 AI Engine Layers

| Layer | Purpose | Output |
| --- | --- | --- |
| Data Layer | Collect inventory, sales, supplier, branch, transfer, expiry, PO, and ledger data. | Clean structured input. |
| Forecasting Layer | Predict demand, stock cover, time to breach, and confidence. | Expected demand and risk signals. |
| Risk Detection Layer | Apply rules for low stock, lead time, expiry, revenue risk, confidence, supplier risk. | Risk level and priority. |
| Option Generator | Create Purchase, Transfer, Hybrid, Monitor, Change Supplier, Substitute options. | Candidate actions. |
| Decision Scoring | Score options by urgency, cost, reliability, feasibility, revenue protection, risk. | Best recommended action. |
| Rules Engine | Decide auto-approve vs manager review based on thresholds and permissions. | Approval requirement. |
| LLM Explanation | Convert structured decision into simple business language. | Human-readable reasoning. |
| Outcome Learning | Compare predicted vs actual result after execution. | Accuracy and improvement signals. |


## 11.2 Required AI Inputs

- Current stock, usable stock, safe stock level, reorder level, unit, product type.

- Historical sales/consumption, day-of-week pattern, trend, seasonality/festival adjustment.

- Incoming purchase orders and incoming transfers.

- Expiry dates, batch quantities, wastage history, cold-storage requirement.

- Supplier lead time, on-time delivery, fulfillment rate, quality score, price, MOQ.

- Other branch stock, donor safe stock, distance, travel time, transport cost.

- Revenue per item/order, revenue at risk, margin if available.

- Auto-approval rules, budget limits, role permissions, manual override history.

## 11.3 Decision Option Scoring

Each action option receives a score out of 100. The exact weights can be tuned per business, but the first version should use a transparent deterministic scoring formula.

> Illustrative Score Formula<br>Final Score = Urgency Fit + Risk Reduction + Revenue Protection + Supplier Reliability + Transfer Feasibility + Cost Efficiency - Overstock Risk - Expiry Risk - Donor Branch Risk


| Option | Typical Meaning | When It Wins |
| --- | --- | --- |
| Purchase Only | Order required quantity from best supplier. | Supplier can deliver before risk window and transfer is not feasible. |
| Transfer Only | Move stock from another branch. | Nearby branch has excess stock and quantity covers demand. |
| Hybrid | Transfer urgent quantity and purchase remaining quantity. | Transfer is fast but incomplete; purchase covers upcoming demand. |
| Wait / Monitor | No immediate action; monitor risk. | Stock cover and confidence are acceptable. |
| Change Supplier | Use a different supplier due to speed/reliability/risk. | Default supplier is delayed, unreliable, or too expensive for urgency. |
| Substitute Item | Recommend operational substitute if item is unavailable. | Allowed substitute exists and primary item cannot be replenished in time. |


## 11.4 AI Explanation Output

The explanation layer receives a structured JSON-like decision object and returns a short business explanation. It must cite the exact data points used: current stock, safe stock, stock cover, supplier reliability, transfer feasibility, purchase quantity, transfer quantity, and business impact.

> Example Explanation<br>Chicken Breast is critical because Hyderabad Central has only 8 kg against a safe level of 15 kg. Forecasted demand gives only 0.7 days of cover, creating ₹33,600 revenue risk. ProcureIQ recommends hybrid replenishment: transfer 18 kg from Warangal Hub for immediate coverage and purchase 22 kg from FreshRoute Foods to cover upcoming demand. This balances speed, cost, and availability.


# 12. Forecasting Logic

The first production version can use deterministic forecasting. Later versions can add ML models. The important requirement is that forecasting is real, transparent, and based on data.

| Calculation | Description |
| --- | --- |
| Expected Daily Demand | Average daily demand × day-of-week factor × trend factor × seasonal/festival factor. |
| Usable Stock | Current stock minus expired/damaged/reserved stock plus confirmed immediate incoming stock if applicable. |
| Stock Cover | Usable stock / expected daily demand. |
| Time to Breach | Time until usable stock reaches safe stock or zero depending on risk type. |
| Risk Level | Critical/High/Medium/Low based on stock cover, lead time, revenue risk, and confidence. |
| Forecast Confidence | Based on data history length, demand volatility, recent anomalies, and model error. |


## 12.1 Forecast Scenario Tools

- Run Scenario: demand change percentage, supplier delay days, branch demand spike, incoming order delay.

- Change Item / Branch / Date Range: forecast data updates immediately.

- Review Decision: opens related decision review if risk exists.

- View Inventory Item: opens item detail with ledger and batches.

# 13. Supplier and Transfer Intelligence

## 13.1 Transfer Feasibility Engine

| Check | Requirement |
| --- | --- |
| Source branch safety | Source must remain above safe stock unless manager overrides with reason. |
| Destination shortage | Transfer should meaningfully reduce shortage. |
| Urgency fit | Travel time must be faster than risk window or supplier lead time. |
| Cost comparison | Transport cost should make sense against purchase/emergency cost. |
| Perishable/cold chain | Check expiry and cold storage requirements. |
| Distance/travel time | Use branch distance and estimated travel time. |
| Blocking reasons | If infeasible, show exact blocking reasons. |


## 13.2 Supplier Recommendation Engine

- Do not recommend supplier only by cheapest price.

- Use on-time delivery rate, lead time, fulfillment rate, quality score, late/partial delivery history, price level, branch coverage, and MOQ.

- For urgent decisions, reliability and speed should weigh more than price.

- Supplier comparison must show why the recommended supplier is chosen.

# 14. Security, Privacy, and Compliance Requirements

| Security Area | Requirement |
| --- | --- |
| Authentication | Use real provider or secure backend auth; no plain-text passwords; password reset flow. |
| Authorization | Backend-enforced RBAC and branch-level access checks. |
| Organization isolation | Every query and mutation scoped by organizationId. |
| Input validation | Validate all forms and API payloads server-side. |
| File validation | Validate type/size for invoices and CSV uploads; store securely. |
| Secrets | Never expose API keys in frontend; use environment variables. |
| Audit logs | Track who approved, received, dispatched, edited, rejected, imported, or changed rules. |
| Rate limiting | Protect login, AI endpoints, upload, and export endpoints. |
| Error handling | Safe user-facing errors; detailed logs only server-side. |


## 14.1 Additional Security Requirements (Added)

The controls below make the section 14 checklist enforceable and close the highest-risk gaps for a multi-tenant procurement product.

| Security Area | Requirement |
| --- | --- |
| Object-level authorization (IDOR/BOLA) | Every :id endpoint verifies the object belongs to the caller's organization AND branch scope before any read or write. This is the top multi-tenant leak vector and must be explicitly tested. |
| Session management | Define token type, expiry, and refresh. Revoke sessions on role change or downgrade so a demoted user loses access immediately; support forced logout. |
| AI prompt-injection defense | Treat item names, notes, and uploaded invoices as untrusted. Sanitize inputs to the LLM, constrain outputs, and prevent the assistant from being steered into cross-tenant queries or unsafe actions. |
| File upload hardening | Validate MIME + magic bytes (not just extension), enforce size limits, scan for malware, store outside web root with signed time-limited URLs, and neutralize CSV formula injection (cells starting with =, +, -, @). |
| Audit-log immutability | Audit logs are append-only and tamper-evident; not editable or deletable, even by Owners. |
| Data protection / retention | Define retention, deletion, and export-on-request for user and supplier PII (India DPDP Act applies). |
| Rate limiting and abuse | Brute-force lockout on login; cost-abuse limits on AI endpoints; export-endpoint limits to prevent mass data exfiltration. |
| Authentication strength | Password policy, optional MFA/2FA, and SSO consideration for business customers. |
| Webhook / integration security | Verify signatures on all inbound webhooks (POS/ERP) and validate payloads server-side. |


# 15. Deployment Readiness

A deploy-ready product must include environment setup, database migrations, auth configuration, AI API configuration, seed data, monitoring, and QA. A good UI hosted on Vercel is not enough.

| Deployment Component | Requirement |
| --- | --- |
| Hosting | Vercel for Next.js frontend/API or separate backend host if using NestJS/Express. |
| Database | PostgreSQL via Supabase, Neon, Railway, Render, or similar. |
| Migrations | Prisma migrations committed and applied in production. |
| Seed Data | Demo organization, branches, users, inventory, suppliers, decisions, POs, transfers. |
| Environment Variables | Auth keys, DB URL, storage keys, OpenAI key, app URL, email provider. |
| File Storage | Supabase Storage/S3 bucket for invoices/imports/exports/PO documents. |
| Monitoring | Sentry/logging for errors and failed jobs. |
| Backups | Database backup/export strategy. |
| Email | Provider for invites, password reset, supplier messages if implemented. |
| Background Jobs | Scheduled risk scan and forecast generation. |


# 16. QA and Acceptance Criteria

## 16.1 Core Acceptance Criteria

- All protected app routes redirect to login when logged out.

- Roles and branch access affect visible data and allowed actions.

- Every visible button performs a real action, opens a real modal, navigates to a real route, or shows a permission/validation message.

- Inventory page loads real data and never gets stuck in infinite loading.

- Stock intake flows update inventory, ledger, activities, notifications, and persistence.

- Decision approval creates purchase orders and/or transfers, linked to the decision.

- PO receiving and transfer receiving update stock through ledger transactions.

- AI explanations use structured current data and do not hallucinate unrelated facts.

- Data persists after refresh and across sessions.

- No 404 routes, console errors, broken modals, or dead dropdown actions.

## 16.2 Test Matrix

| Area | Must Test |
| --- | --- |
| Auth | Login, signup, logout, forgot password, protected routes, permissions, onboarding, invite flow. |
| Inventory | Add item, receive stock, audit correction, wastage, ledger balance, filters, item detail. |
| Decisions | Open review, compare options, modify, approve, reject, monitor, batch approve. |
| POs | Create, send, confirm, partial receive, full receive, cancel, export/download. |
| Transfers | Create, dispatch, receive, cancel, source/destination ledger entries. |
| Forecasts | Run scenario, change item/branch/date range, open decision/item. |
| Suppliers | Add/open supplier, compare, view items/orders/performance, create PO. |
| Reports | Filter date, view detail, export CSV, verify outcome data. |
| Search | Search records, Ctrl+K commands, correct navigation. |
| Security | Unauthorized user blocked, branch isolation, org isolation, API validation. |


# 17. Missing Features Priority Matrix

These are the main gaps that must be addressed before calling ProcureIQ a real deploy-ready product.

| Priority | Missing Area | Why It Matters | Build Requirement |
| --- | --- | --- | --- |
| P0 | Backend | Without backend, the app is a prototype. | Implement API layer, services, validation, persistence. |
| P0 | Database | Business data must persist and be relational. | PostgreSQL + Prisma schema + migrations + seed data. |
| P0 | Authentication | Business product cannot be open-access. | Login/signup/onboarding/RBAC/protected routes. |
| P0 | Stock Ledger | Inventory numbers need trust and auditability. | Every stock change creates StockTransaction. |
| P0 | AI Brain | AI label is meaningless without analysis engine. | Forecast + risk + option scoring + rules + explanation. |
| P0 | Approval Execution | Approvals must create operational records. | Decision approval creates PO/transfer/activity/notification. |
| P0 | API Security | Frontend permissions alone are unsafe. | Server-side auth, org scoping, branch access, validation. |
| P1 | Supplier Intelligence | Supplier choice affects risk and cost. | Performance tracking and supplier comparison. |
| P1 | Transfer Feasibility | Transfers can create new shortages if wrong. | Donor safety, distance, cost, cold-chain, urgency logic. |
| P1 | File/Invoice/CSV Intake | Data intake must be practical. | Upload, preview, validate, confirm workflows. |
| P1 | Reports/Outcomes | Need proof product saves money. | Forecast accuracy, stockout avoided, waste avoided, revenue protected. |
| P1 | Notifications/Search | Operational workflow needs alerts and quick access. | Notification dropdown, global search, Ctrl+K. |
| P2 | Integrations | Production data should come from POS/ERP/accounting. | CSV first, then POS/API integrations. |
| P2 | Advanced ML | Can improve forecasts over time. | Replace deterministic model later after enough data. |


# 18. Release Plan and Risks

## 18.1 Suggested Build Phases

| Phase | Build Focus | Exit Criteria |
| --- | --- | --- |
| Phase 1 | Backend foundation, auth, database, seed data | Login works, org/branch data persists, protected routes work. |
| Phase 2 | Inventory ledger and stock intake | Receive/add/audit/wastage flows update ledger and stock. |
| Phase 3 | Decision engine and forecasting | Risk scan generates decisions from real data. |
| Phase 4 | Approval execution | Approve creates POs/transfers; receiving updates inventory. |
| Phase 5 | Supplier/transfer intelligence | Recommendations compare suppliers and transfer feasibility. |
| Phase 6 | Reports/outcomes/AI assistant | Product proves impact and explains decisions. |
| Phase 7 | Hardening and deployment | Security, QA, monitoring, production deploy. |


## 18.2 Key Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Bad stock data | AI decisions become wrong. | Ledger, audit corrections, confidence scores, manual override reasons. |
| Overcomplicated UI | Managers do not adopt product. | Exception-first command center and simple guided review. |
| AI hallucination | Unsafe procurement decisions. | LLM only explains structured engine output; rules/validation decide. |
| No integrations | Manual data entry burden. | CSV/invoice first, POS/API integrations later. |
| Permission gaps | Data leak or unauthorized approvals. | Backend-enforced RBAC and org/branch scoping. |
| Forecast inaccuracy | Wrong reorder decisions. | Confidence scoring, manager review, outcome tracking. |


> Final Build Standard<br>ProcureIQ should work as: Data → Analysis → Decision → Approval → Execution → Learning. Do not continue visual polish until backend, auth, ledger, AI brain, and execution workflows are properly implemented.


# Appendix A — Page and Button Functionality Matrix

| Page | Visible Action | Required Behavior |
| --- | --- | --- |
| Login | Sign In | Authenticate and redirect to command center. |
| Signup | Create Account | Create user/org and redirect to onboarding. |
| Command Center | Summary Cards | Filter/sort/open relevant decisions/reports. |
| Command Center | Review | Open decision review route/modal. |
| Decision Review | Approve Strategy | Create PO/transfer/activity/notification; update status. |
| Decision Review | Modify Quantities | Edit quantities, validate, save override, recalculate plan. |
| Decision Review | Reject | Require reason and store rejection. |
| Inventory | Update Stock | Open stock intake with item/branch context. |
| Inventory | View Ledger | Open ledger filtered to item/branch. |
| Stock Intake | Receive from Supplier | Create batch + receive_stock transaction. |
| Stock Intake | Add New Item | Create item + branch inventory + opening_stock transaction. |
| Stock Intake | Upload Invoice | Upload/preview/confirm receipt. |
| Stock Intake | Import CSV | Parse/validate/preview/confirm import. |
| POs | Receive Stock | Create po_receipt transaction and update PO. |
| Transfers | Dispatch | Create transfer_out and reduce source stock. |
| Transfers | Receive | Create transfer_in and increase destination stock. |
| Suppliers | Compare Supplier | Open comparison modal with supplier metrics. |
| Forecasts | Run Scenario | Update forecast output and risk. |
| Reports | Export CSV | Download real report data. |
| Settings | Save Rules | Persist auto-approval rules. |
| Top Bar | Search | Search records and navigate. |
| Top Bar | Notification Bell | Open notifications; mark read; navigate to records. |
| Sidebar | AI Assistant | Open assistant panel with data-grounded answers. |


# Appendix B — Demo Seed Data Requirements

| Data Type | Seed Records |
| --- | --- |
| Branches | Hyderabad Central, Warangal Hub, Siddipet Main. |
| Users | Rohit Regional Manager, Sanjay Branch Manager, Kavya Inventory Staff, Viewer User. |
| Items | Chicken Breast, Paneer, Tomatoes, Basmati Rice, Milk, Wheat Flour, Cooking Oil, French Fries, Frozen Peas, Mineral Water, Soft Drinks, Takeaway Boxes, Paper Cups, Dishwash Liquid, Sanitizer, Curd. |
| Suppliers | FreshRoute Foods, Deccan Traders, Warangal Agri Co-op, Sri Lakshmi Provisions, Telangana Fresh Farms. |
| Main Decision | D-2048 Chicken Breast hybrid decision with transfer 18 kg and purchase 22 kg. |
| POs | At least draft/sent/confirmed/partially received examples. |
| Transfers | TR-2025-035 In Transit, TR-2025-034 Received, TR-2025-033 Draft. |
| Ledger | Chicken Breast sample ledger proving current 8 kg. |


# Appendix C — 24-Hour Hackathon Build Plan (Added)

Judging is on logic and analysis: decisions must flow from real computation on the synthetic data, and the app must be fully functioning. With under 24 hours, the winning strategy is to make one decision chain real and inspectable, not to build every feature. Everything below is scoped to that goal.

> The chain that wins<br>Synthetic history -> Forecast -> Risk -> Scored options -> Chosen decision -> Explanation. If this chain produces defensible numbers on believable data and a judge can SEE the math, you win. Spend your hours here.


## C.1 How the LLM Is Used (Important)

You do NOT build, train, or fine-tune any model, and the LLM does NOT analyze the data or make decisions.

- Your deterministic code computes everything: forecast, risk level, option scores, chosen action, and quantities. These numbers are final before the LLM is ever called.

- The LLM (a hosted API such as Claude or OpenAI) has exactly two jobs: (1) turn a finished decision object into a plain-English explanation, and (2) power the AI Assistant by phrasing answers over data your code fetches. It never queries the database itself.

- This matches the section 11 principle: structured data and rules decide; the AI layer only explains. It also keeps decisions defensible when a judge asks 'why?'.

- Demo safety: generate and STORE each explanation when the decision is created (not live on stage). Provide a deterministic template fallback so the whole app works with the LLM turned off. The LLM is a garnish, never a dependency.

## C.2 Synthetic Data — Treat It Like Code

The synthetic dataset is the actual input to the analysis. Thin or too-clean data makes the engine look fake. Generate it with a seeded script so it is reproducible and so every forecast number derives from something real.

| Data Requirement | Why It Matters for Judging |
| --- | --- |
| 60-90 days of daily consumption per item | Forecast and confidence must derive from history, not constants. |
| Weekday/weekend patterns + one festival spike | Proves the forecast detects real seasonality, not a flat average. |
| 2-3 volatile items and 1 near-zero-history item | Demonstrates confidence scoring and cold-start handling. |
| One chronically-late supplier | Makes 'change supplier' and supplier scoring meaningful. |
| One overstocked branch (transfer donor) | Makes transfer and hybrid recommendations real, not staged. |
| The Chicken Breast D-2048 hero case | Your guaranteed, rehearsed demo narrative. |


## C.3 Make the Analysis Defensible and Inspectable

- Forecast confidence: define concretely (e.g. inverse of recent-demand coefficient of variation, degraded when history is short). Be ready to answer 'why 72%?'.

- Risk level: an explicit rule mapping stock cover, lead time, revenue-at-risk, and confidence to Critical/High/Medium/Low. Deterministic and transparent.

- Score breakdown in the UI: when a judge opens a decision, show each option's score components (urgency, cost, feasibility, donor risk, etc.) and which option won. This single panel is the highest-leverage feature you can build — it proves the logic exists.

## C.4 Two Demo-Weapon Features

- Time-advance / scenario simulation: let a judge push the clock forward or spike demand and watch decisions regenerate live. On synthetic data this is the moment the dashboard visibly 'thinks'. (Elevate the existing section 12.1 Run Scenario.)

- Manual 'Run Risk Scan' button: triggers the full pipeline on demand. Less work than cron, and it lets a judge press it and watch decisions appear. You need this for the live demo anyway.

## C.5 Consciously Cut or Fake (to finish in time)

| Item | Decision for the Hackathon |
| --- | --- |
| Concurrency / locking / idempotency | Skip — no judge will race you. Keep only the reservation concept if it changes visible logic. |
| Real invoice OCR / CSV parsing | Fake it — one pre-staged sample that previews cleanly. No real parser. |
| Real auth provider, email, background workers | Seeded login + manual scan button. Done. |
| Most of section 14 security | Keep org-scoping and basic role gating (they shape what is visible); skip MFA, DPDP, webhook signing. |
| Returns/RMA, PO amendments, MOQ batching | Note as roadmap; do not build. |


## C.6 Suggested Hour Blocks (~24h, adjust to team size)

| Block | Focus | Outcome |
| --- | --- | --- |
| 0-4h | Seeded synthetic data + schema | Believable history and stock in the DB. |
| 4-10h | Forecast + risk + option scoring engine | Real decisions generated from the data. |
| 10-14h | Decision review UI with score breakdown | Judge can see the math behind each decision. |
| 14-17h | Approve -> creates PO/transfer + ledger update | The execution loop works end to end. |
| 17-20h | LLM explanation (stored) + template fallback | Readable explanations, safe if API fails. |
| 20-22h | Run Scan + Time-advance/scenario controls | The app visibly reasons on demand. |
| 22-24h | Polish hero path, seed demo, rehearse | Flawless Chicken Breast walkthrough. |


> Final reminder<br>A narrow product where the analysis is real and visible beats a broad one where it is stubbed. Protect the hero path above everything else.

