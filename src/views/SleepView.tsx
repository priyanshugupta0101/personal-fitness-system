import { useMemo, useState } from 'react';
import { Moon, Star } from 'lucide-react';
import { Card, Button, Input, SectionTitle } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { todayStr, formatDate } from '@/lib/dates';
import type { SleepLog } from '@/lib/api';

interface SleepProps {
  sleep: SleepLog | null;
  history: SleepLog[];
  goal: number;
  onChanged: () => void;
}

export function SleepView({ sleep, history, goal, onChanged }: SleepProps) {
  const today = todayStr();
  const hours = sleep?.hours_slept ?? 0;
  const quality = sleep?.quality ?? 3;
  const bedtime = sleep?.bedtime ?? '';
  const wake = sleep?.wake_time ?? '';

  const [form, setForm] = useState({
    hours: String(hours),
    quality: String(quality),
    bedtime,
    wake,
  });

  const last7 = useMemo(
    () => [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [history],
  );

  const avg = useMemo(() => {
    if (last7.length === 0) return 0;
    return last7.reduce((s, l) => s + Number(l.hours_slept), 0) / last7.length;
  }, [last7]);

  async function save() {
    const payload = {
      date: today,
      hours_slept: Number(form.hours) || 0,
      quality: Number(form.quality) || 3,
      bedtime: form.bedtime || null,
      wake_time: form.wake || null,
    };
    if (sleep) {
      await supabase.from('sleep_log').update(payload).eq('id', sleep.id);
    } else {
      await supabase.from('sleep_log').insert(payload);
    }
    onChanged();
  }

  const pct = goal > 0 ? Math.min(100, (Number(form.hours) / goal) * 100) : 0;

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Moon size={18} className="text-violet-500" />}>Sleep Tracker</SectionTitle>

      <Card glow className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_2px_2px,#8b5cf6_1px,transparent_0)] [background-size:20px_20px]" />
        <div className="relative flex flex-col items-center">
          <div className="relative mb-4 flex h-40 w-40 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-white/10" />
              <circle
                cx="50" cy="50" r="44" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
                className="transition-all duration-700"
                style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.6))' }}
              />
            </svg>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-violet-500">{form.hours || 0}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">of {goal}h goal</p>
            </div>
          </div>
          <p className="font-display text-sm text-slate-500">7-day avg: {avg.toFixed(1)}h</p>
        </div>
      </Card>

      <Card>
        <h3 className="quest-rune mb-3 text-xs text-slate-500">Log Last Night</h3>
        <div className="space-y-3">
          <Input label="Hours slept" type="number" value={form.hours} onChange={(v) => setForm((f) => ({ ...f, hours: v }))} placeholder="7.5" />
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Sleep quality</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setForm((f) => ({ ...f, quality: String(n) }))}
                  className={`flex h-10 flex-1 items-center justify-center rounded-lg border transition ${
                    Number(form.quality) >= n
                      ? 'border-violet-500 bg-violet-500/20 text-violet-500'
                      : 'border-slate-200 text-slate-300 dark:border-white/10'
                  }`}
                >
                  <Star size={16} fill={Number(form.quality) >= n ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Bedtime" type="time" value={form.bedtime} onChange={(v) => setForm((f) => ({ ...f, bedtime: v }))} />
            <Input label="Wake time" type="time" value={form.wake} onChange={(v) => setForm((f) => ({ ...f, wake: v }))} />
          </div>
          <Button onClick={save} className="w-full">Save Sleep Record</Button>
        </div>
      </Card>

      <Card>
        <h3 className="quest-rune mb-3 text-xs text-slate-500">Recent Nights</h3>
        <div className="space-y-2">
          {last7.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
              <span className="text-sm text-slate-600 dark:text-slate-300">{formatDate(s.date)}</span>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-bold">{Number(s.hours_slept).toFixed(1)}h</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={12} className={i < s.quality ? 'text-violet-500' : 'text-slate-300 dark:text-white/10'} fill={i < s.quality ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          {last7.length === 0 && <p className="text-sm text-slate-400">No sleep records yet.</p>}
        </div>
      </Card>
    </div>
  );
}
