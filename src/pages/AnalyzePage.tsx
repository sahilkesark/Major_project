import { useState, useRef, useCallback } from 'react';
import { analyzeFoodImage, getHealthScoreColor, getHealthBadgeClass } from '@/lib/gemini';
import { useMeals } from '@/hooks/useMeals';
import type { FoodAnalysisResult } from '@/types';
import { Upload, Camera, Loader2, Sparkles, CheckCircle2, AlertCircle, Flame, Beef, Wheat, Droplets, Leaf, X, Save, RotateCcw, Info } from 'lucide-react';

export default function AnalyzePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logMeal } = useMeals();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { const b64 = e.target?.result as string; setImagePreview(b64); setImageBase64(b64); setResult(null); setError(''); setSaved(false); };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true); setError(''); setResult(null);
    try { setResult(await analyzeFoodImage(imageBase64)); } catch (err: any) { setError(err.message || 'Failed to analyze image'); } finally { setAnalyzing(false); }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await logMeal({ food_name: result.food_name, description: result.description, image_base64: imageBase64 || undefined, nutrition: result.total_nutrition, health_score: result.health_score, health_label: result.health_label, ingredients: result.ingredients, suggestions: result.suggestions, meal_type: mealType });
      setSaved(true);
    } catch (err: any) { setError(err.message || 'Failed to save meal'); } finally { setSaving(false); }
  };

  const handleReset = () => { setImagePreview(null); setImageBase64(null); setResult(null); setError(''); setSaved(false); };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🔍 Analyze Food</h1>
        <p className="page-subtitle">Upload a food image for instant AI-powered nutritional analysis</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!imagePreview ? (
            <div className="card" onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', border: dragActive ? '2px dashed var(--color-primary)' : '2px dashed var(--border-default)', background: dragActive ? 'var(--color-primary-50)' : 'var(--bg-card)', transition: 'all 0.2s ease' }}>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Upload size={28} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Drop your food image here</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>or click to browse • JPG, PNG, WebP</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}><Upload size={16} /> Upload</button>
                <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}><Camera size={16} /> Camera</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={imagePreview} alt="Food" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
                <button onClick={handleReset} className="btn btn-icon" style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 'var(--radius-full)', width: 32, height: 32 }}><X size={16} /></button>
              </div>
              <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {!result ? (
                  <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={analyzing} style={{ flex: 1 }}>
                    {analyzing ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Sparkles size={18} /> Analyze with AI</>}
                  </button>
                ) : (
                  <>
                    <select value={mealType} onChange={(e) => setMealType(e.target.value as any)} className="input" style={{ width: 'auto' }}>
                      <option value="breakfast">🌅 Breakfast</option><option value="lunch">☀️ Lunch</option><option value="dinner">🌙 Dinner</option><option value="snack">🍿 Snack</option>
                    </select>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving || saved} style={{ flex: 1 }}>
                      {saved ? <><CheckCircle2 size={16} /> Saved!</> : saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={16} /> Log Meal</>}
                    </button>
                    <button className="btn btn-secondary btn-icon" onClick={handleReset}><RotateCcw size={16} /></button>
                  </>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="card animate-scale-in" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <AlertCircle size={20} color="var(--color-danger)" />
              <div><p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)' }}>Analysis Failed</p><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{error}</p></div>
            </div>
          )}
        </div>

        {result && (
          <div className="animate-slide-in-right" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Food Name & Health Score */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{result.food_name}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{result.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${getHealthBadgeClass(result.health_label)}`}>{result.health_label}</span>
                    {result.is_processed && <span className="badge badge-warning">Processed</span>}
                    <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{Math.round(result.confidence * 100)}% confidence</span>
                  </div>
                </div>
                <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', border: `3px solid ${getHealthScoreColor(result.health_score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: getHealthScoreColor(result.health_score) }}>{result.health_score}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>score</span>
                </div>
              </div>
            </div>

            {/* 📐 Volume & Portion Estimation */}
            {result.volume_estimation && (
              <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid var(--color-info)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-info)' }}>
                  📐 Portion Estimation Method
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  {result.volume_estimation.methodology}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{result.volume_estimation.container_type}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Container Type</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{result.volume_estimation.estimated_diameter_cm}cm</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Est. Diameter</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{result.volume_estimation.fill_percentage}%</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Fill Level</p>
                  </div>
                </div>
                {result.volume_estimation.reference_objects?.length > 0 && (
                  <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Reference objects:</span>
                    {result.volume_estimation.reference_objects.map((obj, i) => (
                      <span key={i} style={{ padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(59,130,246,0.1)', fontSize: '0.7rem', color: 'var(--color-info)' }}>{obj}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 🍽️ Individual Food Items (per-item nutrition) */}
            {result.items?.length > 0 && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🍽️ Individual Item Nutrition ({result.items.length} items)
                  </span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.items.map((item, i) => (
                    <div key={i} style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {item.quantity} {item.estimated_weight_grams ? `• ~${item.estimated_weight_grams}g` : ''}
                          </p>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>
                          {Math.round(item.nutrition.calories)} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>kcal</span>
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
                        {[
                          { label: 'Protein', value: Math.round(item.nutrition.protein), color: '#10b981' },
                          { label: 'Carbs', value: Math.round(item.nutrition.carbs), color: '#3b82f6' },
                          { label: 'Fat', value: Math.round(item.nutrition.fat), color: '#f59e0b' },
                          { label: 'Fiber', value: Math.round(item.nutrition.fiber), color: '#8b5cf6' },
                        ].map((m) => (
                          <div key={m.label} style={{ textAlign: 'center', padding: '0.375rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: m.color }}>{m.value}g</p>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📊 Total Plate Nutrition */}
            <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid var(--color-primary)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>📊 Total Plate Nutrition</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {[{ label: 'Calories', value: Math.round(result.total_nutrition.calories), unit: 'kcal', icon: Flame, color: '#ef4444' }, { label: 'Protein', value: Math.round(result.total_nutrition.protein), unit: 'g', icon: Beef, color: '#10b981' }, { label: 'Carbs', value: Math.round(result.total_nutrition.carbs), unit: 'g', icon: Wheat, color: '#3b82f6' }, { label: 'Fat', value: Math.round(result.total_nutrition.fat), unit: 'g', icon: Droplets, color: '#f59e0b' }].map((item) => (
                  <div key={item.label} style={{ padding: '0.75rem', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <item.icon size={18} color={item.color} style={{ margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{item.value}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{item.unit} {item.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                {[{ label: 'Fiber', value: `${Math.round(result.total_nutrition.fiber)}g` }, { label: 'Sodium', value: `${Math.round(result.total_nutrition.sodium)}mg` }, { label: 'Sugar', value: `${Math.round(result.total_nutrition.sugar || 0)}g` }].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center', padding: '0.375rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.value}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            {result.ingredients?.length > 0 && (
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}><Leaf size={16} color="var(--color-primary)" /> Ingredients</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {result.ingredients.map((ing, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-secondary)', fontSize: '0.75rem', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>{ing.name} ({ing.estimated_amount})</span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}><Info size={16} color="var(--color-info)" /> Suggestions</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.suggestions.map((s, i) => (<li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><CheckCircle2 size={14} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />{s}</li>))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
