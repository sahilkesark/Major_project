import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { DailyNutritionSummary, WeeklyStats } from '@/types';

/**
 * Hook for computing dashboard analytics from meal history.
 */
export function useAnalytics() {
  const { user } = useAuth();

  // Get last 7 days of nutrition data for charts
  const weeklyQuery = useQuery({
    queryKey: ['analytics', 'weekly', user?.id],
    queryFn: async (): Promise<WeeklyStats> => {
      if (!user) throw new Error('Not authenticated');

      const days: DailyNutritionSummary[] = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const { data: meals } = await supabase
          .from('meals')
          .select('nutrition')
          .eq('user_id', user.id)
          .gte('logged_at', `${dateStr}T00:00:00`)
          .lte('logged_at', `${dateStr}T23:59:59`);

        const totals = (meals || []).reduce(
          (acc, m) => {
            const n = m.nutrition as any;
            return {
              calories: acc.calories + (n?.calories || 0),
              protein: acc.protein + (n?.protein || 0),
              carbs: acc.carbs + (n?.carbs || 0),
              fat: acc.fat + (n?.fat || 0),
            };
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        days.push({
          date: dateStr,
          total_calories: Math.round(totals.calories),
          total_protein: Math.round(totals.protein),
          total_carbs: Math.round(totals.carbs),
          total_fat: Math.round(totals.fat),
          meal_count: meals?.length || 0,
        });
      }

      const activeDays = days.filter((d) => d.meal_count > 0);
      const count = activeDays.length || 1;

      return {
        avg_calories: Math.round(activeDays.reduce((s, d) => s + d.total_calories, 0) / count),
        avg_protein: Math.round(activeDays.reduce((s, d) => s + d.total_protein, 0) / count),
        avg_carbs: Math.round(activeDays.reduce((s, d) => s + d.total_carbs, 0) / count),
        avg_fat: Math.round(activeDays.reduce((s, d) => s + d.total_fat, 0) / count),
        total_meals: days.reduce((s, d) => s + d.meal_count, 0),
        daily_data: days,
      };
    },
    enabled: !!user,
    staleTime: 60_000, // Cache for 1 minute
  });

  return {
    weeklyStats: weeklyQuery.data,
    isLoading: weeklyQuery.isLoading,
    error: weeklyQuery.error,
  };
}
