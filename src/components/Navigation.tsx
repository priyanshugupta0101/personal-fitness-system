import { useState, useEffect } from 'react';
import { Home, Swords, Apple, Droplets, Moon, Camera, Trophy, Settings, HeartPulse, Menu, X } from 'lucide-react';

export type TabKey =
  | 'home'
  | 'quests'
  | 'diet'
  | 'water'
  | 'sleep'
  | 'recovery'
  | 'photos'
  | 'badges'
  | 'settings';

interface NavItem {
  key: TabKey;
  label: string;
  icon: typeof Home;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'quests', label: 'Quests', icon: Swords },
  { key: 'diet', label: 'Diet', icon: Apple },
  { key: 'water', label: 'Water', icon: Droplets },
  { key: 'sleep', label: 'Sleep', icon: Moon },
  { key: 'recovery', label: 'Recovery', icon: HeartPulse },
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'badges', label: 'Badges', icon: Trophy },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const PRIMARY_KEYS: TabKey[] = ['home', 'quests', 'diet', 'water'];

interface SidebarProps {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 p-4 dark:border-white/10 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-solo-600 text-white shadow-glow">
          <Swords size={18} />
        </div>
        <div>
          <p className="font-display text-lg font-black leading-none tracking-wide">AETHER</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Solo System</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-solo-600 text-white shadow-glow'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

interface BottomNavProps {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      const handler = () => setMenuOpen(false);
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }
  }, [menuOpen]);

  const primaryItems = NAV_ITEMS.filter((i) => PRIMARY_KEYS.includes(i.key));
  const allItems = NAV_ITEMS;
  const activeInMenu = !PRIMARY_KEYS.includes(active);

  const handleMenuNav = (k: TabKey) => {
    onChange(k);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-slate-200 bg-white/90 px-1 py-1.5 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 lg:hidden">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition ${
                isActive ? 'text-solo-600 dark:text-solo-400' : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}

        {/* Menu button — opens the full list */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition ${
            menuOpen || activeInMenu ? 'text-solo-600 dark:text-solo-400' : 'text-slate-400'
          }`}
          aria-label="More features"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
          More
        </button>
      </nav>

      {/* Expanded menu panel — slides up above the bar */}
      {menuOpen && (
        <div
          className="fixed bottom-[52px] left-1/2 z-50 w-[calc(100%-1rem)] max-w-sm -translate-x-1/2 animate-rise lg:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-glass rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl dark:border-white/10 dark:bg-slate-900/95">
            <p className="quest-rune mb-3 px-1 text-xs text-slate-500">All Features</p>
            <div className="grid grid-cols-3 gap-2">
              {allItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleMenuNav(item.key)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-[11px] font-medium transition ${
                      isActive
                        ? 'bg-solo-600 text-white shadow-glow'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon size={22} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
