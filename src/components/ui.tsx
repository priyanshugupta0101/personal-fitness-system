import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div
      className={`card-glass rounded-2xl p-4 transition-all duration-300 ${
        glow ? 'shadow-glow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
}

export function SectionTitle({ children, icon, right }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display flex items-center gap-2 text-lg font-bold uppercase tracking-widest">
        {icon}
        {children}
      </h2>
      {right}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'mana' | 'ember';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  type = 'button',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const variants = {
    primary:
      'bg-solo-600 text-white hover:bg-solo-500 shadow-glow dark:text-white',
    mana: 'bg-mana-500 text-white hover:bg-mana-400 shadow-glow-mana',
    ember: 'bg-ember-500 text-white hover:bg-ember-400 shadow-glow-ember',
    ghost:
      'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  variant?: 'exp' | 'water' | 'sleep' | 'default';
  showValue?: boolean;
}

export function ProgressBar({
  value,
  max,
  label,
  variant = 'default',
  showValue = false,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const fills = {
    exp: 'exp-bar-fill',
    water: 'bg-mana-500',
    sleep: 'bg-violet-500',
    default: 'bg-solo-500',
  };
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{label}</span>
          {showValue && (
            <span>
              {Math.round(value)} / {max}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${fills[variant]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card-glass relative z-10 w-full max-w-md rounded-2xl p-5 animate-rise">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold uppercase tracking-widest">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/60 dark:hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface InputProps {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  className?: string;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  className = '',
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-solo-500 focus:ring-2 focus:ring-solo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
}

export function Select({ value, onChange, options, label, className = '' }: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-solo-500 focus:ring-2 focus:ring-solo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <h3 className="font-display text-base font-bold uppercase tracking-wide">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
