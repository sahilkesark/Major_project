import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateProfile, user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    height_cm: profile?.height_cm || '',
    weight_kg: profile?.weight_kg || '',
    activity_level: profile?.activity_level || 'moderate',
    goal: profile?.goal || 'maintain',
    diet_preference: profile?.diet_preference || 'any',
    daily_calorie_goal: profile?.daily_calorie_goal || 2000,
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      await updateProfile({
        full_name: form.full_name as string,
        age: Number(form.age) || undefined,
        gender: form.gender as any,
        height_cm: Number(form.height_cm) || undefined,
        weight_kg: Number(form.weight_kg) || undefined,
        activity_level: form.activity_level as any,
        goal: form.goal as any,
        diet_preference: form.diet_preference as any,
        daily_calorie_goal: Number(form.daily_calorie_goal),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const fieldStyle = { display: 'block', fontSize: '0.8rem' as const, fontWeight: 500 as const, color: 'var(--text-secondary)', marginBottom: '0.375rem' };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👤 Profile</h1>
        <p className="page-subtitle">Manage your profile and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', color: '#fff', fontWeight: 800 }}>
            {(form.full_name as string)?.[0]?.toUpperCase() || 'U'}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{form.full_name || 'Your Name'}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>{user?.email}</p>
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem', justifyContent: 'center' }}>
            {form.goal && <span className="badge badge-success">{form.goal === 'lose' ? '🔥 Lose Weight' : form.goal === 'gain' ? '💪 Gain Weight' : '⚖️ Maintain'}</span>}
            {form.diet_preference && form.diet_preference !== 'any' && <span className="badge badge-warning">{form.diet_preference}</span>}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>{form.daily_calorie_goal}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Daily Calorie Goal</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Edit Profile
          </h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={fieldStyle}>Full Name</label><input className="input" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div><label style={fieldStyle}>Age</label><input className="input" type="number" min={10} max={120} value={form.age} onChange={(e) => update('age', e.target.value)} /></div>
              <div><label style={fieldStyle}>Height (cm)</label><input className="input" type="number" min={50} max={300} value={form.height_cm} onChange={(e) => update('height_cm', e.target.value)} /></div>
              <div><label style={fieldStyle}>Weight (kg)</label><input className="input" type="number" min={20} max={500} value={form.weight_kg} onChange={(e) => update('weight_kg', e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={fieldStyle}>Gender</label>
                <select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div><label style={fieldStyle}>Activity Level</label>
                <select className="input" value={form.activity_level} onChange={(e) => update('activity_level', e.target.value)}>
                  <option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very_active">Very Active</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div><label style={fieldStyle}>Goal</label>
                <select className="input" value={form.goal} onChange={(e) => update('goal', e.target.value)}>
                  <option value="lose">Lose Weight</option><option value="maintain">Maintain</option><option value="gain">Gain Weight</option>
                </select>
              </div>
              <div><label style={fieldStyle}>Diet</label>
                <select className="input" value={form.diet_preference} onChange={(e) => update('diet_preference', e.target.value)}>
                  <option value="any">Any</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="keto">Keto</option><option value="paleo">Paleo</option>
                </select>
              </div>
              <div><label style={fieldStyle}>Calorie Goal</label><input className="input" type="number" min={500} max={10000} step={50} value={form.daily_calorie_goal} onChange={(e) => update('daily_calorie_goal', e.target.value)} /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }} disabled={saving}>
              {saved ? <><CheckCircle2 size={18} /> Saved!</> : saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={18} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
