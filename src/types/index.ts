/* ===== Core Data Types for NutriSight Pro ===== */

// ─── User & Auth ───
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  weight_kg?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal?: 'lose' | 'maintain' | 'gain';
  diet_preference?: 'any' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
  daily_calorie_goal?: number;
  created_at: string;
  updated_at: string;
}

// ─── Nutrition ───
export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar?: number;
  saturated_fat?: number;
}

export interface FoodItem {
  name: string;
  quantity: string;
  estimated_weight_grams: number;
  nutrition: NutritionData;
}

export interface IngredientBreakdown {
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'grain' | 'spice' | 'other';
  estimated_amount: string;
}

// ─── Volume & Portion Estimation ───
export interface VolumeEstimation {
  container_type: string;         // e.g. "standard dinner plate", "medium bowl", "no container"
  estimated_diameter_cm: number;  // plate/bowl diameter
  estimated_depth_cm: number;     // food height/depth
  fill_percentage: number;        // how full the container is (0-100)
  methodology: string;            // explanation of how portions were estimated
  reference_objects: string[];    // objects used for scale reference
}

// ─── Food Analysis (AI Response) ───
export interface FoodAnalysisResult {
  food_name: string;
  description: string;
  items: FoodItem[];
  total_nutrition: NutritionData;
  volume_estimation: VolumeEstimation;
  health_score: number;
  health_label: 'excellent' | 'good' | 'average' | 'poor';
  is_processed: boolean;
  ingredients: IngredientBreakdown[];
  suggestions: string[];
  confidence: number;
}

// ─── Meals (DB) ───
export interface Meal {
  id: string;
  user_id: string;
  food_name: string;
  description?: string;
  image_url?: string;
  image_base64?: string;
  nutrition: NutritionData;
  health_score: number;
  health_label: string;
  ingredients: IngredientBreakdown[];
  suggestions: string[];
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
  created_at: string;
}

// ─── Daily Goals ───
export interface DailyGoal {
  id: string;
  user_id: string;
  date: string;
  calorie_goal: number;
  calories_consumed: number;
  protein_goal?: number;
  protein_consumed?: number;
  carbs_goal?: number;
  carbs_consumed?: number;
  fat_goal?: number;
  fat_consumed?: number;
}

// ─── Meal Plan ───
export interface MealPlanItem {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  nutrition: NutritionData;
  recipe_steps?: string[];
}

export interface DayPlan {
  day: number;
  day_label: string;
  meals: MealPlanItem[];
  total_nutrition: NutritionData;
}

export interface MealPlan {
  id: string;
  user_id: string;
  title: string;
  goal: 'lose' | 'maintain' | 'gain';
  diet_preference: string;
  calorie_target: number;
  days: DayPlan[];
  created_at: string;
}

// ─── Analytics ───
export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
}

export interface WeeklyStats {
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
  total_meals: number;
  daily_data: DailyNutritionSummary[];
}

// ─── Theme ───
export type Theme = 'light' | 'dark';
