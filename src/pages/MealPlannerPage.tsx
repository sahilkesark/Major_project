import { useState } from 'react';
import { generateMealPlan } from '@/lib/gemini';
import { useAuth } from '@/contexts/AuthContext';
import type { DayPlan } from '@/types';
import { CalendarDays, Loader2, Sparkles, Utensils, Flame, ChevronDown, ChevronUp } from 'lucide-react';

export default function MealPlannerPage() {
  const { profile } = useAuth();
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>(profile?.goal || 'maintain');
  const [dietPref, setDietPref] = useState<string>(profile?.diet_preference || 'any');
  const [calorieTarget, setCalorieTarget] = useState(profile?.daily_calorie_goal || 2000);
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDays, setPlanDays] = useState<DayPlan[]>([]);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const handleGenerate = async () => {
    setLoading(true); setError(''); setPlanDays([]);
    try {
      const result = await generateMealPlan({ goal, dietPreference: dietPref, calorieTarget, days });
      setPlanTitle(result.title);
      setPlanDays(result.days);
      setExpandedDay(0);
    } catch (err: any) { setError(err.message || 'Failed to generate meal plan'); } finally { setLoading(false); }
  };

  const mealTypeEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🍽️ AI Meal Planner</h1>
        <p className="page-subtitle">Generate personalized meal plans powered by AI</p>
      </div>

      {/* Configuration Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Configure Your Plan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Goal</label>
            <select className="input" value={goal} onChange={(e) => setGoal(e.target.value as any)}>
              <option value="lose">🔥 Weight Loss</option>
              <option value="maintain">⚖️ Maintain Weight</option>
              <option value="gain">💪 Weight Gain</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Diet Preference</label>
            <select className="input" value={dietPref} onChange={(e) => setDietPref(e.target.value)}>
              <option value="any">Any</option>
              <option value="vegetarian">🥬 Vegetarian</option>
              <option value="vegan">🌱 Vegan</option>
              <option value="keto">🥑 Keto</option>
              <option value="paleo">🥩 Paleo</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Calorie Target</label>
            <input className="input" type="number" min={1000} max={5000} step={100} value={calorieTarget} onChange={(e) => setCalorieTarget(Number(e.target.value))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Number of Days</label>
            <select className="input" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {[1, 2, 3, 5, 7].map((d) => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ marginTop: '1.25rem', width: '100%' }} onClick={handleGenerate} disabled={loading}>
          {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating Plan...</> : <><Sparkles size={18} /> Generate Meal Plan</>}
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* Generated Plan */}
      {planDays.length > 0 && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CalendarDays size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{planTitle}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {planDays.map((day, idx) => (
              <div key={idx} className="card" style={{ overflow: 'hidden' }}>
                <button onClick={() => setExpandedDay(expandedDay === idx ? null : idx)} style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Utensils size={18} color="var(--color-primary)" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{day.day_label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <Flame size={12} style={{ display: 'inline', verticalAlign: -1 }} /> {Math.round(day.total_nutrition?.calories || 0)} kcal • {day.meals?.length || 0} meals
                      </p>
                    </div>
                  </div>
                  {expandedDay === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {expandedDay === idx && (
                  <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {day.meals?.map((meal, mi) => (
                      <div key={mi} style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{mealTypeEmoji[meal.meal_type] || '🍽️'} {meal.name}</h4>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{Math.round(meal.nutrition?.calories || 0)} kcal</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{meal.description}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          <span style={{ color: '#10b981' }}>P: {Math.round(meal.nutrition?.protein || 0)}g</span>
                          <span style={{ color: '#3b82f6' }}>C: {Math.round(meal.nutrition?.carbs || 0)}g</span>
                          <span style={{ color: '#f59e0b' }}>F: {Math.round(meal.nutrition?.fat || 0)}g</span>
                        </div>
                        {meal.recipe_steps && meal.recipe_steps.length > 0 && (
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem' }}>Steps:</p>
                            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {meal.recipe_steps.map((step, si) => <li key={si}>{step}</li>)}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
