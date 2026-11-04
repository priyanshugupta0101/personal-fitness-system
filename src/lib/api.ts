import { supabase, isSupabaseConfigured } from './supabase';
import { computeLevel, applyExp } from './levelSystem';
import { ALL_BADGES, RANK_BADGES, type Badge } from './badges';
import { RANKS } from './levelSystem';

export interface Profile {
  id: string;
  level: number;
  exp: number;
  total_exp: number;
  streak: number;
  last_workout_date: string | null;
  main_goal: string | null;
  daily_water_goal: number;
  daily_sleep_goal: number;
}

export interface Quest {
  id: string;
  date: string;
  exercise_id: string | null;
  exercise_name: string;
  category: string;
  sets: number | null;
  reps: number | null;
  duration_min: number | null;
  exp_earned: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  exp_reward: number;
}

export interface Meal {
  id: string;
  date: string;
  meal_type: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at?: string;
}

export interface WaterLog {
  id: string;
  date: string;
  glasses: number;
  goal: number;
}

export interface SleepLog {
  id: string;
  date: string;
  hours_slept: number;
  quality: number;
  bedtime: string | null;
  wake_time: string | null;
}

export interface ProgressPhoto {
  id: string;
  image_url: string;
  date: string;
  note: string | null;
}

export interface Reminder {
  id: string;
  title: string;
  type: string;
  time: string;
  enabled: boolean;
}

export interface EarnedBadge {
  id: string;
  badge_id: string;
  earned_at: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export interface CustomBadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  criterion_type: string;
  criterion_value: number;
  created_at: string;
}

export interface RecoveryLog {
  id: string;
  date: string;
  rest_day: boolean;
  soreness: number;
  mood: number;
  notes: string | null;
}

export type ProfileUpdate = Partial<Profile>;

export async function ensureProfile(): Promise<Profile> {
  const { data } = await supabase.from('profile').select('*').maybeSingle();
  if (data) return data as Profile;
  const { data: created } = await supabase
    .from('profile')
    .insert({ main_goal: 'Become the strongest version of myself' })
    .select()
    .maybeSingle();
  return created as Profile;
}

export async function updateProfile(updates: ProfileUpdate): Promise<void> {
  await supabase.from('profile').update(updates).eq('id', (await ensureProfile()).id);
}

export interface ExpResult {
  profile: Profile;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: string[];
}

function customBadgeId(row: CustomBadgeRow): string {
  return `custom_${row.id}`;
}

export function toBadge(row: CustomBadgeRow): Badge {
  return {
    id: customBadgeId(row),
    name: row.name,
    description: row.description,
    icon: row.icon,
    tier: (['bronze', 'silver', 'gold', 'mythic'] as const).includes(row.tier as Badge['tier'])
      ? (row.tier as Badge['tier'])
      : 'bronze',
    color: '#3366ff',
    custom: true,
  };
}

export async function loadCustomBadges(): Promise<Badge[]> {
  const { data } = await supabase.from('custom_badges').select('*').order('created_at', { ascending: false });
  return ((data as CustomBadgeRow[]) ?? []).map(toBadge);
}

export interface QuestStats {
  totalCompleted: number;
  streak: number;
  level: number;
  waterHits: number;
  sleepHits: number;
  mealsLogged: number;
  photosUploaded: number;
}

export async function addExp(gained: number, stats: QuestStats): Promise<ExpResult> {
  const profile = await ensureProfile();
  const totalExp = profile.total_exp + gained;
  const info = applyExp(profile.total_exp, gained);
  const { data: updated } = await supabase
    .from('profile')
    .update({
      total_exp: totalExp,
      exp: info.exp,
      level: info.level,
    })
    .eq('id', profile.id)
    .select()
    .maybeSingle();

  const earned = await checkBadges(info.level, stats);
  return {
    profile: (updated as Profile) ?? { ...profile, total_exp: totalExp, exp: info.exp, level: info.level },
    leveledUp: info.leveledUp,
    newLevel: info.newLevel,
    newBadges: earned,
  };
}

async function getEarnedSet(): Promise<Set<string>> {
  const { data: earnedRows } = (await supabase.from('achievements').select('badge_id')) as {
    data: EarnedBadge[] | null;
  };
  return new Set((earnedRows ?? []).map((r) => r.badge_id));
}

async function grantBadges(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const rows = ids.map((badge_id) => ({ badge_id }));
  await supabase.from('achievements').insert(rows);
}

async function checkBadges(level: number, stats: QuestStats): Promise<string[]> {
  const earnedSet = await getEarnedSet();

  const builtinCandidates = ALL_BADGES.filter((b) => !earnedSet.has(b.id)).map((b) => {
    let shouldEarn = false;
    if (b.id.startsWith('rank_')) {
      const rankBadge = RANK_BADGES.find((rb) => rb.id === b.id);
      if (rankBadge) {
        const rankName = rankBadge.name.replace(' Reached', '').replace(' Reached', '');
        const rank = RANKS.find((r) => r.name === rankName);
        shouldEarn = rank ? level >= rank.minLevel : false;
      }
    } else {
      switch (b.id) {
        case 'first_step': shouldEarn = stats.totalCompleted >= 1; break;
        case 'quests_10': shouldEarn = stats.totalCompleted >= 10; break;
        case 'quests_50': shouldEarn = stats.totalCompleted >= 50; break;
        case 'quests_100': shouldEarn = stats.totalCompleted >= 100; break;
        case 'streak_3': shouldEarn = stats.streak >= 3; break;
        case 'streak_7': shouldEarn = stats.streak >= 7; break;
        case 'streak_30': shouldEarn = stats.streak >= 30; break;
        case 'level_5': shouldEarn = level >= 5; break;
        case 'level_10': shouldEarn = level >= 10; break;
        case 'level_25': shouldEarn = level >= 25; break;
        case 'level_50': shouldEarn = level >= 50; break;
        case 'water_30': shouldEarn = stats.waterHits >= 30; break;
        case 'sleep_14': shouldEarn = stats.sleepHits >= 14; break;
        case 'meals_20': shouldEarn = stats.mealsLogged >= 20; break;
        case 'photos_5': shouldEarn = stats.photosUploaded >= 5; break;
      }
    }
    return shouldEarn ? b.id : null;
  }).filter((id): id is string => id !== null);

  const { data: customRows } = (await supabase.from('custom_badges').select('*')) as { data: CustomBadgeRow[] | null };
  const customCandidates = ((customRows ?? [])).filter((row) => !earnedSet.has(customBadgeId(row))).map((row) => {
    let val = 0;
    switch (row.criterion_type) {
      case 'level': val = level; break;
      case 'streak': val = stats.streak; break;
      case 'quests': val = stats.totalCompleted; break;
      case 'water_hits': val = stats.waterHits; break;
      case 'sleep_hits': val = stats.sleepHits; break;
      case 'meals': val = stats.mealsLogged; break;
      case 'photos': val = stats.photosUploaded; break;
    }
    return val >= row.criterion_value ? customBadgeId(row) : null;
  }).filter((id): id is string => id !== null);

  const all = [...builtinCandidates, ...customCandidates];
  await grantBadges(all);
  return all;
}

export async function completeQuest(quest: Quest, stats: QuestStats): Promise<ExpResult> {
  await supabase
    .from('quests')
    .update({ completed: true, completed_at: new Date().toISOString(), exp_earned: quest.exp_earned })
    .eq('id', quest.id);

  const profile = await ensureProfile();
  const today = new Date().toISOString().slice(0, 10);
  let newStreak = profile.streak;
  if (profile.last_workout_date !== today) {
    if (profile.last_workout_date) {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      newStreak = profile.last_workout_date === yesterday ? profile.streak + 1 : 1;
    } else {
      newStreak = 1;
    }
    await supabase.from('profile').update({ streak: newStreak, last_workout_date: today }).eq('id', profile.id);
  }

  return addExp(quest.exp_earned, { ...stats, streak: newStreak });
}

export async function uncompleteQuest(quest: Quest): Promise<void> {
  await supabase
    .from('quests')
    .update({ completed: false, completed_at: null, exp_earned: 0 })
    .eq('id', quest.id);
}

export { isSupabaseConfigured, computeLevel };
