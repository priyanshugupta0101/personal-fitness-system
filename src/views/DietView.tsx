import { useMemo, useState } from 'react';
import { Plus, Apple, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { Card, Button, Modal, Input, Select, SectionTitle, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { parseMealLocal, type ParsedNutrition } from '@/lib/nutrition';
import { todayStr, formatDate } from '@/lib/dates';
import type { Meal } from '@/lib/api';

interface DietProps {
  meals: Meal[];
  onChanged: () => void;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export function DietView({ meals, onChanged }: DietProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('snack');
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<ParsedNutrition | null>(null);

  const today = todayStr();
  const todayMeals = useMemo(
    () => meals.filter((m) => m.date === today).sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? '')),
    [meals, today],
  );

  const allMeals = useMemo(
    () => [...meals].sort((a, b) => b.date.localeCompare(a.date) || (b.created_at ?? '').localeCompare(a.created_at ?? '')),
    [meals],
  );

  const totals = useMemo(() => {
    return todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + Number(m.calories),
        protein: acc.protein + Number(m.protein_g),
        carbs: acc.carbs + Number(m.carbs_g),
        fat: acc.fat + Number(m.fat_g),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [todayMeals]);

  function analyze() {
    if (!description.trim()) return;
    setParsing(true);
    setTimeout(() => {
      const parsed = parseMealLocal(description);
      setPreview(parsed);
      setMealType(parsed.meal_type);
      setParsing(false);
    }, 600);
  }

  async function saveMeal() {
    if (!preview || !description.trim()) return;
    await supabase.from('meals').insert({
      date: today,
      meal_type: mealType,
      description: description.trim(),
      calories: preview.calories,
      protein_g: preview.protein_g,
      carbs_g: preview.carbs_g,
      fat_g: preview.fat_g,
    });
    setDescription('');
    setPreview(null);
    setOpen(false);
    onChanged();
  }

  async function deleteMeal(id: string) {
    await supabase.from('meals').delete().eq('id', id);
    onChanged();
  }

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Apple size={18} className="text-emerald-500" />} right={
        <Button size="sm" onClick={() => setOpen(true)}><Plus size={16} /> Log Meal</Button>
      }>
        Diet Tracker
      </SectionTitle>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MacroTile label="Calories" value={Math.round(totals.calories)} unit="kcal" color="text-solo-500" />
        <MacroTile label="Protein" value={Math.round(totals.protein)} unit="g" color="text-emerald-500" />
        <MacroTile label="Carbs" value={Math.round(totals.carbs)} unit="g" color="text-amber-500" />
        <MacroTile label="Fat" value={Math.round(totals.fat)} unit="g" color="text-rose-500" />
      </div>

      <div>
        <h3 className="quest-rune mb-3 text-xs text-slate-500">Today's Meals</h3>
        {todayMeals.length === 0 ? (
          <EmptyState
            icon={<Apple size={32} />}
            title="No Meals Logged"
            description="Describe what you ate and the system will estimate the nutrition."
            action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Log Meal</Button>}
          />
        ) : (
          <div className="space-y-2">
            {todayMeals.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        {m.meal_type}
                      </span>
                      <span className="font-display text-sm font-bold">{Math.round(Number(m.calories))} kcal</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{m.description}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      P {Math.round(Number(m.protein_g))}g · C {Math.round(Number(m.carbs_g))}g · F {Math.round(Number(m.fat_g))}g
                    </p>
                  </div>
                  <button onClick={() => deleteMeal(m.id)} className="rounded p-1 text-slate-400 hover:text-rose-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {allMeals.length > todayMeals.length && (
        <div>
          <h3 className="quest-rune mb-3 text-xs text-slate-500">History</h3>
          <div className="space-y-2">
            {allMeals.filter((m) => m.date !== today).slice(0, 10).map((m) => (
              <Card key={m.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{m.description.slice(0, 50)}</p>
                    <p className="text-xs text-slate-400">{formatDate(m.date)} · {Math.round(Number(m.calories))} kcal</p>
                  </div>
                  <button onClick={() => deleteMeal(m.id)} className="rounded p-1 text-slate-400 hover:text-rose-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setPreview(null); }} title="Log Meal">
        <div className="space-y-3">
          <Input
            label="What did you eat?"
            value={description}
            onChange={setDescription}
            placeholder="e.g. 2 eggs, 1 bowl of rice and grilled chicken"
          />
          <Select label="Meal type" value={mealType} onChange={setMealType} options={MEAL_TYPES.map((t) => ({ value: t, label: t }))} />
          <Button variant="mana" onClick={analyze} disabled={!description.trim() || parsing} className="w-full">
            {parsing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {parsing ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
          {preview && (
            <div className="rounded-xl border border-mana-500/40 bg-mana-500/10 p-3 animate-rise">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mana-600 dark:text-mana-400">
                <Sparkles size={14} /> Estimated Nutrition
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <MacroMini label="Kcal" value={preview.calories} />
                <MacroMini label="Protein" value={`${preview.protein_g}g`} />
                <MacroMini label="Carbs" value={`${preview.carbs_g}g`} />
                <MacroMini label="Fat" value={`${preview.fat_g}g`} />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setOpen(false); setPreview(null); }} className="flex-1">Cancel</Button>
            <Button onClick={saveMeal} disabled={!preview} className="flex-1">Save Meal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MacroTile({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="card-glass rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400">{unit}</p>
    </div>
  );
}

function MacroMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-display text-sm font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}
