import { useMemo, useState } from 'react';
import { Trophy, Lock, Star, Plus, Trash2 } from 'lucide-react';
import { Card, SectionTitle, Button, Modal, Input, Select } from '@/components/ui';
import { BADGES, RANK_BADGES, TIER_STYLES, BADGE_ICONS, CRITERION_TYPES, type Badge } from '@/lib/badges';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/dates';
import { toBadge, type CustomBadgeRow, type EarnedBadge } from '@/lib/api';
import * as LucideIcons from 'lucide-react';

interface BadgesProps {
  earned: EarnedBadge[];
  customBadges: Badge[];
  onChanged: () => void;
}

const TIERS = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'mythic', label: 'Mythic' },
];

export function BadgesView({ earned, customBadges, onChanged }: BadgesProps) {
  const earnedSet = useMemo(() => new Set(earned.map((e) => e.badge_id)), [earned]);
  const [createOpen, setCreateOpen] = useState(false);

  const allBadges: Badge[] = [...BADGES, ...RANK_BADGES, ...customBadges];
  const totalBadges = allBadges.length;

  const builtIn = [...BADGES, ...RANK_BADGES];

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Trophy size={18} className="text-amber-500" />} right={
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={16} /> Create Badge</Button>
      }>
        Achievements
      </SectionTitle>

      <Card glow className="text-center">
        <p className="quest-rune text-xs text-slate-500">Badges Earned</p>
        <p className="font-display text-4xl font-bold text-amber-500">{earnedSet.size}<span className="text-slate-400">/{totalBadges}</span></p>
        <p className="mt-1 text-xs text-slate-400">Keep grinding, Hunter</p>
      </Card>

      <BadgeSection title="System Badges" badges={BADGES} earnedSet={earnedSet} earned={earned} />
      <BadgeSection title="Rank Badges" badges={RANK_BADGES} earnedSet={earnedSet} earned={earned} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="quest-rune text-xs text-slate-500">Custom Badges</h3>
          <Button size="sm" variant="ghost" onClick={() => setCreateOpen(true)}><Plus size={14} /> New</Button>
        </div>
        {customBadges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-white/10">
            <p className="text-sm text-slate-400">No custom badges yet. Create your own with a custom unlock condition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {customBadges.map((badge) => (
              <CustomBadgeCard key={badge.id} badge={badge} isEarned={earnedSet.has(badge.id)} earned={earned} onDelete={onChanged} />
            ))}
          </div>
        )}
      </div>

      <CreateBadgeModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); onChanged(); }} />
    </div>
  );
}

function BadgeSection({ title, badges, earnedSet, earned }: { title: string; badges: Badge[]; earnedSet: Set<string>; earned: EarnedBadge[] }) {
  return (
    <div>
      <h3 className="quest-rune mb-3 text-xs text-slate-500">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((badge) => {
          const isEarned = earnedSet.has(badge.id);
          const earnedRow = earned.find((e) => e.badge_id === badge.id);
          const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[badge.icon] ?? Star;
          return (
            <Card key={badge.id} className={isEarned ? '' : 'opacity-60'}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${TIER_STYLES[badge.tier]} ${
                    isEarned ? 'shadow-glow' : 'grayscale'
                  }`}
                  style={isEarned ? { boxShadow: `0 0 14px ${badge.color}80` } : undefined}
                >
                  {isEarned ? <IconComp size={24} /> : <Lock size={20} className="text-slate-500" />}
                </div>
                <p className="font-display text-sm font-bold">{badge.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{badge.description}</p>
                {isEarned && earnedRow && (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-500">{formatDate(earnedRow.earned_at)}</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CustomBadgeCard({ badge, isEarned, earned, onDelete }: { badge: Badge; isEarned: boolean; earned: EarnedBadge[]; onDelete: () => void }) {
  const earnedRow = earned.find((e) => e.badge_id === badge.id);
  const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[badge.icon] ?? Star;
  const rowId = badge.id.replace('custom_', '');

  async function remove() {
    if (!confirm('Delete this custom badge?')) return;
    await supabase.from('custom_badges').delete().eq('id', rowId);
    onDelete();
  }

  return (
    <Card className={isEarned ? '' : 'opacity-70'}>
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${TIER_STYLES[badge.tier]} ${isEarned ? 'shadow-glow' : 'grayscale'}`}
          style={isEarned ? { boxShadow: `0 0 14px ${badge.color}80` } : undefined}
        >
          {isEarned ? <IconComp size={24} /> : <Lock size={20} className="text-slate-500" />}
        </div>
        <p className="font-display text-sm font-bold">{badge.name}</p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{badge.description}</p>
        {isEarned && earnedRow && (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-500">{formatDate(earnedRow.earned_at)}</p>
        )}
        <button onClick={remove} className="mt-2 text-slate-400 hover:text-rose-500" aria-label="Delete custom badge">
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  );
}

function CreateBadgeModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Star');
  const [tier, setTier] = useState('bronze');
  const [criterionType, setCriterionType] = useState<string>('quests');
  const [criterionValue, setCriterionValue] = useState('10');

  async function save() {
    if (!name.trim() || !description.trim()) return;
    await supabase.from('custom_badges').insert({
      name: name.trim(),
      description: description.trim(),
      icon,
      tier,
      criterion_type: criterionType,
      criterion_value: Number(criterionValue) || 1,
    });
    setName('');
    setDescription('');
    setIcon('Star');
    setTier('bronze');
    setCriterionType('quests');
    setCriterionValue('10');
    onSaved();
  }

  const critDef = CRITERION_TYPES.find((c) => c.value === criterionType);

  return (
    <Modal open={open} onClose={onClose} title="Create Custom Badge">
      <div className="space-y-3">
        <Input label="Badge Name" value={name} onChange={setName} placeholder="e.g. Iron Will" />
        <Input label="Description" value={description} onChange={setDescription} placeholder="e.g. Complete 200 quests" />
        <Select label="Icon" value={icon} onChange={setIcon} options={BADGE_ICONS.map((i) => ({ value: i, label: i }))} />
        <Select label="Tier" value={tier} onChange={setTier} options={TIERS} />
        <Select label="Earned by" value={criterionType} onChange={setCriterionType} options={CRITERION_TYPES.map((c) => ({ value: c.value, label: c.label }))} />
        <Input label={`Threshold ${critDef?.unit ? `(${critDef.unit})` : ''}`} type="number" value={criterionValue} onChange={setCriterionValue} placeholder="10" />
        <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-500 dark:bg-white/5">
          This badge will unlock automatically when you reach the threshold. You can't manually grant it.
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} className="flex-1">Create Badge</Button>
        </div>
      </div>
    </Modal>
  );
}
