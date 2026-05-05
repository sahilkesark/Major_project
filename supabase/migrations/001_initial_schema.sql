-- =============================================
-- NutriSight Pro – Supabase Database Migration
-- =============================================
-- Run this in your Supabase SQL Editor to set up the complete schema.

-- 1. PROFILES TABLE (extends Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  height_cm numeric,
  weight_kg numeric,
  activity_level text default 'moderate' check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text default 'maintain' check (goal in ('lose', 'maintain', 'gain')),
  diet_preference text default 'any' check (diet_preference in ('any', 'vegetarian', 'vegan', 'keto', 'paleo')),
  daily_calorie_goal integer default 2000,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. MEALS TABLE (logged food entries with nutrition data)
create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  food_name text not null,
  description text,
  image_url text,
  image_base64 text,
  nutrition jsonb default '{}'::jsonb,
  health_score integer default 0,
  health_label text default 'average',
  ingredients jsonb default '[]'::jsonb,
  suggestions jsonb default '[]'::jsonb,
  meal_type text default 'lunch' check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. GOALS TABLE (daily nutrition targets)
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  calorie_goal integer default 2000,
  protein_goal integer,
  carbs_goal integer,
  fat_goal integer,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (user_id, date)
);

-- 4. MEAL_PLANS TABLE (AI-generated plans)
create table if not exists public.meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  goal text,
  diet_preference text,
  calorie_target integer,
  plan_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. WEIGHT_LOGS TABLE (tracking weight over time)
create table if not exists public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  weight_kg numeric not null,
  logged_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================
-- INDEXES (for query performance)
-- =============================================
create index if not exists idx_meals_user_id on public.meals (user_id);
create index if not exists idx_meals_logged_at on public.meals (logged_at desc);
create index if not exists idx_meals_user_date on public.meals (user_id, logged_at);
create index if not exists idx_goals_user_date on public.goals (user_id, date);
create index if not exists idx_meal_plans_user on public.meal_plans (user_id);
create index if not exists idx_weight_logs_user on public.weight_logs (user_id, logged_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.goals enable row level security;
alter table public.meal_plans enable row level security;
alter table public.weight_logs enable row level security;

-- Profiles: Users can only read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Meals: Users can CRUD their own meals
create policy "Users can view own meals" on public.meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on public.meals for insert with check (auth.uid() = user_id);
create policy "Users can update own meals" on public.meals for update using (auth.uid() = user_id);
create policy "Users can delete own meals" on public.meals for delete using (auth.uid() = user_id);

-- Goals: Users can CRUD their own goals
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);

-- Meal Plans: Users can CRUD their own plans
create policy "Users can view own plans" on public.meal_plans for select using (auth.uid() = user_id);
create policy "Users can insert own plans" on public.meal_plans for insert with check (auth.uid() = user_id);
create policy "Users can delete own plans" on public.meal_plans for delete using (auth.uid() = user_id);

-- Weight Logs: Users can CRUD their own logs
create policy "Users can view own weight" on public.weight_logs for select using (auth.uid() = user_id);
create policy "Users can insert own weight" on public.weight_logs for insert with check (auth.uid() = user_id);
create policy "Users can delete own weight" on public.weight_logs for delete using (auth.uid() = user_id);

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
