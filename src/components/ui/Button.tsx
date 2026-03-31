'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center font-pixel leading-none transition-all duration-75 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-violet-600 text-white hover:bg-violet-500 shadow-[3px_3px_0px_#4c1d95] active:shadow-[1px_1px_0px_#4c1d95] border-2 border-violet-800',
      secondary:
        'bg-slate-700 text-slate-100 hover:bg-slate-600 shadow-[3px_3px_0px_#0f172a] active:shadow-[1px_1px_0px_#0f172a] border-2 border-slate-900',
      ghost:
        'bg-transparent text-slate-300 hover:text-white border-2 border-slate-600 hover:border-slate-400 shadow-none',
      danger:
        'bg-red-700 text-white hover:bg-red-600 shadow-[3px_3px_0px_#7f1d1d] active:shadow-[1px_1px_0px_#7f1d1d] border-2 border-red-900',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-[8px] px-2 py-1',
      md: 'text-[9px] px-3 py-2',
      lg: 'text-[10px] px-4 py-3',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(base, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
