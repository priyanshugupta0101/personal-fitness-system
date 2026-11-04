export interface Quote {
  text: string;
  author: string;
}

export const DEFAULT_QUOTES: Quote[] = [
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

export function quoteOfDay(date: Date = new Date()): Quote {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return DEFAULT_QUOTES[dayIndex % DEFAULT_QUOTES.length];
}

export function randomQuote(exclude?: Quote): Quote {
  let pick = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
  while (exclude && pick.text === exclude.text && DEFAULT_QUOTES.length > 1) {
    pick = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
  }
  return pick;
}
