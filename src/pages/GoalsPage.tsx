import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/hooks/useMeals';
import { Target, Flame, Beef, Wheat, Droplets, Edit3, Check } from 'lucide-react';
import { useState } from 'react';

export default function GoalsPage() {
  const { profile } = useAuth();
  const { todayGoal, updateGoal } = useDailyGoals();
  const { meals } = useMeals();
  const [editing, setEditing] = useState(false);
  const [newGoal, setNewGoal] = useState(todayGoal?.calorie_goal || profile?.daily_calorie_goal || 2000);

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.logged_at?.startsWith(today));

  const consumed = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.nutrition?.calories || 0),
      protein: acc.protein + (m.nutrition?.protein || 0),
      carbs: acc.carbs + (m.nutrition?.carbs || 0),
      fat: acc.fat + (m.nutrition?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calorieGoal = todayGoal?.calorie_goal || profile?.daily_calorie_goal || 2000;
  const calPercent = Math.min((consumed.calories / calorieGoal) * 100, 100);
  const remaining = Math.max(calorieGoal - consumed.calories, 0);

  const handleSaveGoal = async () => {
    await updateGoal(newGoal);
    setEditing(false);
  };

  const macros = [
    { label: 'Protein', consumed: Math.round(consumed.protein), goal: 150, unit: 'g', icon: Beef, color: '#10b981' },
    { label: 'Carbs', consumed: Math.round(consumed.carbs), goal: 250, unit: 'g', icon: Wheat, color: '#3b82f6' },
    { label: 'Fat', consumed: Math.round(consumed.fat), goal: 65, unit: 'g', icon: Droplets, color: '#f59e0b' },
  ];

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">🎯 Daily Goals</h1>
        <p className="page-subtitle">Track your daily nutrition progress</p>
      </div>

      {/* Main Calorie Ring */}
      <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 1.5rem' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="var(--border-default)" strokeWidth="12" />
            <circle
              cx="100" cy="100" r="85" fill="none"
              stroke={calPercent > 90 ? '#ef4444' : calPercent > 70 ? '#f59e0b' : 'var(--color-primary)'}
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${(calPercent / 100) * 534} 534`}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} color={calPercent > 90 ? '#ef4444' : 'var(--color-primary)'} />
            <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>{Math.round(consumed.calories)}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>of {calorieGoal} kcal</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{Math.round(remaining)}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Remaining</p>
          </div>
          <div style={{ width: 1, background: 'var(--border-default)' }} />
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{todayMeals.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Meals Logged</p>
          </div>
        </div>

        {/* Edit Goal */}
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {editing ? (
            <>
              <input className="input" type="number" min={500} max={10000} step={50} value={newGoal} onChange={(e) => setNewGoal(Number(e.target.value))} style={{ width: 120, textAlign: 'center' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>kcal</span>
              <button className="btn btn-primary btn-sm" onClick={handleSaveGoal}><Check size={14} /> Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => { setNewGoal(calorieGoal); setEditing(true); }}>
              <Edit3 size={14} /> Edit Goal
            </button>
          )}
        </div>
      </div>

      {/* Macro Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {macros.map((macro) => {
          const pct = Math.min((macro.consumed / macro.goal) * 100, 100);
          return (
            <div key={macro.label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${macro.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <macro.icon size={16} color={macro.color} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{macro.label}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{macro.consumed} / {macro.goal}{macro.unit}</span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${macro.color}, ${macro.color}aa)` }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>{Math.round(pct)}% of daily goal</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
