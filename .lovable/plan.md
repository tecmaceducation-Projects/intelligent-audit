# AuditIQ — Frontend Plan

A premium, fintech-grade dashboard for an AI-powered insurance claim audit & fraud detection tool. Frontend-only with realistic mock data, email/password login, and a light + dark theme toggle.

## Design system

- **Palette** (HSL tokens in `index.css`, used across light + dark):
  - Primary deep blue `#1E3A8A`, secondary teal `#14B8A6`, accent purple `#7C3AED`
  - Status: success `#22C55E`, warning `#F59E0B`, danger `#EF4444`
  - Light bg: subtle gradient `#F9FAFB → #FFFFFF`; Dark bg: deep slate with subtle blue tint
- **Typography**: Inter (via Google Fonts), bold tracking-tight headings, comfortable body sizing
- **Surfaces**: rounded-2xl cards, soft layered shadows, 1px hairline borders, glassmorphism on hero/stat cards (backdrop blur + translucent bg)
- **Motion**: fade-in / scale-in on mount, hover lift on cards/buttons, animated counters, skeletons, smooth route transitions
- **Components**: shadcn (Button, Card, Table, Tabs, Dialog, Sheet, Badge, Progress, Tooltip, Sonner toasts, Sidebar)

## App shell

- `SidebarProvider` layout with collapsible sidebar (icon mini-mode) + top header
- **Sidebar nav**: Dashboard, Upload Claim, Claims History, Insights, Settings
- **Header**: AuditIQ wordmark + logo, global search, theme toggle (sun/moon), notifications bell, user avatar menu (profile, sign out)
- Theme toggle persists in `localStorage`, applies `.dark` class on `<html>`
- Toaster (sonner) for success/error feedback

## Auth

- Email/password via Lovable Cloud (Supabase auth), no profile table needed for v1
- `/auth` page with Sign in / Sign up tabs, branded split-screen (left: gradient hero with tagline + feature bullets; right: form)
- Protected routes redirect unauthenticated users to `/auth`
- `onAuthStateChange` listener set up before `getSession()`; sign-up uses `emailRedirectTo: window.location.origin`

## Pages

### 1. Dashboard `/`
- **Hero greeting** ("Welcome back, [name]") + quick "Upload claim" CTA
- **4 stat cards** with animated counters + trend deltas: Total Claims Processed, Fraud Detected %, Avg Risk Score, Pending Investigations
- **Charts** (recharts):
  - Line: Claims processed over last 30 days
  - Donut: Approved vs Rejected vs Investigate
  - Bar: Fraud categories (Duplicate, Anomaly, Mismatch, Identity, Billing)
- **Recent activity feed** with status badges, claim ID, hospital, amount, time-ago

### 2. Upload Claim `/upload`
- Stepper: Upload → Review → Analyze
- Drag-and-drop zone (PDF/JPG/PNG), file preview tile with remove
- Animated progress bar on simulated upload
- Optional metadata fields (claim type, policy number)
- "Analyze Claim" button → routes to processing screen

### 3. Processing `/processing/:claimId`
- Centered animated AI loader (pulsing rings + scanning shimmer)
- Dynamic step list checking off in sequence (~600–900 ms each):
  1. Extracting claim data
  2. Validating policy coverage
  3. Cross-referencing prior claims
  4. Detecting fraud signals
  5. Generating AI insights
- Auto-redirects to audit result on completion

### 4. Audit Result `/claims/:id` (hero page)
- **Top row**: large circular risk score (0–100) with color-graded ring + risk tier label, decision badge (Approve / Reject / Investigate), confidence %
- **Tabbed sections**:
  - **Summary**: patient, hospital, policy #, amount, claim date, claim type
  - **Policy Validation**: covered vs not-covered line items with check/x icons
  - **Fraud Insights**: cards for each flag (e.g. "Duplicate claim detected — 87% match with CLM-2041") with severity color
  - **AI Explanation**: prose panel with highlighted key phrases, bullet rationale
  - **Recommendation**: large action card with explanation + Approve / Reject / Investigate buttons (toast confirmation)
- Sticky right rail on desktop with quick facts and "Export report" (UI only)

### 5. Claims History `/claims`
- Toolbar: search, status filter chips, risk-range slider, date range
- Sortable table: Claim ID, Date, Hospital, Amount, Risk Score (mini bar), Status badge
- Row click → audit result page; pagination at bottom
- Empty + loading skeleton states

### 6. Insights `/insights`
- KPI strip (fraud rate, avg processing time, savings est.)
- Charts: fraud trend area chart, high-risk distribution heat-style bars, top fraud patterns ranked list, geo/hospital leaderboard
- "Export PDF" / "Export CSV" buttons (UI only, toast on click)

## Mock data layer

- `src/lib/mock/` module with seeded random generator (deterministic) producing ~50 claims, fraud flags, time series, and audit results
- `src/lib/api.ts` exposes `uploadClaim`, `getClaim(id)`, `listClaims(filters)`, `getDashboardStats`, `getInsights` returning Promises with artificial delay — same shape as the planned real endpoints (`risk_score`, `decision`, `explanation`, `fraud_flags`, `claim_data`) so swapping to real APIs later is a one-file change
- TanStack Query already in `App.tsx` will wrap all reads

## Responsiveness

- Desktop-first 12-col layouts, graceful collapse to single column under `md`
- Sidebar becomes off-canvas sheet on mobile; tables become stacked cards
- Charts use `ResponsiveContainer`

## Technical notes

- Routes added in `App.tsx`: `/auth`, `/`, `/upload`, `/processing/:id`, `/claims`, `/claims/:id`, `/insights`, `*`
- New folders: `src/components/layout` (AppSidebar, Header, ProtectedRoute, ThemeProvider), `src/components/dashboard`, `src/components/audit`, `src/components/charts`, `src/lib/mock`
- Charts via `recharts` (already bundled with shadcn chart wrapper)
- Theme: lightweight provider using `next-themes`-style logic (no extra dep) writing to `document.documentElement`
- All colors via semantic tokens — no hard-coded Tailwind color names in components
- Animated counters via small `useCountUp` hook; circular risk gauge built on SVG (no extra dep)

## Out of scope for v1

- Real AI / file parsing (mock only)
- Roles, multi-tenant, or admin-only gating on Insights (page is visible to all signed-in users)
- Real export generation
- Push notifications (toast only)