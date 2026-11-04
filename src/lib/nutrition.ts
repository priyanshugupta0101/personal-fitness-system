export interface ParsedNutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: string;
  summary: string;
}

const KEYWORDS: Record<string, number> = {
  chicken: 165, breast: 165, rice: 130, egg: 78, eggs: 78,
  oatmeal: 150, oats: 150, banana: 105, apple: 95, bread: 80,
  milk: 120, yogurt: 100, fish: 140, salmon: 208, beef: 250,
  salad: 150, potato: 130, pasta: 220, pizza: 285, burger: 354,
  nuts: 200, almond: 160, almonds: 160, cheese: 110, tofu: 76,
  lentil: 180, beans: 130, broccoli: 55, spinach: 23, avocado: 240,
  peanut: 190, smoothie: 200, coffee: 5, tea: 2, juice: 110,
  chocolate: 210, cookie: 150, fries: 365, sandwich: 300,
  wrap: 250, soup: 120, curry: 250, steak: 271, shrimp: 99,
  tuna: 132, protein: 120, bar: 220, granola: 200, pancake: 175,
};

const PORTION_MULTIPLIERS: Record<string, number> = {
  bowl: 2, plate: 2.2, large: 1.8, small: 0.6, medium: 1,
  slice: 0.5, cup: 1, glass: 1, piece: 0.8, handful: 0.6,
  spoon: 0.3, scoop: 0.8, bottle: 1.5, can: 1.2,
};

function extractNumber(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(g|grams|gm|ml|pcs|pieces|cups?|bowl|plate|slice|egg|eggs)?/i);
  if (match) return parseFloat(match[1]);
  return null;
}

function guessMealType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('breakfast') || lower.includes('morning')) return 'breakfast';
  if (lower.includes('lunch') || lower.includes('noon')) return 'lunch';
  if (lower.includes('dinner') || lower.includes('night') || lower.includes('supper')) return 'dinner';
  if (lower.includes('snack') || lower.includes('pre') || lower.includes('post')) return 'snack';
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export function parseMealLocal(text: string): ParsedNutrition {
  const lower = text.toLowerCase();
  let calories = 0;
  let matched = false;

  const words = lower.split(/[\s,]+/);
  let portion = 1;
  for (const w of words) {
    if (PORTION_MULTIPLIERS[w]) portion = Math.max(portion, PORTION_MULTIPLIERS[w]);
  }
  const num = extractNumber(text);
  if (num && num > 5) portion = Math.max(portion, Math.min(num / 100, 4));

  for (const [keyword, baseCal] of Object.entries(KEYWORDS)) {
    if (lower.includes(keyword)) {
      calories += baseCal * portion;
      matched = true;
    }
  }

  if (!matched) {
    calories = 250 * portion;
  }

  const protein_g = Math.round((calories * 0.25) / 4);
  const carbs_g = Math.round((calories * 0.45) / 4);
  const fat_g = Math.round((calories * 0.3) / 9);

  return {
    calories: Math.round(calories),
    protein_g,
    carbs_g,
    fat_g,
    meal_type: guessMealType(text),
    summary: text.trim().slice(0, 120),
  };
}
