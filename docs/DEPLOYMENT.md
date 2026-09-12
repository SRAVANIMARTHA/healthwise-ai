# HealthWise AI — Deployment Guide

This guide details the procedure for deploying HealthWise AI into a production environment.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or later.
- **npm**: v9.0.0 or later.
- A **Supabase Cloud project** (or self-hosted Supabase instance).
- A static hosting provider: **Vercel**, **Netlify**, **Cloudflare Pages**, or **AWS S3 + CloudFront**.

---

## 2. Environment Variables

Create your production environment variables in your hosting provider's dashboard:

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase Project URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase Public Anonymous API Key | `eyJhbGciOi...` |
| `VITE_PUTER_AI_MODEL` | No | AI model utilized via Puter.js | `gpt-4o-mini` (default) |
| `VITE_ENABLE_MOCK_AI` | No | Force mock offline AI answers | `false` (default) |
| `VITE_APP_NAME` | No | Branding title | `"HealthWise AI"` |
| `VITE_DEFAULT_LANGUAGE` | No | Default fallback language code | `en` |

> [!CAUTION]
> **NEVER expose your Supabase `service_role` key in frontend environment variables.** `VITE_*` variables are bundled into client-accessible JavaScript.

---

## 3. Database Initialization (Supabase)

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Execute each migration file in order:
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_fix_profiles_rls.sql`
   - Run `supabase/migrations/002_knowledge_base_sync.sql`
   - Run `supabase/migrations/003_vector_rag_retrieval.sql`
4. Verify table availability by checking the **Table Editor**: you should see 15 tables created.
5. In **Authentication -> URL Configuration**, add your production domain to the **Site URL** and **Redirect URLs** (e.g., `https://healthwise-ai.vercel.app/**`).

---

## 4. Production Build Verification

Before deploying, ensure the code builds cleanly with zero errors:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Production build
npm run build

# 3. Preview locally
npm run preview
```

---

## 5. Deployment Options

### Option A: Vercel (Recommended)

1. Import your Git repository into **Vercel**.
2. Select **Vite** as the framework preset.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Configure the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Add a `vercel.json` rewrite rule to support React Router single-page navigation:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**.

### Option B: Netlify

1. Connect your repository to **Netlify**.
2. Configure build command: `npm run build`, publish directory: `dist`.
3. Add environment variables.
4. Add a `public/_redirects` file for SPA routing:
   ```
   /*    /index.html   200
   ```
5. Deploy.

### Option C: Cloudflare Pages

1. Create a project in **Cloudflare Pages** linked to your Git repository.
2. Framework preset: **Vite**.
3. Build command: `npm run build`. Output directory: `dist`.
4. Add environment variables in Pages settings.
5. Deploy.

---

## 6. Post-Deployment Verification Checklist

Once deployed to your production URL:

- [ ] **Home Page**: Verify the landing page, navigation header, and disclaimer banner render properly.
- [ ] **Registration & Login**: Sign up a test user, confirm account creation in Supabase auth, and test sign in.
- [ ] **Conversational Chat**:
  - Ask a public health question (e.g., "What are the common warning signs of dengue?").
  - Confirm Puter.js generates a response grounded in WHO sources with citations.
  - Verify that ampersands (`&`) render cleanly as `&` and not `&amp;`.
- [ ] **Red-Flag Emergency Escalation**:
  - Input a harmless test trigger: "I have crushing chest pain".
  - Verify that the emergency banner and hotline modal trigger immediately with emergency contacts (112, 108, 911).
- [ ] **Disease Explorer**:
  - Browse `/diseases` and view `/diseases/dengue`.
  - Click "Ask AI about this condition".
  - Confirm the question is passed to `/chat` and dispatched **exactly once** without duplication.
- [ ] **Language Selection**:
  - Switch language to Telugu (తెలుగు) and Hindi (हिन्दी).
  - Confirm UI components and disclaimers localize properly.
- [ ] **Admin Portal**:
  - Log in with an account having `role = 'admin'`.
  - Navigate to `/admin` and confirm telemetry metrics load.
  - Verify normal non-admin users are blocked and redirected to Home.
- [ ] **PWA**:
  - Verify the browser detects `manifest.json` and offers standalone installation.
