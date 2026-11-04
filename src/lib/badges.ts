export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'mythic';
  color: string;
  custom?: boolean;
}

export const BADGES: Badge[] = [
  { id: 'first_step', name: 'Awakening', description: 'Complete your first quest', icon: 'Sparkles', tier: 'bronze', color: '#b45309' },
  { id: 'streak_3', name: 'Kindling', description: '3-day workout streak', icon: 'Flame', tier: 'bronze', color: '#b45309' },
  { id: 'streak_7', name: 'Ignition', description: '7-day workout streak', icon: 'Flame', tier: 'silver', color: '#64748b' },
  { id: 'streak_30', name: 'Eternal Flame', description: '30-day workout streak', icon: 'Flame', tier: 'mythic', color: '#f43f5e' },
  { id: 'level_5', name: 'Risen', description: 'Reach Level 5', icon: 'TrendingUp', tier: 'bronze', color: '#b45309' },
  { id: 'level_10', name: 'Ascendant', description: 'Reach Level 10', icon: 'TrendingUp', tier: 'silver', color: '#64748b' },
  { id: 'level_25', name: 'Overlord', description: 'Reach Level 25', icon: 'Crown', tier: 'gold', color: '#eab308' },
  { id: 'level_50', name: 'Monarch', description: 'Reach Level 50', icon: 'Crown', tier: 'mythic', color: '#f43f5e' },
  { id: 'quests_10', name: 'Hunter', description: 'Complete 10 quests', icon: 'Swords', tier: 'bronze', color: '#b45309' },
  { id: 'quests_50', name: 'Slayer', description: 'Complete 50 quests', icon: 'Swords', tier: 'silver', color: '#64748b' },
  { id: 'quests_100', name: 'Conqueror', description: 'Complete 100 quests', icon: 'Swords', tier: 'gold', color: '#eab308' },
  { id: 'water_30', name: 'Tidecaller', description: 'Hit water goal 30 times', icon: 'Droplets', tier: 'silver', color: '#06b6d4' },
  { id: 'sleep_14', name: 'Dreamwalker', description: 'Hit sleep goal 14 times', icon: 'Moon', tier: 'silver', color: '#8b5cf6' },
  { id: 'meals_20', name: 'Nourished', description: 'Log 20 meals', icon: 'Apple', tier: 'bronze', color: '#b45309' },
  { id: 'photos_5', name: 'Chronicler', description: 'Upload 5 progress photos', icon: 'Camera', tier: 'silver', color: '#64748b' },
];

export const RANK_BADGES: Badge[] = [
  { id: 'rank_e', name: 'Rank E Reached', description: 'Awaken as Rank E', icon: 'Shield', tier: 'bronze', color: '#9ca3af' },
  { id: 'rank_d', name: 'Rank D Reached', description: 'Promoted to Rank D', icon: 'Shield', tier: 'bronze', color: '#84cc16' },
  { id: 'rank_c', name: 'Rank C Reached', description: 'Promoted to Rank C', icon: 'Shield', tier: 'silver', color: '#06b6d4' },
  { id: 'rank_b', name: 'Rank B Reached', description: 'Promoted to Rank B', icon: 'Shield', tier: 'silver', color: '#3366ff' },
  { id: 'rank_a', name: 'Rank A Reached', description: 'Promoted to Rank A', icon: 'Shield', tier: 'gold', color: '#a855f7' },
  { id: 'rank_s', name: 'Rank S Reached', description: 'Promoted to Rank S', icon: 'Star', tier: 'mythic', color: '#f97316' },
  { id: 'rank_s_plus', name: 'Rank S+ Reached', description: 'Apex — Rank S+', icon: 'Star', tier: 'mythic', color: '#f43f5e' },
];

export const RANK_BADGE_MAP: Record<string, string> = {
  'Rank E': 'rank_e',
  'Rank D': 'rank_d',
  'Rank C': 'rank_c',
  'Rank B': 'rank_b',
  'Rank A': 'rank_a',
  'Rank S': 'rank_s',
  'Rank S+': 'rank_s_plus',
};

export const ALL_BADGES: Badge[] = [...BADGES, ...RANK_BADGES];

export const BADGE_ICONS = [
  'Star', 'Trophy', 'Flame', 'Crown', 'Shield', 'Swords', 'Sparkles', 'TrendingUp',
  'Droplets', 'Moon', 'Apple', 'Camera', 'Target', 'Zap', 'Award', 'Medal',
  'Heart', 'Dumbbell', 'Footprints', 'Brain', 'Smile', 'Sun', 'Snowflake',
];

export const CRITERION_TYPES = [
  { value: 'level', label: 'Reach Level', unit: '' },
  { value: 'streak', label: 'Workout Streak (days)', unit: 'days' },
  { value: 'quests', label: 'Total Quests Completed', unit: 'quests' },
  { value: 'water_hits', label: 'Water Goal Hits', unit: 'times' },
  { value: 'sleep_hits', label: 'Sleep Goal Hits', unit: 'times' },
  { value: 'meals', label: 'Meals Logged', unit: 'meals' },
  { value: 'photos', label: 'Photos Uploaded', unit: 'photos' },
] as const;

export type CriterionType = (typeof CRITERION_TYPES)[number]['value'];

export function getBadgeById(id: string, customBadges: Badge[] = []): Badge | undefined {
  return [...ALL_BADGES, ...customBadges].find((b) => b.id === id);
}

export const TIER_STYLES: Record<Badge['tier'], string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-slate-400 to-slate-300',
  gold: 'from-yellow-500 to-amber-400',
  mythic: 'from-rose-500 to-orange-400',
};
