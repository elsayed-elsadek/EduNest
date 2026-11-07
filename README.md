# EduNest (Learn. Mentor. Grow.) — Project Documentation

## 1. Executive Summary & Overview
**EduNest** is a cutting-edge web platform engineered to bridge the gap between students and professional mentors/educators. Built using **React 19**, **TypeScript**, and **Vite**, the application offers a secure, highly scalable, and responsive ecosystem. 

The architecture features strict Role-Based Access Control (RBAC), custom-tailored dashboards for diverse user profiles, state-of-the-art build-time optimizations (such as manual chunk splitting and asset optimization), and seamless real-time data streaming.

---

## 2. Technical Stack (Tech Stack)

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Library** | React 19 | Component-based, highly efficient UI rendering |
| **Language** | TypeScript | Strong typing, compile-time error catching, robust codebase |
| **Build Tool** | Vite | Ultra-fast development server and production bundling |
| **Routing** | React Router DOM | Dynamic, declarative client-side routing |
| **Data Fetching** | @tanstack/react-query | Server-state management, caching, and background synchronization |
| **State Management**| Zustand | Lightweight client-side authentication and UI state persistence |
| **Styling** | TailwindCSS | Utility-first, responsive interface design |
| **HTTP Client** | Axios | Interceptor-configured API communications |
| **Real-time Engine**| WebSocket / STOMP | Instant bidirectional messaging and system notifications |
| **Video Conferencing**| @jitsi/react-sdk | Integrated, low-latency live mentoring sessions |
| **User Alerts** | react-hot-toast | Non-blocking, accessible visual notifications |

---

## 3. Application Architecture & Routing (RBAC)

The application handles routing dynamically via `src/App.tsx`. To optimize performance, asynchronous resource loading is achieved using **Code-Splitting** (`React.lazy` and `Suspense`). Secure routes are wrapped in a robust `ProtectedRoute` guard ensuring strict role separation.

### A. Public Routes (Accessible to all guests)
*   **Core Pages:** `/` (Home), `/become-mentor`, `/start-Started`
*   **Mentorship Catalog:** `/mentorships`, `/mentorships/:mentorshipId` (Sub-routes: `overview`, `content`, `reviews`, `leaderboard`)
*   **Profiles:** `/mentor-profile/:mentorEmail`
*   **Authentication & Onboarding:** `/login`, `/register`, `/verify`, `/success`
*   **Account Recovery Flows:** 
    *   `/forgot-password`, `/check-email`, `/reset-password`, `/reset-success`
    *   `/restore-account`, `/confirm-restore`

### B. Protected Role-Based Routes
├── ROLE_MENTOR (Mentor Workspace)
│   ├── /mentor/dashboard — Analytics, active student metrics, overview
│   ├── /mentor/mentorships — Manage programs, create, edit, delete
│   ├── /mentor/operations — Orchestrate live sessions, quizzes, tasks, and projects
│   └── /mentor/messages, /mentor/notifications, /mentor/profile, /mentor/settings
│
├── ROLE_STUDENT (Student Learning Space)
│   ├── /student/dashboard — Enrolled courses tracking, progress tracking
│   ├── /explore-mentorships — Discovery engine for programs
│   ├── /student/learning / /student/learning/:mentorshipId/... — Interactive course viewer
│   ├── /mentorships/:mentorshipId/enroll — Checkout and enrollment gate
│   └── /student/messages, /student/notifications, /student/profile, /student/settings
│
└── ROLE_ADMIN (Global Control Panel)
└── /admin/dashboard (AdminLayout containing: dashboard, payment, issues, configurations, users)


---

## 4. Application Context & Global Providers
The root setup (`src/main.tsx`) bootstraps the global data layers by securely nesting providers to supply cross-cutting concerns:

*   **`ThemeProvider`**: Powers the universal light/dark mode configuration.
*   **`WebSocketProvider`**: Manages persistent full-duplex socket links for live notifications.
*   **`NotificationsProvider`**: Handles event listener propagation for real-time application signals.
*   **`CustomToaster`** (`src/components/common/toaster/CustomToaster.tsx`): Renders highly customized UI feedback toasts.

---

## 5. Performance, Build, & SEO Optimizations

The application is thoroughly configured inside `vite.config.ts` to maximize production delivery efficiency and fulfill core Web Vitals.

### Code Splitting & Vendor Chunking
To prevent bloated bundle sizes, `manualChunks` divides the distribution code into specialized operational slices:
```typescript
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'vendor-react';
    if (id.includes('charts')) return 'vendor-charts';
    if (id.includes('icons')) return 'vendor-icons';
    if (id.includes('@jitsi')) return 'vendor-jitsi';
    if (id.includes('alert') || id.includes('toast')) return 'vendor-alerts';
    return 'vendor-misc';
  }
}
Asset Processing: cssCodeSplit: true ensures style sheets load conditionally alongside their respective page modules.

Compilation Strategy: minify: 'esbuild' guarantees ultra-fast build execution and minification.

Automated Asset Optimization
Using vite-plugin-image-optimizer, rich media resources undergo automated compression with zero runtime performance impact:

PNG / JPEG: Compressed to a strict 75% quality index.

WebP / AVIF: Transcoded and compressed to a strict 70% quality index.

Local Development Proxying
To circumvent Cross-Origin Resource Sharing (CORS) limits during local engineering cycles, asynchronous traffic targeting /api maps to: http://localhost:8080.

SEO & Accessibility (a11y)
Crawling Controls: Deployed a standardized public/robots.txt configuration to manage automated search engine indexing layout.

Semantic UI: Enforced robust aria-label definitions across all interactive button groups and asset iconography.

6. Deep Dive Feature Focus: Explore Mentorships
The mentorship discovery portal (EXPLORE_MENTORSHIPS_FEATURE.md) provides a fluid, desktop-grade lookup interface.

Feature Mechanics
Asynchronous Debouncing: Text queries use a custom 500ms debounce window to eliminate repetitive REST inquiries.

Multi-Tier Filtering Matrix: Supports dynamic combined queries (Keyword lookup, Category classifications, Minimum/Maximum Price tracking, and Instant Reset actions).

State-Aware Pagination: Renders clear state bounds (start/end) alongside dynamic page-count tags.

Predictive UI/UX States: Contains structural layout loading skeletons, fail-safe HTTP error handling components, and expressive empty state prompts.

URL State Synchronization: Automatically serializes current searches, filters, and pages straight into the URL bar, empowering users to bookmark and share query configurations.

API Integration Specifics
Endpoint: GET /api/v1/mentorship/explore

Supported Query Parameters:

Markdown
?page=0&size=10&keyword=typescript&category=development&minPrice=10&maxPrice=150
7. Authentication & State Architecture
EduNest manages security tokens and cryptographic states via an integrated local-to-cloud security mapping pipeline detailed in IMPLEMENTATION_GUIDE.md.

[UI Components / Forms]  ──>  [src/services/api.ts (Axios Base)]
                                          │
                                          ▼
[Zustand Auth Store]     <───   [Server API Endpoints]
(`src/store/useAuthStore.ts`)             │
         │                                ▼
         └───> Local Storage Sync (`auth-store` Token Key)
Core API Services Array (src/services/api.ts)
registerStudent(data) / registerMentor(data): Dedicated onboarding entry points.

sendOTP(email) / verifyOTP(code): Multi-factor verification gates.

login(credentials) / logout(): Session tracking lifecycle operations.

getUserProfile() / refreshAccessToken(): Automatic background session renewal middleware.

8. Directory Layout Tree (src/)
src/
├── components/       # Component modularity (common, layout, admin, student, mentor)
├── context/          # State providers (Theme, WebSockets, Real-Time Notifications)
├── hooks/            # Dedicated functional UI abstractions and server-side fetching hooks
├── pages/            # Core views and layout routers mapped to the virtual routing scheme
├── routes/           # Protected guard logic and dynamic routing access filters
├── services/         # Low-level infrastructure clients (Axios, API declarations)
├── store/            # Global client state engines (Zustand Auth stores)
├── types/            # App-wide TypeScript Interfaces and Type declarations
├── App.tsx           # Global Route Entrypoint and App Configuration
└── main.tsx          # Application Mounting, Dom Binding, and global provider wrapping
9. Development Runscripts

### Prerequisites

- Node.js **24** (pinned in `.nvmrc`; Vite 8 requires `^20.19.0 || >=22.12.0`).
- npm 11+ (ships with Node 24).

Use the pinned toolchain so your machine matches CI:

```bash
nvm use            # reads .nvmrc
node --version     # must print v24.x
```

### Install

```bash
npm ci             # installs exactly what package-lock.json pins
```

`npm ci` (not `npm install`) is the supported install path: it is reproducible, it deletes `node_modules` first, and it fails when `package.json` and `package-lock.json` disagree.

### Environment configuration

All runtime configuration is read through a single module, `src/config/env.ts`. Application code must import `API_BASE_URL` / `getAssetUrl` from there instead of reading `import.meta.env` directly or hard-coding a host.

| Variable | Required | Example | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Production: **yes**<br>Development: no | `https://api.example.com` | Backend origin used by Axios, WebSocket connections and asset URLs |
| `VITE_CHATBOT_API_URL` | No | `https://chat.example.com/chat` | Chatbot service endpoint (separate backend) |

> Vite only exposes `VITE_*` variables to the browser, and their values are **inlined into the bundle at build time**. Never put a password, private API key or any other secret in a `VITE_*` variable.

#### Local setup

Copy the template and point it at your local backend:

```bash
cp .env.example .env                 # Linux / macOS
Copy-Item .env.example .env          # PowerShell
```

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

`.env` is git-ignored. If the variable is absent in development, `src/config/env.ts` falls back to `http://localhost:8080`, so `npm run dev` works out of the box.

#### Staging and production

The same code is promoted between environments by changing the variable at build time — no source changes:

```bash
# Staging
VITE_API_BASE_URL=https://api.staging.example.com npm run build

# Production (PowerShell)
$env:VITE_API_BASE_URL="https://api.example.com"; npm run build
```

#### Accepted URL format

| Value | Result |
| :--- | :--- |
| `https://api.example.com` | ✅ accepted |
| `https://api.example.com/` | ✅ accepted, normalised to `https://api.example.com` |
| `http://localhost:8080` (development) | ✅ accepted |
| `staging.example.com` (no scheme) | ❌ rejected — must be an absolute URL |
| `https://user:pass@api.example.com` | ❌ rejected — credentials are not allowed |
| `https://api.example.com/?x=1` | ❌ rejected — no query string or hash |
| `http://localhost:8080` (production build) | ❌ rejected — local hosts are not allowed in production |

The same rules apply to `VITE_CHATBOT_API_URL`.

#### Missing or invalid configuration

`vite.config.ts` validates production configuration before Vite starts bundling, and `src/config/env.ts` validates it again when the application configuration is evaluated:

- **Production:** a missing `VITE_API_BASE_URL`, a non-absolute URL, or a localhost host fails the production build with a message prefixed `[env]`, so the build exits before generating a bundle.
- **Development:** a missing variable falls back to the local backend; an invalid value still throws.

`VITE_CHATBOT_API_URL` follows the same validation rules, but is optional: when it is unset in a production build the chatbot widget is disabled while the rest of the app keeps working.

Asset URLs (avatars, uploads, files) use the same origin through `getAssetUrl()`; `src/utils/imageUtils.ts` is a thin wrapper over it.

> `VITE_BASE_URL` is a legacy name that is being removed. Do not use it in new code — import from `src/config/env.ts` instead.

### Frontend rendering security

AI responses and uploaded DOCX files are untrusted input. Chatbot Markdown is escaped and restricted to a small formatting allowlist; HTML generated from DOCX previews is sanitized with DOMPurify using a separate document-formatting allowlist. External navigation accepts only HTTP(S) URLs and opens new tabs with `noopener,noreferrer` to prevent opener access and reverse tabnabbing. DOCX conversion uses the bundled Mammoth npm dependency and does not fetch the converter from a CDN.

Run the security-focused DOM and URL tests with:

```bash
npm test -- --pool=threads --maxWorkers=1 src/utils/__tests__/security.test.ts src/components/common/__tests__/securityRendering.test.tsx
```

### Logging

All application logging goes through **`src/utils/logger.ts`**. It is the only
module allowed to call `console.*`; ESLint enforces this with `no-console: error`
and an allowlist for that one file.

```ts
import logger from '../../utils/logger';

logger.debug('cache miss', key);          // development only
logger.info('mentorship loaded');
logger.warn('image failed to load', id);
logger.error('failed to save project', err);
```

- **Production:** every method is a no-op — a production build emits no
  application console output, so tokens and URLs cannot leak through DevTools
  or a screen share.
- **Development:** output is forwarded after sanitising every argument.
  `Authorization` headers, bearer tokens, JWTs, passwords, secrets, API keys,
  e-mail addresses and query strings are replaced with `[REDACTED]` or stripped.
  `Error` objects are converted to plain, sanitised copies, so expanding a live
  axios error in DevTools cannot reveal `config.headers.Authorization`.
- `sanitizeForLog()` is exported so the error-reporting layer (FE-021) can apply
  the same redaction before shipping an error to an external service.

Errors must still reach the user through UI state (toasts, error panels); the
logger is for diagnostics only, never the only error channel.

### Testing

Unit and component tests run on **Vitest** with **jsdom** and **React Testing
Library** (`@testing-library/react`, `@testing-library/user-event`,
`@testing-library/jest-dom`). Configuration lives in `vitest.config.ts`; shared
setup lives in `src/test/setup.ts`.

```bash
npm test            # single run (CI mode)
npm run test:watch  # re-run affected tests while you edit
npm run test:coverage  # single run + coverage report + threshold gate
```

| Path | Covers |
| :--- | :--- |
| `src/config/__tests__/env.test.ts` | URL validation, production guards, `getAssetUrl` |
| `src/utils/__tests__/jwt.test.ts` | JWT decoding, name/role/user extraction, invalid tokens |
| `src/utils/__tests__/logger.test.ts` | Log sanitisation, recursive redaction, dev forwarding |
| `src/utils/__tests__/logger.production.test.ts` | Production logger is a no-op |
| `src/routes/__tests__/ProtectedRoute.test.tsx` | Hydration, login redirect, role-based redirects |
| `src/hooks/__tests__/useLogin.test.tsx` | Login validation, success/failure/OTP/restore flows |
| `src/hooks/__tests__/useRegisterForm.test.tsx` | Registration validation rules |
| `src/components/common/__tests__/` | `Button`, `EmptyState`, `ErrorState` behaviour |

**Coverage policy.** `npm run test:coverage` prints statements, branches,
functions and lines, writes an HTML report to `coverage/` (git-ignored), and
**fails the run** when the totals drop below **70% lines / 70% branches**. These
thresholds are the starting floor proposed for Tech Lead sign-off; raise them,
never lower them.

Coverage is scoped (`coverage.include` in `vitest.config.ts`) to the modules that
already have a dedicated suite. Measuring all of `src/` at this stage would
dilute the number with untested screens and make the gate meaningless. Add every
newly tested module to that list as suites land.

**Writing a test.** Use explicit imports (`import { describe, it, expect } from 'vitest'`)
— globals are disabled. Render through React Testing Library and query by role or
text, not by CSS class. Never assert on the real network: mock the service module
(`vi.mock`) and keep the test deterministic.

End-to-end flows, browser automation and Playwright are deliberately **out of
scope** here; they are tracked in FE-013, FE-014 and FE-015.

### Commands

| Command | What it proves |
| :--- | :--- |
| `npm ci` | Dependencies install exactly as pinned in the lockfile |
| `npm run typecheck` | No TypeScript errors (`tsc -b`, project references included) |
| `npm run lint` | No ESLint errors |
| `npm test` | All unit/component tests pass |
| `npm run test:coverage` | Tests pass **and** coverage meets the 70% lines/branches floor |
| `npm run build` | Production build succeeds and emits `dist/` |
| `npm run verify` | typecheck → lint → coverage → build, stopping at the first failure |
| `npm run ci` | Install-independent verification used by CI |
| `npm run dev` | Local dev server |
| `npm run preview` | Serves the built `dist/` locally |

### Why `tsc -b` and not `tsc --noEmit`

The root `tsconfig.json` is a solution-style file (`"files": []`) that only lists project references. Running `npx tsc --noEmit` from the root therefore checks **zero files** and exits 0 — a false green. `tsc -b` builds the referenced projects (`tsconfig.app.json`, `tsconfig.node.json`) and performs a real type check. Always use `npm run typecheck`.

### Continuous Integration

`.github/workflows/ci.yml` runs on every pull request targeting `master` and on every push to `master`:

1. `actions/checkout`
2. `actions/setup-node` with the version from `.nvmrc` and npm caching keyed on `package-lock.json`
3. `npm ci`
4. `npm run typecheck`
5. `npm run lint`
6. `npm run test:coverage` — a failing assertion or a coverage drop below 70% fails the job
7. `npm run build`
8. upload `dist/` as artifact `build-<commit-sha>` with 90-day retention
9. upload `coverage/` as artifact `coverage-<commit-sha>` with 14-day retention

A failing step fails the job, and the job blocks the merge once its check name is required in branch protection on `master`. The workflow never prints environment variables or secrets.