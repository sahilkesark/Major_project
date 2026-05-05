import type { FoodAnalysisResult, DayPlan, NutritionData } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Models to try in order — newer models typically have more free-tier quota available
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

/**
 * Makes a Gemini API call with automatic model fallback on rate limit or unavailability.
 */
async function callGemini(body: object): Promise<any> {
  let lastError = '';

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return response.json();
    }

    // On rate limit (429) or model not found (404), try next model
    if (response.status === 429 || response.status === 404) {
      console.warn(`Model ${model} returned ${response.status}, trying next...`);
      lastError = `${model}: ${response.status}`;
      continue;
    }

    // Other errors – throw immediately
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  throw new Error(`All Gemini models unavailable (${lastError}). Please wait a minute and try again.`);
}

/**
 * Analyze a food image using Google Gemini Vision API.
 * Sends a base64 image and returns structured nutrition data.
 */
export async function analyzeFoodImage(imageBase64: string): Promise<FoodAnalysisResult> {
  // Strip data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const prompt = `You are an expert nutritionist AI with computer vision expertise in food portion estimation.

CRITICAL TASK: Analyze this food image with TWO key focuses:
1. VOLUME & PORTION ESTIMATION — Estimate the container size (plate/bowl diameter, depth) and use it to calculate accurate portion sizes
2. PER-ITEM NUTRITION — If multiple food items are visible, provide INDIVIDUAL nutrition for EACH item separately

PORTION ESTIMATION METHOD:
- Identify the container type (plate, bowl, cup, tray, hand, no container)
- Estimate plate/bowl diameter using common standards (standard dinner plate ≈ 26cm, side plate ≈ 20cm, soup bowl ≈ 16cm)
- Look for reference objects (utensils, hands, standard packaging) to calibrate size
- Estimate food height/depth on the plate
- Calculate fill percentage (how much of the container is covered)
- Use these measurements to estimate weight in grams for each food item
- A standard dinner plate filled 70% with rice ≈ 200-250g, with curry ≈ 150-200g

Return ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "food_name": "Name of the overall dish/plate",
  "description": "Brief description",
  "items": [
    {
      "name": "Individual food item name (e.g., 'Apple', 'Rice', 'Chicken Curry')",
      "quantity": "Estimated portion with measurement (e.g., '1 medium apple ~182g', '1.5 cups ~280g')",
      "estimated_weight_grams": 182,
      "nutrition": {
        "calories": 95,
        "protein": 0.5,
        "carbs": 25,
        "fat": 0.3,
        "fiber": 4.4,
        "sodium": 2,
        "sugar": 19,
        "saturated_fat": 0
      }
    }
  ],
  "total_nutrition": {
    "calories": 0, "protein": 0, "carbs": 0, "fat": 0,
    "fiber": 0, "sodium": 0, "sugar": 0, "saturated_fat": 0
  },
  "volume_estimation": {
    "container_type": "standard dinner plate",
    "estimated_diameter_cm": 26,
    "estimated_depth_cm": 2,
    "fill_percentage": 75,
    "methodology": "Detected a standard dinner plate (~26cm) based on visible fork for scale. Food fills approximately 75% of the plate surface with ~2cm height. Estimated total food weight: ~400g based on density of visible items.",
    "reference_objects": ["fork", "table edge"]
  },
  "health_score": 75,
  "health_label": "good",
  "is_processed": false,
  "ingredients": [
    { "name": "Ingredient", "category": "protein", "estimated_amount": "100g" }
  ],
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "confidence": 0.85
}

STRICT RULES:
- EVERY distinct food item MUST have its own entry in "items" array with FULL nutrition data
- For example, a plate with rice + curry + salad = 3 separate items with individual nutrition
- For a fruit plate with apple + banana + grapes = 3 separate items
- total_nutrition MUST be the accurate sum of all individual items
- estimated_weight_grams must be realistic based on the container volume estimation
- health_score: 0-100 (excellent: 80-100, good: 60-79, average: 40-59, poor: 0-39)
- health_label: "excellent", "good", "average", or "poor"
- Nutrition values in grams except calories (kcal) and sodium (mg)
- confidence: 0-1 based on image clarity and how certain you are about portions
- If no food detected, return: {"food_name": "Not Food", "confidence": 0}
- methodology must explain HOW you estimated the portions (what reference points you used)
- Be specific about quantities — never just say "1 serving", estimate actual grams`;

  const data = await callGemini({
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64Data,
          },
        },
      ],
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from AI model');

  // Parse JSON from response (strip any accidental markdown fences)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const result: FoodAnalysisResult = JSON.parse(jsonStr);

  // Validate the result
  if (!result.food_name || result.food_name === 'Not Food') {
    throw new Error('No food detected in the image. Please upload a clear food photo.');
  }

  return result;
}

/**
 * Generate a personalized multi-day meal plan using Gemini AI.
 */
export async function generateMealPlan(params: {
  goal: 'lose' | 'maintain' | 'gain';
  dietPreference: string;
  calorieTarget: number;
  days: number;
}): Promise<{ title: string; days: DayPlan[] }> {
  const prompt = `You are an expert nutritionist. Generate a ${params.days}-day meal plan.

Requirements:
- Goal: ${params.goal === 'lose' ? 'Weight Loss' : params.goal === 'gain' ? 'Weight Gain' : 'Weight Maintenance'}
- Diet Preference: ${params.dietPreference}
- Daily Calorie Target: ${params.calorieTarget} kcal
- Calorie Distribution: Breakfast 25%, Lunch 35%, Dinner 30%, Snack 10%

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Plan title",
  "days": [
    {
      "day": 1,
      "day_label": "Day 1 - Monday",
      "meals": [
        {
          "meal_type": "breakfast",
          "name": "Meal name",
          "description": "Brief description",
          "nutrition": {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "sodium": 0
          },
          "recipe_steps": ["Step 1", "Step 2"]
        }
      ],
      "total_nutrition": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sodium": 0
      }
    }
  ]
}

Each day must have 4 meals: breakfast, lunch, dinner, snack.
Make meals practical, tasty, and aligned with the diet preference.
Ensure total daily calories are close to the target (±5%).`;

  const data = await callGemini({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from AI model');

  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}

/**
 * Utility: Calculate health score color
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return '#10b981';  // green
  if (score >= 60) return '#f59e0b';  // amber
  if (score >= 40) return '#f97316';  // orange
  return '#ef4444';                    // red
}

/**
 * Utility: Get health label badge class
 */
export function getHealthBadgeClass(label: string): string {
  switch (label) {
    case 'excellent': return 'badge-success';
    case 'good': return 'badge-success';
    case 'average': return 'badge-warning';
    case 'poor': return 'badge-danger';
    default: return 'badge-warning';
  }
}

/**
 * Utility: Sum nutrition data from an array
 */
export function sumNutrition(items: NutritionData[]): NutritionData {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
      fiber: acc.fiber + (item.fiber || 0),
      sodium: acc.sodium + (item.sodium || 0),
      sugar: (acc.sugar || 0) + (item.sugar || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 }
  );
}
