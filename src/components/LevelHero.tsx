import { getRank, getNextRank, expForLevel } from '@/lib/levelSystem';
import type { Profile } from '@/lib/api';

interface HeroProps {
  profile: Profile;
  totalCompleted: number;
}

export function LevelHero({ profile, totalCompleted }: HeroProps) {
  const rank = getRank(profile.level);
  const next = getNextRank(profile.level);
  const expInto = profile.exp;
  const expNext = expForLevel(profile.level);
  const pct = expNext > 0 ? Math.min(100, (expInto / expNext) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-solo-900 via-solo-800 to-slate-900 p-6 text-white shadow-glow dark:border-white/10">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: rank.glow }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="quest-rune text-xs text-solo-200/70">Hunter Status</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span
              className="font-display text-5xl font-black"
              style={{ color: rank.color, textShadow: `0 0 18px ${rank.glow}` }}
            >
              {rank.short}
            </span>
            <div>
              <p className="font-display text-2xl font-bold">Lv. {profile.level}</p>
              <p className="text-xs text-solo-200/70">{totalCompleted} quests cleared</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="quest-rune text-xs text-solo-200/70">Streak</p>
          <p className="font-display text-3xl font-bold text-ember-400">{profile.streak}</p>
          <p className="text-[10px] uppercase tracking-widest text-solo-200/60">days</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-1 flex justify-between text-xs text-solo-200/80">
          <span className="quest-rune">EXP</span>
          <span>{expInto} / {expNext}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-black/30">
          <div
            className="exp-bar-fill h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {next && (
          <p className="mt-2 text-[11px] text-solo-200/60">
            {next.minLevel - profile.level} levels until {next.name}
          </p>
        )}
      </div>
    </div>
  );
}
