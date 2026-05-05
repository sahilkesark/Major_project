import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { DailyGoal } from '@/types';

/**
 * Hook for managing daily calorie/macro goals and tracking progress.
 */
export function useDailyGoals() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  // Get today's goal & progress
  const todayGoalQuery = useQuery({
    queryKey: ['daily-goals', user?.id, today],
    queryFn: async (): Promise<DailyGoal | null> => {
      if (!user) return null;

      // First try to get existing goal for today
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (data) return data as DailyGoal;

      // If no goal exists, compute consumed from meals
      const { data: meals } = await supabase
        .from('meals')
        .select('nutrition')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      const consumed = (meals || []).reduce(
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

      return {
        id: '',
        user_id: user.id,
        date: today,
        calorie_goal: profile?.daily_calorie_goal || 2000,
        calories_consumed: consumed.calories,
        protein_consumed: consumed.protein,
        carbs_consumed: consumed.carbs,
        fat_consumed: consumed.fat,
      };
    },
    enabled: !!user,
  });

  // Update calorie goal
  const updateGoalMutation = useMutation({
    mutationFn: async (calorieGoal: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('goals').upsert({
        user_id: user.id,
        date: today,
        calorie_goal: calorieGoal,
      }, { onConflict: 'user_id,date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-goals'] });
    },
  });

  return {
    todayGoal: todayGoalQuery.data,
    isLoading: todayGoalQuery.isLoading,
    updateGoal: updateGoalMutation.mutateAsync,
  };
}
