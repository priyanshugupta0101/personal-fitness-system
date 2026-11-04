export interface Rank {
  name: string;
  short: string;
  minLevel: number;
  color: string;
  glow: string;
}

export const RANKS: Rank[] = [
  { name: 'Rank E', short: 'E', minLevel: 1, color: '#9ca3af', glow: 'rgba(156,163,175,0.5)' },
  { name: 'Rank D', short: 'D', minLevel: 5, color: '#84cc16', glow: 'rgba(132,204,22,0.5)' },
  { name: 'Rank C', short: 'C', minLevel: 10, color: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
  { name: 'Rank B', short: 'B', minLevel: 20, color: '#3366ff', glow: 'rgba(51,102,255,0.5)' },
  { name: 'Rank A', short: 'A', minLevel: 35, color: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
  { name: 'Rank S', short: 'S', minLevel: 50, color: '#f97316', glow: 'rgba(249,115,22,0.6)' },
  { name: 'Rank S+', short: 'S+', minLevel: 70, color: '#f43f5e', glow: 'rgba(244,63,94,0.7)' },
];

export function getRank(level: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (level >= rank.minLevel) current = rank;
  }
  return current;
}

export function getNextRank(level: number): Rank | null {
  for (const rank of RANKS) {
    if (rank.minLevel > level) return rank;
  }
  return null;
}

export function expForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.35));
}

export interface LevelInfo {
  level: number;
  exp: number;
  expIntoLevel: number;
  expForNext: number;
  progress: number;
  leveledUp: boolean;
  newLevel?: number;
}

export function computeLevel(totalExp: number): { level: number; expIntoLevel: number; expForNext: number } {
  let level = 1;
  let remaining = totalExp;
  while (remaining >= expForLevel(level)) {
    remaining -= expForLevel(level);
    level += 1;
  }
  return { level, expIntoLevel: remaining, expForNext: expForLevel(level) };
}

export function applyExp(currentTotalExp: number, gained: number): LevelInfo {
  const before = computeLevel(currentTotalExp);
  const newTotal = currentTotalExp + gained;
  const after = computeLevel(newTotal);
  return {
    level: after.level,
    exp: after.expIntoLevel,
    expIntoLevel: after.expIntoLevel,
    expForNext: after.expForNext,
    progress: after.expForNext > 0 ? after.expIntoLevel / after.expForNext : 1,
    leveledUp: after.level > before.level,
    newLevel: after.level > before.level ? after.level : undefined,
  };
}

export const CATEGORIES = [
  'Strength',
  'Cardio',
  'Flexibility',
  'Core',
  'Mobility',
  'Sports',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];
