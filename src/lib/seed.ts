import { supabase } from './supabase';
import { ensureProfile } from './api';

const STORAGE_KEY = 'aether-seeded';

export async function seedDefaultData(): Promise<void> {
  if (localStorage.getItem(STORAGE_KEY)) return;
  localStorage.setItem(STORAGE_KEY, '1');

  const profile = await ensureProfile();

  const { count: exerciseCount } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });
  if (!exerciseCount) {
    const defaults = [
      { name: 'Push-ups', category: 'Strength', exp_reward: 40 },
      { name: 'Squats', category: 'Strength', exp_reward: 45 },
      { name: 'Pull-ups', category: 'Strength', exp_reward: 70 },
      { name: 'Plank', category: 'Core', exp_reward: 35 },
      { name: 'Running', category: 'Cardio', exp_reward: 60 },
      { name: 'Cycling', category: 'Cardio', exp_reward: 55 },
      { name: 'Jumping Jacks', category: 'Cardio', exp_reward: 30 },
      { name: 'Deadlift', category: 'Strength', exp_reward: 90 },
      { name: 'Bench Press', category: 'Strength', exp_reward: 85 },
      { name: 'Yoga Flow', category: 'Flexibility', exp_reward: 50 },
      { name: 'Meditation', category: 'Mobility', exp_reward: 25 },
      { name: 'Burpees', category: 'Cardio', exp_reward: 75 },
    ];
    await supabase.from('exercises').insert(defaults);
  }

  const { count: quoteCount } = await supabase
    .from('motivation_quotes')
    .select('*', { count: 'exact', head: true });
  if (!quoteCount) {
    const defaults = [
      { text: 'Rise up. The only one who can stop you is the version of you that quit yesterday.', author: 'Aether System' },
      { text: 'I alone level up.', author: 'Sung Jinwoo' },
      { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
      { text: 'The body achieves what the mind believes.', author: 'Napoleon Hill' },
      { text: 'Strength does not come from the body. It comes from the will.', author: 'Gandhi' },
      { text: 'Arise. Every rep is a step toward the throne.', author: 'Aether System' },
      { text: 'Pain is temporary. The level you earn is permanent.', author: 'Aether System' },
      { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
      { text: 'The dungeon waits. So do your limits.', author: 'Aether System' },
      { text: 'Sweat today, shine tomorrow.', author: 'Unknown' },
      { text: 'Become the hunter you were meant to be.', author: 'Aether System' },
      { text: 'Your only competition is who you were yesterday.', author: 'Unknown' },
    ];
    await supabase.from('motivation_quotes').insert(defaults);
  }

  void profile;
}
