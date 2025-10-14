# CareerForge

A modern, AI-powered resume generator and career toolkit built with Next.js 15 (App Router), React 19, Tailwind CSS 4, and Supabase. It helps users author high‑quality, ATS‑friendly resumes and export them to PDF and Word with clean formatting.

This project was built as part of the AICTE IBM 4 Week Virtual Internship program.

## Features

- **AI-enhanced resume generation** via `/api/generate-resume` using Mistral API with prompt-engineering for concise, quantified, ATS-friendly content.
- **Live preview modal** with safe, consistent styling.
- **PDF export** with multi-page pagination and isolated rendering to avoid CSS color/function issues.
- **Word (.docx) export** using a semantic HTML → DOCX mapper.
- **User profiles and persistence** with Supabase (auth optional, resume storage/logs supported).
- **Preferences** (tone/style) to nudge the AI formatter.
- **reCAPTCHA** verification endpoint.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix primitives)
- **State/Forms**: React Hook Form, Zod
- **AI**: Mistral Chat Completions API
- **Persistence**: Supabase (client + service role for server operations)
- **Exports**: 
  - PDF: html2canvas + jsPDF (client-side), optional server-side via Puppeteer
  - DOCX: `docx` library
- **Other**: Framer Motion, Lucide Icons

## Project Structure (selected)

- `app/dashboard/page.tsx` — Main builder UI, preview modal trigger
- `components/resume-preview-modal.tsx` — Preview & downloads
- `lib/downloads.ts` — Download helpers delegating to sanitized exporters
- `lib/resume-export.ts` — PDF (iframe + pagination) and DOCX generation
- `app/api/generate-resume/route.ts` — AI-driven resume HTML generation
- `app/api/generate-pdf/route.ts` — Optional server-side PDF via Puppeteer
- `lib/supabaseClient.ts` — Public Supabase client
- `lib/supabaseAdmin.ts` — Service-role Supabase client (server only)

## Local Development

Prerequisites:
- Node.js 18+
- pnpm (recommended) or npm/yarn

Install and run:
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Environment Variables

Create a `.env.local` in the project root and populate as needed:

```bash
# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (public client)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase (admin on server routes only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mistral (for AI resume generation)
MISTRAL_API_KEY=your_mistral_api_key

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

Notes:
- Service role key must never be exposed to the browser. It is only read by server routes (e.g., `app/api/*`).
- If you don’t have Mistral keys, the `/api/generate-resume` route falls back to a structured template.

## PDF and Word Exports

- **Client-side PDF**: `lib/resume-export.ts` renders the resume HTML inside an offscreen iframe with minimal CSS, captures it via `html2canvas`, and paginates into A4 pages with `jsPDF`.
- **Server-side PDF (optional)**: `app/api/generate-pdf/route.ts` uses Puppeteer to generate a PDF buffer and uploads to Supabase Storage.
- **DOCX**: A semantic mapper converts headings, paragraphs, lists, links, bold/italics to `docx` structures for clean Word files.

## Deployment

- **Recommended**: Vercel or Netlify for the Next.js frontend.
- **Serverless APIs**: Next.js Route Handlers in `app/api/*` work on Vercel. If using Puppeteer (`/api/generate-pdf`), ensure a Node runtime is available or host separately.
- **Environment setup**: Configure all environment variables in the hosting provider dashboard. For Supabase Storage (if using server-side PDF), create a bucket named `generated_files`.
- **Images**: `next.config.mjs` has `images.unoptimized = true` for simpler deployments.
- **Webpack cache (Windows dev)**: `next.config.mjs` switches to in-memory cache in dev to avoid rename ENOENT warnings.

## How It Works (AI)

- The route `app/api/generate-resume/route.ts` builds a system + user prompt with tone/style preferences, enforces clean HTML output, removes non-HTML wrappers (like markdown fences), and returns the final HTML.
- The builder displays the HTML in a preview and offers PDF/DOCX downloads. Client PDF rendering isolates from global styles to avoid unsupported color functions.

## Roadmap / Ideas

- Additional template presets (`modern`, `minimal`, `classic`) with 1-click switch.
- Multi-language support and locale-specific date/spellings.
- AI “quantification booster” pass for Experience/Projects.
- Export to Markdown/LaTeX.

## Credits

- Built during the **AICTE IBM 4 Week Virtual Internship**.
- Thanks to the open-source ecosystem: Next.js, Tailwind, Supabase, docx, jsPDF, html2canvas, Puppeteer, Radix UI, Framer Motion, and more.
