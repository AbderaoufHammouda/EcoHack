# YouthLink Béjaïa 🌿

> **La plateforme calme qui connecte la jeunesse de Béjaïa à ce qui compte.**  
> Built at **ECOHACK Béjaïa 2026** in partnership with **ODEJ Béjaïa**.

---

## 🎯 About

YouthLink Béjaïa is a lightweight, data-efficient web platform that connects young people across the 52 communes of the Béjaïa wilaya to the **68 ODEJ youth structures** — including youth houses (Maisons de Jeunes), sports complexes (CSP), youth homes (Beit Ech-Chabab), and more.

The platform is built with **eco-design** at its core: it weighs under **210 KB**, emits only **0.08 g CO₂ per visit**, and works on slow 3G connections with offline support.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Territory Map** | Interactive map of all 68 ODEJ structures across 52 communes |
| 🔍 **Explorer** | Browse events, workshops, volunteering, scholarships & clubs |
| 🏆 **Gamification** | XP system, daily streaks, badges and a live leaderboard |
| 📋 **Applications** | Submit motivation letters directly to ODEJ coordinators |
| 👤 **Profile** | Skills, certifications and progression tracking |
| 🌐 **3 Languages** | French · العربية · Kabyle (Tamazight) |
| 🌙 **Dark / Light** | System-aware theme with manual toggle |
| ⚡ **Offline-ready** | Service Worker + local cache for low-connectivity zones |
| 🛡️ **Admin Panel** | Full ODEJ staff dashboard — manage events, review applications, track impact |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) + React 19 |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 + custom design system |
| Database | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Build | Vite 7 |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh/)
- A Supabase project (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/AbderaoufHammouda/EcoHack.git
cd EcoHack
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📁 Project Structure

```
src/
├── assets/          # Static images (hero, map, etc.)
├── components/
│   ├── site/        # Landing page sections (Nav, Hero, Discover, MapSection, Eco, Voices, Footer)
│   └── ui/          # Reusable UI primitives (shadcn/ui)
├── contexts/
│   ├── auth-context.tsx   # Authentication state
│   └── lang-context.tsx   # Multilingual (FR / AR / TZM)
├── hooks/           # Custom React hooks
├── lib/
│   ├── gamification.ts    # XP, badges, streaks, leaderboard
│   ├── store.ts           # Supabase data layer
│   ├── supabase.ts        # Supabase client
│   └── error-reporting.ts # Error reporting utility
├── routes/
│   ├── __root.tsx   # App shell, providers
│   ├── index.tsx    # Landing page
│   ├── login.tsx    # Login
│   ├── signup.tsx   # 3-step onboarding (account → skills → certifications)
│   ├── app.tsx      # User dashboard (Explorer, Tasks, Leaderboard, Progression, Profile)
│   └── admin.tsx    # ODEJ admin panel
└── styles.css       # Design system (dark-first, eco-inspired)
```

---

## 🌿 Eco-design Metrics

| Metric | Value | vs. Average |
|---|---|---|
| Page weight | 210 KB | 91% lighter |
| CO₂ per visit | 0.08 g | 92% less |
| First paint (3G) | 0.6 s | 88% faster |
| Offline support | ✅ Yes | — |

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |

See [`.env.example`](.env.example) for the full list.

---

## 🤝 ODEJ Béjaïa Partnership

This project was built with real data provided by **ODEJ Béjaïa** (Office de Développement de l'Économie de Jeunesse) covering:

- **68 youth structures** (9 AJ · 19 CSP · 35 MJ · 2 SPD · 2 Camps · 1 CLS)
- **52 / 52 communes** of the Béjaïa wilaya
- Real facility names, locations and capacities

---

## 📜 License

MIT — built openly at ECOHACK Béjaïa 2026.

---

<div align="center">
  <strong>YouthLink<span style="color:#78c85a">.</span>bejaia</strong> &nbsp;·&nbsp; ECOHACK 2026 &nbsp;·&nbsp; Béjaïa, Algérie 🇩🇿
</div>
