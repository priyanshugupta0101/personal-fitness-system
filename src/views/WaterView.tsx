import { useMemo } from 'react';
import { Minus, Plus, Droplets } from 'lucide-react';
import { Card, Button, SectionTitle } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { todayStr, formatDate } from '@/lib/dates';
import type { WaterLog } from '@/lib/api';

interface WaterProps {
  water: WaterLog | null;
  history: WaterLog[];
  goal: number;
  onChanged: () => void;
}

export function WaterView({ water, history, goal, onChanged }: WaterProps) {
  const today = todayStr();
  const glasses = water?.glasses ?? 0;
  const currentGoal = water?.goal ?? goal;
  const pct = currentGoal > 0 ? Math.min(100, (glasses / currentGoal) * 100) : 0;

  const last7 = useMemo(() => {
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    return sorted;
  }, [history]);

  async function adjust(delta: number) {
    const newGlasses = Math.max(0, glasses + delta);
    if (water) {
      await supabase.from('water_log').update({ glasses: newGlasses }).eq('id', water.id);
    } else {
      await supabase.from('water_log').insert({ date: today, glasses: newGlasses, goal: currentGoal });
    }
    onChanged();
  }

  const liters = (glasses * 0.25).toFixed(2);

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Droplets size={18} className="text-mana-500" />}>Water Tracker</SectionTitle>

      <Card glow className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_2px_2px,#06b6d4_1px,transparent_0)] [background-size:20px_20px]" />
        <div className="relative flex flex-col items-center">
          <div className="relative mb-4 flex h-40 w-40 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-white/10" />
              <circle
                cx="50" cy="50" r="44" fill="none" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
                className="transition-all duration-700"
                style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.6))' }}
              />
            </svg>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-mana-500">{glasses}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">of {currentGoal} glasses</p>
              <p className="mt-1 text-xs text-mana-600 dark:text-mana-400">{liters} L</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => adjust(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-200 text-2xl font-bold text-slate-600 transition hover:border-mana-500 hover:text-mana-500 active:scale-90 dark:border-white/10 dark:text-slate-300"
            >
              <Minus size={24} />
            </button>
            <button
              onClick={() => adjust(1)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mana-500 text-2xl font-bold text-white shadow-glow-mana transition hover:bg-mana-400 active:scale-90"
            >
              <Plus size={24} />
            </button>
          </div>
          {glasses >= currentGoal && currentGoal > 0 && (
            <p className="mt-4 animate-rise font-display text-sm font-bold uppercase tracking-widest text-mana-500">
              Goal Reached!
            </p>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="quest-rune mb-3 text-xs text-slate-500">Recent Days</h3>
        <div className="space-y-2">
          {last7.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
              <span className="text-sm text-slate-600 dark:text-slate-300">{formatDate(w.date)}</span>
              <div className="flex items-center gap-2">
                <Droplets size={14} className="text-mana-500" />
                <span className="font-display text-sm font-bold">{w.glasses}/{w.goal}</span>
              </div>
            </div>
          ))}
          {last7.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
        </div>
      </Card>
    </div>
  );
}
