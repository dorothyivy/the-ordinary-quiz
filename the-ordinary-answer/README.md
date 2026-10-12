# The Ordinary Answer — Personalized Skincare Quiz

A full-stack Next.js 14 application that delivers personalized skincare routines using The Ordinary's product catalog, with ingredient conflict checking and Klaviyo email/SMS integration.

## Features

- **15-Question Personalized Quiz** — covers skin type, concerns, experience, budget, climate, and more
- **71-Product Catalog** — complete The Ordinary product database with ingredients, conflicts, and usage instructions
- **Ingredient Conflict Checking** — automatically detects and warns about unsafe product combinations
- **Smart Recommendation Engine** — scores products based on skin profile, experience level, and budget
- **AM/PM/Weekly Routines** — organized by time of day with step ordering
- **Pregnancy Safety** — automatically excludes retinoids and flags other concerns
- **Email/SMS Capture** — Klaviyo integration with ready-to-use templates
- **Framer Motion Animations** — smooth transitions and micro-interactions
- **Responsive Design** — works on all devices with Tailwind CSS
- **URL-based Results Sharing** — results encoded with btoa/atob (no Buffer dependency)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Email/SMS:** Klaviyo API
- **Encoding:** btoa/atob (browser-safe, no Buffer)
- **Deployment:** Vercel-ready

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KLAVIYO_API_KEY` | No | Klaviyo private API key for email/SMS |
| `KLAVIYO_LIST_ID` | No | Klaviyo list ID to subscribe users to |
| `NEXT_PUBLIC_SITE_URL` | No | Your deployed site URL |

> **Note:** The app works fully without Klaviyo configured. The email capture will log to console in development mode.

## Project Structure

```
the-ordinary-answer/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with fonts & metadata
│   │   ├── page.tsx            # Landing page
│   │   ├── quiz/
│   │   │   └── page.tsx        # Quiz flow page
│   │   ├── results/
│   │   │   └── page.tsx        # Results display page
│   │   └── api/
│   │       ├── recommend/
│   │       │   └── route.ts    # Recommendation API endpoint
│   │       └── klaviyo/
│   │           └── route.ts    # Klaviyo integration endpoint
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── ProgressBar.tsx # Quiz progress indicator
│   │   │   └── QuestionCard.tsx# Individual question component
│   │   ├── ui/
│   │   │   ├── ProductCard.tsx # Product recommendation card
│   │   │   ├── ConflictWarnings.tsx # Ingredient conflict alerts
│   │   │   └── EmailCapture.tsx    # Email/SMS capture form
│   │   └── layout/
│   │       └── Header.tsx      # Site header
│   ├── lib/
│   │   ├── utils.ts            # Utility functions (cn, encoding, etc.)
│   │   └── recommendation-engine.ts # Core recommendation algorithm
│   ├── data/
│   │   ├── products.ts         # 71-product catalog
│   │   ├── questions.ts        # 15 quiz questions
│   │   └── conflicts.ts        # Ingredient conflict rules
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── styles/
│       └── globals.css         # Global styles + Tailwind
├── klaviyo-templates/
│   ├── quiz-results-email.html # Klaviyo email template
│   └── sms-templates.txt       # Klaviyo SMS templates (5 messages)
├── public/
│   └── ...                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

## Deployment to Vercel

1. Push code to GitHub (see instructions below)
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" → Import your repository
4. Vercel auto-detects Next.js — no configuration needed
5. Add environment variables if using Klaviyo
6. Click "Deploy"

Your site will be live at `your-project.vercel.app` in about 60 seconds.

## License

Educational project. Not affiliated with The Ordinary / DECIEM.
