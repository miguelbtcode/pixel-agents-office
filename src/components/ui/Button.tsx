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
      'relative inline-flex items-center justify-center font-pixel leading-none transition-all duration-75 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'text-white shadow-[2px_2px_0px_#0a0a14] active:shadow-[1px_1px_0px_#0a0a14]',
      secondary:
        'text-[var(--color-text)] shadow-[2px_2px_0px_#0a0a14] active:shadow-[1px_1px_0px_#0a0a14]',
      ghost:
        'bg-transparent text-[var(--color-text-muted)] shadow-none',
      danger:
        'bg-[#7f1d1d] text-white shadow-[2px_2px_0px_#0a0a14] active:shadow-[1px_1px_0px_#0a0a14] border-2 border-[#991b1b]',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-[8px] px-2 py-1',
      md: 'text-[9px] px-3 py-2',
      lg: 'text-[10px] px-4 py-3',
    };

    // Inline styles for CSS variable colors
    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-accent)',
        border: '2px solid #4a6cdf',
      },
      secondary: {
        backgroundColor: 'var(--color-surface-2)',
        border: '2px solid var(--color-border)',
      },
      ghost: {
        border: '2px solid var(--color-border)',
      },
      danger: {},
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(base, variants[variant], sizes[size], className))}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
