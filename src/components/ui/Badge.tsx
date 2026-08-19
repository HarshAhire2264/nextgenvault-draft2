import type { ReactNode } from 'react';

type Tone = 'neutral' | 'brand' | 'accent' | 'warning' | 'danger' | 'success';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-100 text-brand-800',
  accent: 'bg-accent-100 text-accent-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  success: 'bg-accent-100 text-accent-800',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
