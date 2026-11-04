import { useEffect, useMemo, useState } from 'react';
import { Flame, Quote as QuoteIcon, RefreshCw, Target, CheckCircle2, Droplets, Moon } from 'lucide-react';
import { Card, ProgressBar, Button } from '@/components/ui';
import { LevelHero } from '@/components/LevelHero';
import { weekDates, todayStr, dateStr, dayLabel, isSameDay } from '@/lib/dates';
import { quoteOfDay, randomQuote } from '@/lib/quotes';
import type { Profile, Quest, Meal, WaterLog, SleepLog } from '@/lib/api';

interface HomeProps {
  profile: Profile;
  quests: Quest[];
  meals: Meal[];
  water: WaterLog | null;
  sleep: SleepLog | null;
  onNavigate: (k: 'quests' | 'diet' | 'water' | 'sleep' | 'settings') => void;
}

export function HomeView({ profile, quests, meals, water, sleep, onNavigate }: HomeProps) {
  const [quote, setQuote] = useState(quoteOfDay());

  const week = useMemo(() => weekDates(), []);
  const today = todayStr();

  const completedByDate = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const q of quests) {
      if (q.completed) map.set(q.date, true);
    }
    return map;
  }, [quests]);

  const weekDone = week.filter((d) => completedByDate.has(dateStr(d))).length;
  const todayQuests = quests.filter((q) => q.date === today);
  const todayCompleted = todayQuests.filter((q) => q.completed).length;

  const todayMeals = meals.filter((m) => m.date === today);
  const todayCalories = todayMeals.reduce((s, m) => s + Number(m.calories), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + Number(m.protein_g), 0);

  const waterGlasses = water?.glasses ?? 0;
  const waterGoal = water?.goal ?? profile.daily_water_goal;
  const sleepHours = sleep?.hours_slept ?? 0;
  const sleepGoal = profile.daily_sleep_goal;

  return (
    <div className="space-y-5">
      <LevelHero profile={profile} totalCompleted={quests.filter((q) => q.completed).length} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<Flame className="text-ember-400" />} label="Streak" value={`${profile.streak}d`} />
        <StatTile icon={<CheckCircle2 className="text-emerald-400" />} label="Today" value={`${todayCompleted}/${todayQuests.length}`} />
        <StatTile icon={<Droplets className="text-mana-500" />} label="Water" value={`${waterGlasses}/${waterGoal}`} />
        <StatTile icon={<Moon className="text-violet-400" />} label="Sleep" value={`${sleepHours}h`} />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            <Flame size={16} className="text-ember-500" /> Weekly Quest Log
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{weekDone}/7</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {week.map((d) => {
            const done = completedByDate.has(dateStr(d));
            const isToday = isSameDay(d, today);
            return (
              <div key={dateStr(d)} className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  {dayLabel(d)}
                </span>
                <div
                  className={`flex h-10 w-full items-center justify-center rounded-lg border text-xs font-bold transition ${
                    done
                      ? 'border-ember-500 bg-ember-500/20 text-ember-500'
                      : 'border-slate-200 text-slate-300 dark:border-white/10 dark:text-slate-600'
                  } ${isToday ? 'ring-2 ring-solo-500' : ''}`}
                >
                  {done ? '✓' : d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest">Water</h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('water')}>Open</Button>
          </div>
          <ProgressBar value={waterGlasses} max={waterGoal} label="Glasses" variant="water" showValue />
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest">Sleep</h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('sleep')}>Open</Button>
          </div>
          <ProgressBar value={Number(sleepHours)} max={Number(sleepGoal)} label="Hours" variant="sleep" showValue />
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest">Today's Fuel</h3>
          <Button size="sm" variant="ghost" onClick={() => onNavigate('diet')}>Log meal</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Calories</p>
            <p className="font-display text-2xl font-bold">{Math.round(todayCalories)}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Protein</p>
            <p className="font-display text-2xl font-bold">{Math.round(todayProtein)}g</p>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="flex items-start gap-3">
          <QuoteIcon className="mt-1 shrink-0 text-solo-400" size={20} />
          <div className="flex-1">
            <p className="font-display text-base italic leading-relaxed">"{quote.text}"</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">— {quote.author}</p>
          </div>
          <button
            onClick={() => setQuote(randomQuote(quote))}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="New quote"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </Card>

      {profile.main_goal && (
        <Card>
          <div className="flex items-start gap-3">
            <Target className="mt-1 shrink-0 text-ember-500" size={20} />
            <div>
              <p className="quest-rune text-xs text-slate-500">Main Goal</p>
              <p className="mt-1 font-display text-base font-semibold">{profile.main_goal}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-glass rounded-xl p-3">
      <div className="mb-1 flex items-center justify-between">
        {icon}
        <span className="text-[10px] uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}
