import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar, BottomNav, type TabKey } from '@/components/Navigation';
import { HomeView } from '@/views/HomeView';
import { QuestsView } from '@/views/QuestsView';
import { DietView } from '@/views/DietView';
import { WaterView } from '@/views/WaterView';
import { SleepView } from '@/views/SleepView';
import { PhotosView } from '@/views/PhotosView';
import { BadgesView } from '@/views/BadgesView';
import { SettingsView } from '@/views/SettingsView';
import { RecoveryView } from '@/views/RecoveryView';
import { Modal, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { seedDefaultData } from '@/lib/seed';
import { computeLevel } from '@/lib/levelSystem';
import { useReminders } from '@/lib/useReminders';
import { todayStr } from '@/lib/dates';
import type {
  Profile, Quest, Exercise, Meal, WaterLog, SleepLog, ProgressPhoto, Reminder, EarnedBadge, QuestStats, RecoveryLog,
} from '@/lib/api';
import { ensureProfile, isSupabaseConfigured, loadCustomBadges } from '@/lib/api';
import { getBadgeById, type Badge } from '@/lib/badges';
import * as LucideIcons from 'lucide-react';

function AppInner() {
  const [tab, setTab] = useState<TabKey>('home');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterHistory, setWaterHistory] = useState<WaterLog[]>([]);
  const [sleepHistory, setSleepHistory] = useState<SleepLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [customBadges, setCustomBadges] = useState<Badge[]>([]);
  const [recoveryHistory, setRecoveryHistory] = useState<RecoveryLog[]>([]);

  const [levelUp, setLevelUp] = useState<{ level: number } | null>(null);
  const [badgePopup, setBadgePopup] = useState<{ id: string; name: string } | null>(null);
  const [reminderPopup, setReminderPopup] = useState<Reminder | null>(null);

  const today = todayStr();

  const loadAll = useCallback(async () => {
    const [p, ex, q, m, w, s, ph, r, b, rec, cb] = await Promise.all([
      ensureProfile(),
      supabase.from('exercises').select('*').order('name'),
      supabase.from('quests').select('*').order('created_at', { ascending: false }),
      supabase.from('meals').select('*').order('created_at', { ascending: false }),
      supabase.from('water_log').select('*').order('date', { ascending: false }),
      supabase.from('sleep_log').select('*').order('date', { ascending: false }),
      supabase.from('progress_photos').select('*').order('date', { ascending: false }),
      supabase.from('reminders').select('*').order('created_at', { ascending: false }),
      supabase.from('achievements').select('*').order('earned_at', { ascending: false }),
      supabase.from('recovery_log').select('*').order('date', { ascending: false }),
      loadCustomBadges(),
    ]);
    setProfile(p);
    setExercises((ex.data as Exercise[]) ?? []);
    setQuests((q.data as Quest[]) ?? []);
    setMeals((m.data as Meal[]) ?? []);
    setWaterHistory((w.data as WaterLog[]) ?? []);
    setSleepHistory((s.data as SleepLog[]) ?? []);
    setPhotos((ph.data as ProgressPhoto[]) ?? []);
    setReminders((r.data as Reminder[]) ?? []);
    setEarnedBadges((b.data as EarnedBadge[]) ?? []);
    setRecoveryHistory((rec.data as RecoveryLog[]) ?? []);
    setCustomBadges(cb);
  }, []);

  useEffect(() => {
    (async () => {
      await seedDefaultData();
      await loadAll();
      setLoading(false);
    })();
  }, [loadAll]);

  const onReminderFire = useCallback((r: Reminder) => {
    setReminderPopup(r);
  }, []);
  useReminders(reminders, onReminderFire);

  const handleExpGained = useCallback(
    (result: { leveledUp: boolean; newLevel?: number; newBadges: string[] }) => {
      if (result.leveledUp && result.newLevel) {
        setLevelUp({ level: result.newLevel });
      }
      if (result.newBadges.length > 0) {
        const first = result.newBadges[0];
        const badge = getBadgeById(first, customBadges);
        if (badge) setBadgePopup({ id: badge.id, name: badge.name });
      }
    },
    [customBadges],
  );

  const stats: QuestStats = useMemo(() => {
    const completed = quests.filter((q) => q.completed).length;
    const waterHits = waterHistory.filter((w) => w.glasses >= w.goal && w.goal > 0).length;
    const sleepHits = sleepHistory.filter((s) => Number(s.hours_slept) >= 7).length;
    return {
      totalCompleted: completed,
      streak: profile?.streak ?? 0,
      level: profile?.level ?? 1,
      waterHits,
      sleepHits,
      mealsLogged: meals.length,
      photosUploaded: photos.length,
    };
  }, [quests, waterHistory, sleepHistory, meals, photos, profile]);

  const todayWater = useMemo(() => waterHistory.find((w) => w.date === today) ?? null, [waterHistory, today]);
  const todaySleep = useMemo(() => sleepHistory.find((s) => s.date === today) ?? null, [sleepHistory, today]);
  const todayRecovery = useMemo(() => recoveryHistory.find((r) => r.date === today) ?? null, [recoveryHistory, today]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulseGlow rounded-xl bg-solo-600" />
          <p className="font-display text-sm uppercase tracking-[0.4em] text-slate-400">Awakening System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <Sidebar active={tab} onChange={setTab} />
        <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-6 lg:pb-8 lg:pl-8">
          <div className="mx-auto max-w-2xl">
            {/* Mobile header */}
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-solo-600 text-white">
                  <LucideIcons.Swords size={16} />
                </div>
                <p className="font-display text-base font-black tracking-wide">AETHER</p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold">Lv. {profile.level}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{profile.streak}d streak</p>
              </div>
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-4 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                Running in offline mode — Supabase env vars not detected. Data won't persist.
              </div>
            )}

            {tab === 'home' && (
              <HomeView
                profile={profile}
                quests={quests}
                meals={meals}
                water={todayWater}
                sleep={todaySleep}
                onNavigate={(k) => setTab(k)}
              />
            )}
            {tab === 'quests' && (
              <QuestsView
                exercises={exercises}
                quests={quests}
                profile={profile}
                stats={stats}
                onChanged={loadAll}
                onExpGained={handleExpGained}
              />
            )}
            {tab === 'diet' && <DietView meals={meals} onChanged={loadAll} />}
            {tab === 'water' && (
              <WaterView water={todayWater} history={waterHistory} goal={profile.daily_water_goal} onChanged={loadAll} />
            )}
            {tab === 'sleep' && (
              <SleepView sleep={todaySleep} history={sleepHistory} goal={Number(profile.daily_sleep_goal)} onChanged={loadAll} />
            )}
            {tab === 'recovery' && (
              <RecoveryView today={todayRecovery} history={recoveryHistory} onChanged={loadAll} />
            )}
            {tab === 'photos' && <PhotosView photos={photos} onChanged={loadAll} />}
            {tab === 'badges' && <BadgesView earned={earnedBadges} customBadges={customBadges} onChanged={loadAll} />}
            {tab === 'settings' && (
              <SettingsView profile={profile} reminders={reminders} onChanged={loadAll} onRemindersChanged={loadAll} />
            )}
          </div>
        </main>
      </div>

      <BottomNav active={tab} onChange={setTab} />

      {/* Level up popup */}
      <Modal open={!!levelUp} onClose={() => setLevelUp(null)} title="Level Up!">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-4 flex h-20 w-20 animate-floaty items-center justify-center rounded-full bg-gradient-to-br from-solo-500 to-mana-500 shadow-glow">
            <LucideIcons.Star size={40} className="text-white" />
          </div>
          <p className="font-display text-3xl font-black text-solo-500">LEVEL {levelUp?.level}</p>
          <p className="mt-2 text-sm text-slate-500">You have grown stronger, Hunter.</p>
          <Button className="mt-4" onClick={() => setLevelUp(null)}>Continue</Button>
        </div>
      </Modal>

      {/* Badge popup */}
      <Modal open={!!badgePopup} onClose={() => setBadgePopup(null)} title="Badge Earned">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-4 flex h-20 w-20 animate-floaty items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-ember-500 shadow-glow-ember">
            <LucideIcons.Trophy size={40} className="text-white" />
          </div>
          <p className="font-display text-xl font-black text-amber-500">{badgePopup?.name}</p>
          <p className="mt-2 text-sm text-slate-500">A new badge has been etched into your record.</p>
          <Button className="mt-4" onClick={() => setBadgePopup(null)}>Claim</Button>
        </div>
      </Modal>

      {/* Reminder popup */}
      <Modal open={!!reminderPopup} onClose={() => setReminderPopup(null)} title="Reminder">
        <div className="flex flex-col items-center py-4 text-center">
          <LucideIcons.Bell size={40} className="mb-3 text-solo-500" />
          <p className="font-display text-lg font-bold">{reminderPopup?.title}</p>
          <p className="mt-1 text-sm text-slate-500">It's time. {reminderPopup?.time}</p>
          <Button className="mt-4" onClick={() => setReminderPopup(null)}>Dismiss</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
