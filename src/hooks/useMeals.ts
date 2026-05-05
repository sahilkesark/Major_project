import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Meal, NutritionData, IngredientBreakdown } from '@/types';

/**
 * Hook for CRUD operations on the meals table.
 */
export function useMeals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all meals for current user, newest first
  const mealsQuery = useQuery({
    queryKey: ['meals', user?.id],
    queryFn: async (): Promise<Meal[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Meal[];
    },
    enabled: !!user,
  });

  // Fetch meals for a specific date
  const useMealsForDate = (date: string) =>
    useQuery({
      queryKey: ['meals', user?.id, date],
      queryFn: async (): Promise<Meal[]> => {
        if (!user) return [];
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59`;
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startOfDay)
          .lte('logged_at', endOfDay)
          .order('logged_at', { ascending: true });
        if (error) throw error;
        return (data || []) as Meal[];
      },
      enabled: !!user,
    });

  // Log a new meal
  const logMealMutation = useMutation({
    mutationFn: async (meal: {
      food_name: string;
      description?: string;
      image_base64?: string;
      nutrition: NutritionData;
      health_score: number;
      health_label: string;
      ingredients: IngredientBreakdown[];
      suggestions: string[];
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        ...meal,
        logged_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-goals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  // Delete a meal
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase.from('meals').delete().eq('id', mealId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-goals'] });
    },
  });

  return {
    meals: mealsQuery.data || [],
    isLoading: mealsQuery.isLoading,
    error: mealsQuery.error,
    logMeal: logMealMutation.mutateAsync,
    isLogging: logMealMutation.isPending,
    deleteMeal: deleteMealMutation.mutateAsync,
    useMealsForDate,
  };
}
