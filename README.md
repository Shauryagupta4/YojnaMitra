# YojanaMitra — Unified Central & State Government Welfare Portal

A high-performance multi-agent welfare & scholarship intelligence platform connecting Indian citizens, students, farmers, and entrepreneurs with verified Central and State welfare initiatives.

---

## ⚠️ CRITICAL SECURITY & SECRET SAFETY NOTICE

> [!CAUTION]
> **MANDATORY SECRET ROTATION WARNING:**
> If any API key, token, or secret was previously hardcoded or present in any file before `.gitignore` protection was established, **it is compromised or permanently stored in git history**. 
> 
> **You MUST rotate any previously hardcoded secrets immediately:**
> 1. **Groq API Keys**: Immediately revoke and generate new keys in the [Groq Console](https://console.groq.com/keys).
> 2. **TinyFish API Keys**: Regenerate keys in your TinyFish dashboard.
> 3. **Database & Third-Party Credentials**: Rotate any database passwords, Supabase keys, Stripe keys, or OAuth secrets.
> 
> If you have existing git commits containing secrets, run `git filter-repo` or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) before pushing to a remote repository.

---

## 🔒 Secret Management Architecture & Rules

### 1. Environment Variable Protocol
- **NEVER** commit `.env` or any `.env*.local` file.
- All secrets are excluded in `.gitignore`.
- Reference template is maintained in [`.env.example`](file:///.env.example) with placeholder values only.

### 2. Frontend Exposure Safety (`VITE_`, `NEXT_PUBLIC_`, `REACT_APP_`)
- Vite bakes any variable prefixed with `VITE_` directly into the client-side JavaScript bundle shipped to browsers.
- **Production Architecture**: For production deployments, secret LLM API keys (`VITE_GROQ_API_KEY_*`, `VITE_TINYFISH_API_KEY`) must **not** be exposed directly to the browser. Instead, requests must route through a secure backend proxy (e.g. Express server, Next.js API routes, or Cloudflare Workers) where secret keys remain server-side.
- In prototype/local exhibition mode, if `.env` keys are omitted, the application seamlessly falls back to high-fidelity, verified national data without crashing.

### 3. Service-Specific Security Policies
| Service | Client-Side Allowed? | Security Policy |
| :--- | :--- | :--- |
| **Supabase** | Anon Key **ONLY** | Anon key is safe for client-side use **ONLY if Row Level Security (RLS)** is enabled on every table. **Service role keys must NEVER appear client-side.** |
| **Stripe** | Publishable Key (`pk_...`) | Publishable key client-side only. Secret keys (`sk_...`, `rk_...`) must remain strictly server-side. |
| **Database URIs** | ❌ NEVER | PostgreSQL, MongoDB, MySQL, and Redis connection strings with credentials must remain server-side in environment variables only. |
| **OAuth & JWT** | ❌ NEVER | OAuth client secrets and JWT signing secrets must reside strictly server-side. |
| **Third-Party APIs** | ❌ Proxy Recommended | Groq, OpenAI, Anthropic, AWS, Twilio, SendGrid, and Firebase Admin keys must never exist as plain string literals in source code. |

### 4. Logging & Error Sanitization
All pipeline errors, API responses, and multi-agent audit telemetry pass through `scrubSecrets()` in [`src/services/securitySanitizer.ts`](file:///src/services/securitySanitizer.ts). Real secret substrings, authorization headers, and credential strings are automatically redacted before logging to the browser console or rendering in UI states.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup
1. Clone the repository.
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Add your development keys to `.env`.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run development server:
   ```bash
   npm run dev
   ```
6. Build for production:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack
- **Frontend Framework**: React 19 + Vite 8
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Neo-Glass Brutalism Design System)
- **Linter**: Oxlint
