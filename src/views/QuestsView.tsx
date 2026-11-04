import { useMemo, useState } from 'react';
import { Plus, Swords, Check, Undo2, Trash2, Dumbbell } from 'lucide-react';
import { Card, Button, Modal, Input, Select, SectionTitle, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, type Category } from '@/lib/levelSystem';
import { todayStr } from '@/lib/dates';
import type { Exercise, Quest, Profile, QuestStats } from '@/lib/api';
import { completeQuest, uncompleteQuest, addExp } from '@/lib/api';

interface QuestsProps {
  exercises: Exercise[];
  quests: Quest[];
  profile: Profile;
  stats: QuestStats;
  onChanged: () => void;
  onExpGained: (result: { leveledUp: boolean; newLevel?: number; newBadges: string[] }) => void;
}

export function QuestsView({ exercises, quests, profile, stats, onChanged, onExpGained }: QuestsProps) {
  const [adding, setAdding] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  const [form, setForm] = useState({
    exerciseId: '',
    exerciseName: '',
    category: 'Strength',
    sets: '',
    reps: '',
    duration: '',
    exp: '50',
  });

  const today = todayStr();
  const todayQuests = useMemo(
    () => quests.filter((q) => q.date === today).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)),
    [quests, today],
  );

  const completedToday = todayQuests.filter((q) => q.completed).length;
  const totalToday = todayQuests.length;

  async function addQuest() {
    const name = form.exerciseId
      ? exercises.find((e) => e.id === form.exerciseId)?.name ?? form.exerciseName
      : form.exerciseName.trim();
    if (!name) return;
    const exp = form.exerciseId
      ? exercises.find((e) => e.id === form.exerciseId)?.exp_reward ?? Number(form.exp)
      : Number(form.exp) || 50;

    const quest = {
      date: today,
      exercise_id: form.exerciseId || null,
      exercise_name: name,
      category: form.category,
      sets: form.sets ? Number(form.sets) : null,
      reps: form.reps ? Number(form.reps) : null,
      duration_min: form.duration ? Number(form.duration) : null,
      exp_earned: 0,
      completed: false,
    };
    await supabase.from('quests').insert(quest);
    setForm({ exerciseId: '', exerciseName: '', category: 'Strength', sets: '', reps: '', duration: '', exp: '50' });
    setAdding(false);
    onChanged();
  }

  async function toggleQuest(q: Quest) {
    if (q.completed) {
      await uncompleteQuest(q);
      onChanged();
    } else {
      const result = await completeQuest(q, stats);
      onExpGained(result);
      onChanged();
    }
  }

  async function deleteQuest(q: Quest) {
    await supabase.from('quests').delete().eq('id', q.id);
    onChanged();
  }

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Swords size={18} className="text-solo-500" />} right={
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setCustomOpen(true)}>New Exercise</Button>
          <Button size="sm" onClick={() => setAdding(true)}><Plus size={16} /> Add Quest</Button>
        </div>
      }>
        Daily Quests
      </SectionTitle>

      <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 dark:bg-white/5">
        <span className="text-sm text-slate-600 dark:text-slate-300">Today's progress</span>
        <span className="font-display text-lg font-bold">{completedToday}/{totalToday} cleared</span>
      </div>

      {todayQuests.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={36} />}
          title="No Quests Yet"
          description="Add your first exercise quest for today and start earning EXP."
          action={<Button onClick={() => setAdding(true)}><Plus size={16} /> Add Quest</Button>}
        />
      ) : (
        <div className="space-y-3">
          {todayQuests.map((q) => (
            <Card key={q.id} className={q.completed ? 'opacity-70' : ''}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleQuest(q)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                    q.completed
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 text-transparent hover:border-solo-500 dark:border-white/20'
                  }`}
                  aria-label={q.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  <Check size={20} />
                </button>
                <div className="flex-1">
                  <p className={`font-display text-base font-bold ${q.completed ? 'line-through' : ''}`}>
                    {q.exercise_name}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-white/10">{q.category}</span>
                    {q.sets && <span>{q.sets} sets</span>}
                    {q.reps && <span>{q.reps} reps</span>}
                    {q.duration_min && <span>{q.duration_min} min</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-solo-500">+{q.exp_earned || (q.completed ? 0 : (exercises.find(e => e.id === q.exercise_id)?.exp_reward ?? 50))}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">EXP</p>
                </div>
                <div className="flex flex-col gap-1">
                  {q.completed && (
                    <button onClick={() => toggleQuest(q)} className="rounded p-1 text-slate-400 hover:text-solo-500" aria-label="Undo">
                      <Undo2 size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteQuest(q)} className="rounded p-1 text-slate-400 hover:text-rose-500" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add Quest">
        <div className="space-y-3">
          <Select
            label="Exercise (from library)"
            value={form.exerciseId}
            onChange={(v) => {
              const ex = exercises.find((e) => e.id === v);
              setForm((f) => ({
                ...f,
                exerciseId: v,
                exerciseName: ex?.name ?? '',
                category: ex?.category ?? f.category,
                exp: String(ex?.exp_reward ?? f.exp),
              }));
            }}
            options={[
              { value: '', label: '— Custom exercise —' },
              ...exercises.map((e) => ({ value: e.id, label: `${e.name} (${e.category})` })),
            ]}
          />
          {!form.exerciseId && (
            <Input label="Exercise name" value={form.exerciseName} onChange={(v) => setForm((f) => ({ ...f, exerciseName: v }))} placeholder="e.g. Shadow Boxing" />
          )}
          <Select
            label="Category"
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input label="Sets" type="number" value={form.sets} onChange={(v) => setForm((f) => ({ ...f, sets: v }))} placeholder="3" />
            <Input label="Reps" type="number" value={form.reps} onChange={(v) => setForm((f) => ({ ...f, reps: v }))} placeholder="12" />
            <Input label="Min" type="number" value={form.duration} onChange={(v) => setForm((f) => ({ ...f, duration: v }))} placeholder="30" />
          </div>
          <Input label="EXP reward" type="number" value={form.exp} onChange={(v) => setForm((f) => ({ ...f, exp: v }))} />
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAdding(false)} className="flex-1">Cancel</Button>
            <Button onClick={addQuest} className="flex-1">Add Quest</Button>
          </div>
        </div>
      </Modal>

      <CustomExerciseModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSaved={() => { setCustomOpen(false); onChanged(); }}
      />
    </div>
  );
}

function CustomExerciseModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Strength');
  const [exp, setExp] = useState('50');

  async function save() {
    if (!name.trim()) return;
    await supabase.from('exercises').insert({
      name: name.trim(),
      category,
      exp_reward: Number(exp) || 50,
    });
    setName('');
    setExp('50');
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Custom Exercise">
      <div className="space-y-3">
        <Input label="Name" value={name} onChange={setName} placeholder="e.g. Shadow Boxing" />
        <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <Input label="EXP reward" type="number" value={exp} onChange={setExp} />
        <div className="flex gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} className="flex-1">Save Exercise</Button>
        </div>
      </div>
    </Modal>
  );
}
