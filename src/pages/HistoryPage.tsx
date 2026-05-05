import { useMeals } from '@/hooks/useMeals';
import { getHealthScoreColor } from '@/lib/gemini';
import { History, Utensils, Trash2, Calendar, Flame, Search } from 'lucide-react';
import { useState } from 'react';

export default function HistoryPage() {
  const { meals, isLoading, deleteMeal } = useMeals();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = meals.filter((m) => {
    const matchesSearch = !search || m.food_name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || m.meal_type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedByDate: Record<string, typeof meals> = {};
  filtered.forEach((meal) => {
    const date = meal.logged_at?.split('T')[0] || 'unknown';
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(meal);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📋 Food History</h1>
        <p className="page-subtitle">View and manage your logged meals</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search meals..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
        <span className="badge badge-success">{filtered.length} meals</span>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <History size={40} style={{ margin: '0 auto 1rem', opacity: 0.3, color: 'var(--text-tertiary)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No meals found</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{search ? 'Try a different search term' : 'Start by analyzing a food photo!'}</p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(groupedByDate).map(([date, dateMeals]) => (
            <div key={date}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Calendar size={16} color="var(--color-primary)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {new Date(date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  ({Math.round(dateMeals.reduce((s, m) => s + (m.nutrition?.calories || 0), 0))} kcal total)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dateMeals.map((meal) => (
                  <div key={meal.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: `${getHealthScoreColor(meal.health_score)}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Utensils size={20} color={getHealthScoreColor(meal.health_score)} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meal.food_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {meal.meal_type} • {new Date(meal.logged_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })} • Score: {meal.health_score}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span><Flame size={13} style={{ display: 'inline', verticalAlign: -2 }} /> {Math.round(meal.nutrition?.calories || 0)}</span>
                        <span style={{ color: '#10b981' }}>P:{Math.round(meal.nutrition?.protein || 0)}g</span>
                        <span style={{ color: '#3b82f6' }}>C:{Math.round(meal.nutrition?.carbs || 0)}g</span>
                        <span style={{ color: '#f59e0b' }}>F:{Math.round(meal.nutrition?.fat || 0)}g</span>
                      </div>
                      <button onClick={() => { if (confirm('Delete this meal?')) deleteMeal(meal.id); }} className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
