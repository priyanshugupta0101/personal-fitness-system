import { useMemo, useState } from 'react';
import { HeartPulse, Bed, Smile, Zap, Activity } from 'lucide-react';
import { Card, Button, Input, SectionTitle, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { todayStr, formatDate } from '@/lib/dates';
import type { RecoveryLog } from '@/lib/api';

interface RecoveryProps {
  today: RecoveryLog | null;
  history: RecoveryLog[];
  onChanged: () => void;
}

export function RecoveryView({ today: todayLog, history, onChanged }: RecoveryProps) {
  const today = todayStr();
  const [form, setForm] = useState({
    rest_day: todayLog?.rest_day ?? false,
    soreness: String(todayLog?.soreness ?? 3),
    mood: String(todayLog?.mood ?? 3),
    notes: todayLog?.notes ?? '',
  });

  const last7 = useMemo(
    () => [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [history],
  );

  const avgSoreness = last7.length > 0 ? last7.reduce((s, r) => s + r.soreness, 0) / last7.length : 0;
  const avgMood = last7.length > 0 ? last7.reduce((s, r) => s + r.mood, 0) / last7.length : 0;
  const restDays = last7.filter((r) => r.rest_day).length;

  async function save() {
    const payload = {
      date: today,
      rest_day: form.rest_day,
      soreness: Number(form.soreness) || 3,
      mood: Number(form.mood) || 3,
      notes: form.notes.trim() || null,
    };
    if (todayLog) {
      await supabase.from('recovery_log').update(payload).eq('id', todayLog.id);
    } else {
      await supabase.from('recovery_log').insert(payload);
    }
    onChanged();
  }

  const recoveryScore = Math.max(0, Math.min(100, Math.round(
    (Number(form.mood) / 5) * 50 + (1 - Number(form.soreness) / 5) * 30 + (form.rest_day ? 20 : 10),
  )));

  return (
    <div className="space-y-5">
      <SectionTitle icon={<HeartPulse size={18} className="text-rose-500" />}>Recovery</SectionTitle>

      <Card glow className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_2px_2px,#f43f5e_1px,transparent_0)] [background-size:20px_20px]" />
        <div className="relative flex flex-col items-center">
          <div className="relative mb-3 flex h-36 w-36 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-white/10" />
              <circle
                cx="50" cy="50" r="44" fill="none" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - recoveryScore / 100)}`}
                className="transition-all duration-700"
                style={{ filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.6))' }}
              />
            </svg>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-rose-500">{recoveryScore}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Recovery</p>
            </div>
          </div>
          <p className="font-display text-sm text-slate-500">
            {recoveryScore >= 80 ? 'Fully recovered — ready to hunt' :
             recoveryScore >= 60 ? 'Decent recovery — light training ok' :
             recoveryScore >= 40 ? 'Fatigued — consider a rest day' :
             'Overtrained — rest now'}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={<Bed size={16} className="text-violet-400" />} label="Rest days" value={`${restDays}/7`} />
        <StatTile icon={<Activity size={16} className="text-rose-400" />} label="Avg soreness" value={avgSoreness.toFixed(1)} />
        <StatTile icon={<Smile size={16} className="text-emerald-400" />} label="Avg mood" value={avgMood.toFixed(1)} />
      </div>

      <Card>
        <h3 className="quest-rune mb-3 text-xs text-slate-500">Log Today's Recovery</h3>
        <div className="space-y-4">
          <button
            onClick={() => setForm((f) => ({ ...f, rest_day: !f.rest_day }))}
            className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 transition ${
              form.rest_day
                ? 'border-violet-500 bg-violet-500/20 text-violet-500'
                : 'border-slate-200 text-slate-500 dark:border-white/10'
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              <Bed size={18} /> Rest Day
            </span>
            <span className="font-display text-sm">{form.rest_day ? 'ON' : 'OFF'}</span>
          </button>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Soreness (1 = none, 5 = extreme)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setForm((f) => ({ ...f, soreness: String(n) }))}
                  className={`flex h-10 flex-1 items-center justify-center rounded-lg border font-bold transition ${
                    Number(form.soreness) >= n
                      ? 'border-rose-500 bg-rose-500/20 text-rose-500'
                      : 'border-slate-200 text-slate-300 dark:border-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Mood (1 = poor, 5 = great)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setForm((f) => ({ ...f, mood: String(n) }))}
                  className={`flex h-10 flex-1 items-center justify-center rounded-lg border transition ${
                    Number(form.mood) >= n
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500'
                      : 'border-slate-200 text-slate-300 dark:border-white/10'
                  }`}
                >
                  <Smile size={18} fill={Number(form.mood) >= n ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <Input label="Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="How do you feel today?" />
          <Button onClick={save} className="w-full"><Zap size={16} /> Save Recovery</Button>
        </div>
      </Card>

      <Card>
        <h3 className="quest-rune mb-3 text-xs text-slate-500">Recent Recovery</h3>
        {last7.length === 0 ? (
          <p className="text-sm text-slate-400">No recovery records yet.</p>
        ) : (
          <div className="space-y-2">
            {last7.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  {r.rest_day && <Bed size={14} className="text-violet-400" />}
                  <span className="text-sm text-slate-600 dark:text-slate-300">{formatDate(r.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-rose-400">S{r.soreness}</span>
                  <span className="text-emerald-400">M{r.mood}</span>
                  {r.notes && <span className="hidden text-slate-400 sm:inline">{r.notes.slice(0, 30)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
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
