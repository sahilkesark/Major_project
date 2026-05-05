import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useMeals } from '@/hooks/useMeals';
import { getHealthScoreColor } from '@/lib/gemini';
import {
  Flame,
  Beef,
  Wheat,
  Droplets,
  TrendingUp,
  Utensils,
  Target,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const MACRO_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function DashboardPage() {
  const { profile } = useAuth();
  const { weeklyStats, isLoading: analyticsLoading } = useAnalytics();
  const { todayGoal } = useDailyGoals();
  const { meals } = useMeals();

  // Today's meals
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.logged_at?.startsWith(today));

  // Compute today's totals
  const todayTotals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.nutrition?.calories || 0),
      protein: acc.protein + (m.nutrition?.protein || 0),
      carbs: acc.carbs + (m.nutrition?.carbs || 0),
      fat: acc.fat + (m.nutrition?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calorieGoal = todayGoal?.calorie_goal || profile?.daily_calorie_goal || 2000;
  const calorieProgress = Math.min((todayTotals.calories / calorieGoal) * 100, 100);

  // Macro distribution for pie chart
  const macroData = [
    { name: 'Protein', value: Math.round(todayTotals.protein), unit: 'g' },
    { name: 'Carbs', value: Math.round(todayTotals.carbs), unit: 'g' },
    { name: 'Fat', value: Math.round(todayTotals.fat), unit: 'g' },
  ].filter((d) => d.value > 0);

  // Chart data for weekly bars
  const chartData = weeklyStats?.daily_data.map((d) => ({
    name: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    Calories: d.total_calories,
    Protein: d.total_protein,
    Carbs: d.total_carbs,
    Fat: d.total_fat,
  })) || [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="page-container stagger-children">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {greeting()} 👋
          </p>
          <h1 className="page-title">{profile?.full_name || 'User'}</h1>
          <p className="page-subtitle">Here's your nutrition overview for today</p>
        </div>
        <div className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem' }}>
          <Zap size={14} /> {todayMeals.length} meals logged today
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Calories */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Calories Today</span>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-lg)',
              background: 'rgba(239, 68, 68, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Flame size={18} color="#ef4444" />
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {Math.round(todayTotals.calories)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ {calorieGoal} kcal goal</p>
          <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${calorieProgress}%`,
                background: calorieProgress > 90
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
              }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Protein</span>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-lg)',
              background: 'rgba(16, 185, 129, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Beef size={18} color="#10b981" />
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {Math.round(todayTotals.protein)}g
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Avg: {weeklyStats?.avg_protein || 0}g / day
          </p>
        </div>

        {/* Carbs */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Carbs</span>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-lg)',
              background: 'rgba(59, 130, 246, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Wheat size={18} color="#3b82f6" />
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {Math.round(todayTotals.carbs)}g
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Avg: {weeklyStats?.avg_carbs || 0}g / day
          </p>
        </div>

        {/* Fat */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Fat</span>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-lg)',
              background: 'rgba(245, 158, 11, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Droplets size={18} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {Math.round(todayTotals.fat)}g
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Avg: {weeklyStats?.avg_fat || 0}g / day
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Weekly Calorie Bar Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Weekly Calorie Intake</h3>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Bar dataKey="Calories" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                No meal data yet. Start logging meals!
              </div>
            )}
          </div>
        </div>

        {/* Macro Pie Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Utensils size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Today's Macro Distribution</h3>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            {macroData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}g`}
                  >
                    {macroData.map((_, i) => (
                      <Cell key={i} fill={MACRO_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}g`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Log a meal to see macro breakdown
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Meals */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Meals</h3>
          </div>
          {meals.length > 0 && (
            <span className="badge badge-success">{meals.length} total</span>
          )}
        </div>
        {todayMeals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {todayMeals.slice(0, 5).map((meal) => (
              <div
                key={meal.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: `${getHealthScoreColor(meal.health_score)}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Utensils size={18} color={getHealthScoreColor(meal.health_score)} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {meal.food_name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {meal.meal_type} • {new Date(meal.logged_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {Math.round(meal.nutrition?.calories || 0)} kcal
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    Score: {meal.health_score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
            <Utensils size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.875rem' }}>No meals logged today</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Upload a food photo to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
