import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-600/30 shadow-sm',
  secondary: 'bg-ink-100 text-ink-800 hover:bg-ink-200 focus:ring-ink-400/30',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 focus:ring-ink-400/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30 shadow-sm',
  success: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500/30 shadow-sm',
  outline: 'border border-ink-300 bg-white text-ink-700 hover:bg-ink-50 hover:border-ink-400 focus:ring-ink-400/20',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
