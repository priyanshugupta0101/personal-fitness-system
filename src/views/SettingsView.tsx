import { useState } from 'react';
import { Settings, Sun, Moon, Bell, Plus, Trash2, Target, Droplets, Moon as MoonIcon, Dumbbell } from 'lucide-react';
import { Card, Button, Input, Select, SectionTitle, Modal } from '@/components/ui';
import { useThemeCtx } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { updateProfile, ensureProfile } from '@/lib/api';
import { requestNotificationPermission } from '@/lib/useReminders';
import type { Profile, Reminder } from '@/lib/api';

interface SettingsProps {
  profile: Profile;
  reminders: Reminder[];
  onChanged: () => void;
  onRemindersChanged: () => void;
}

const REMINDER_TYPES = [
  { value: 'workout', label: 'Workout', icon: Dumbbell },
  { value: 'water', label: 'Water', icon: Droplets },
  { value: 'sleep', label: 'Sleep', icon: MoonIcon },
];

export function SettingsView({ profile, reminders, onChanged, onRemindersChanged }: SettingsProps) {
  const { theme, toggle } = useThemeCtx();
  const [goalOpen, setGoalOpen] = useState(false);
  const [goal, setGoal] = useState(profile.main_goal ?? '');
  const [waterGoal, setWaterGoal] = useState(String(profile.daily_water_goal));
  const [sleepGoal, setSleepGoal] = useState(String(profile.daily_sleep_goal));

  const [reminderOpen, setReminderOpen] = useState(false);
  const [rForm, setRForm] = useState({ title: '', type: 'workout', time: '08:00' });
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  async function saveGoal() {
    await updateProfile({
      main_goal: goal.trim() || null,
      daily_water_goal: Number(waterGoal) || 8,
      daily_sleep_goal: Number(sleepGoal) || 8,
    });
    setGoalOpen(false);
    onChanged();
  }

  async function enableNotifications() {
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
  }

  async function addReminder() {
    if (!rForm.title.trim() || !rForm.time) return;
    await supabase.from('reminders').insert({
      title: rForm.title.trim(),
      type: rForm.type,
      time: rForm.time,
      enabled: true,
    });
    setRForm({ title: '', type: 'workout', time: '08:00' });
    setReminderOpen(false);
    onRemindersChanged();
  }

  async function toggleReminder(r: Reminder) {
    await supabase.from('reminders').update({ enabled: !r.enabled }).eq('id', r.id);
    onRemindersChanged();
  }

  async function deleteReminder(id: string) {
    await supabase.from('reminders').delete().eq('id', id);
    onRemindersChanged();
  }

  async function resetProgress() {
    if (!confirm('Reset all progress? This will clear your level, EXP, and streak. This cannot be undone.')) return;
    const p = await ensureProfile();
    await supabase.from('profile').update({
      level: 1, exp: 0, total_exp: 0, streak: 0, last_workout_date: null,
    }).eq('id', p.id);
    await supabase.from('quests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    onChanged();
  }

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Settings size={18} className="text-solo-500" />}>Settings</SectionTitle>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={20} className="text-violet-400" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wide">Theme</p>
              <p className="text-xs text-slate-400">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="relative h-8 w-14 rounded-full bg-slate-200 transition dark:bg-solo-600"
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                theme === 'dark' ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Target size={18} className="text-ember-500" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wide">Goals</h3>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Main Goal" value={profile.main_goal ?? 'Not set'} />
          <Row label="Daily Water Goal" value={`${profile.daily_water_goal} glasses`} />
          <Row label="Daily Sleep Goal" value={`${profile.daily_sleep_goal} hours`} />
        </div>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setGoalOpen(true)}>Edit Goals</Button>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-solo-500" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wide">Reminders</h3>
          </div>
          <Button size="sm" onClick={() => setReminderOpen(true)}><Plus size={14} /> Add</Button>
        </div>

        {notifPerm !== 'granted' && (
          <div className="mb-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
            <p className="mb-2">Enable browser notifications so reminders actually fire.</p>
            <Button size="sm" variant="ember" onClick={enableNotifications}>Enable Notifications</Button>
          </div>
        )}

        {reminders.length === 0 ? (
          <p className="text-sm text-slate-400">No reminders set. Add one for workouts, water, or sleep.</p>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => {
              const typeDef = REMINDER_TYPES.find((t) => t.value === r.type);
              const Icon = typeDef?.icon ?? Bell;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
                  <Icon size={16} className="text-solo-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.time}</p>
                  </div>
                  <button
                    onClick={() => toggleReminder(r)}
                    className={`relative h-6 w-11 rounded-full transition ${r.enabled ? 'bg-solo-600' : 'bg-slate-300 dark:bg-white/10'}`}
                    aria-label="Toggle reminder"
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${r.enabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <button onClick={() => deleteReminder(r.id)} className="rounded p-1 text-slate-400 hover:text-rose-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-display mb-3 text-sm font-bold uppercase tracking-wide">Danger Zone</h3>
        <Button variant="danger" size="sm" onClick={resetProgress}>Reset All Progress</Button>
      </Card>

      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Edit Goals">
        <div className="space-y-3">
          <Input label="Main Goal" value={goal} onChange={setGoal} placeholder="e.g. Run a marathon in 6 months" />
          <Input label="Daily Water Goal (glasses)" type="number" value={waterGoal} onChange={setWaterGoal} />
          <Input label="Daily Sleep Goal (hours)" type="number" value={sleepGoal} onChange={setSleepGoal} />
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => setGoalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveGoal} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={reminderOpen} onClose={() => setReminderOpen(false)} title="Add Reminder">
        <div className="space-y-3">
          <Input label="Title" value={rForm.title} onChange={(v) => setRForm((f) => ({ ...f, title: v }))} placeholder="e.g. Morning Workout" />
          <Select label="Type" value={rForm.type} onChange={(v) => setRForm((f) => ({ ...f, type: v }))} options={REMINDER_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
          <Input label="Time" type="time" value={rForm.time} onChange={(v) => setRForm((f) => ({ ...f, time: v }))} />
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => setReminderOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={addReminder} className="flex-1">Add Reminder</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
