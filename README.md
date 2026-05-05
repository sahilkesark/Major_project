# NutriSight Pro – Smart Diet & Nutrition Analyzer

> AI-powered nutrition tracking, food image analysis, and personalized meal planning.  
> Built by **S gang** 🚀

---

## 🎯 Features

- **AI Food Image Analysis** – Upload food photos to instantly detect items, estimate calories, macronutrients, and get ingredient breakdowns using Google Gemini Vision AI
- **Health Score System** – 0-100 score with color indicators based on nutritional quality
- **Dashboard & Analytics** – Daily calorie tracking, weekly nutrition charts (bar + pie), macro distribution
- **Food History** – Search, filter, and review all logged meals with full nutrition data
- **Daily Goal Tracker** – Set calorie goals with animated progress ring
- **AI Meal Plan Generator** – Multi-day plans based on goal, diet preference, and calorie target
- **User Authentication** – Secure sign up/in via Supabase Auth with JWT tokens
- **Dark/Light Mode** – Toggle between themes with smooth transitions
- **Responsive Design** – Works on desktop, tablet, and mobile

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| State | TanStack React Query |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| AI/ML | Google Gemini 2.0 Flash |
| Routing | React Router v6 |

---

## 📁 Project Structure

```
maj_project/
├── index.html                    # Entry point
├── vite.config.ts                # Vite + Tailwind config
├── .env.example                  # Environment variables template
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
├── src/
│   ├── main.tsx                  # React root
│   ├── App.tsx                   # Routes & providers
│   ├── index.css                 # Design system & tokens
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   └── gemini.ts             # Gemini AI integration
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Auth state management
│   │   └── ThemeContext.tsx       # Theme management
│   ├── hooks/
│   │   ├── useMeals.ts           # Meal CRUD operations
│   │   ├── useDailyGoals.ts      # Goal tracking
│   │   └── useAnalytics.ts       # Weekly analytics
│   ├── components/
│   │   ├── Layout.tsx            # Main layout wrapper
│   │   ├── Sidebar.tsx           # Collapsible sidebar nav
│   │   └── ProtectedRoute.tsx    # Auth guard
│   └── pages/
│       ├── LoginPage.tsx         # Login / Sign up
│       ├── DashboardPage.tsx     # Main dashboard
│       ├── AnalyzePage.tsx       # AI food analysis
│       ├── HistoryPage.tsx       # Meal history
│       ├── MealPlannerPage.tsx   # AI meal planner
│       ├── GoalsPage.tsx         # Daily goal tracker
│       └── ProfilePage.tsx       # User profile
```

---

## ⚙️ Setup Guide

### 1. Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key for Gemini

### 2. Clone & Install
```bash
cd maj_project
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Set Up Database
1. Go to your Supabase project → SQL Editor
2. Copy and run `supabase/migrations/001_initial_schema.sql`
3. This creates all tables, indexes, RLS policies, and triggers

### 5. Run Development Server
```bash
npm run dev
```
Open http://localhost:8080

---

## 🗄️ Database Design

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (extends Supabase Auth) |
| `meals` | Logged food entries with nutrition JSON |
| `goals` | Daily calorie/macro targets |
| `meal_plans` | AI-generated meal plans |
| `weight_logs` | Weight tracking over time |

All tables have **Row Level Security (RLS)** enabled — users can only access their own data.

---

## 🚀 Deployment

### Frontend (Vercel / Netlify)
```bash
npm run build  # Outputs to dist/
```
Deploy the `dist` folder to any static host.

### Backend
Supabase handles the backend automatically:
- Database: Managed PostgreSQL
- Auth: Built-in auth service
- Functions: Edge functions (if needed)

---

## 📝 Credits

Built by **S gang** for NutriSight Pro © 2025
