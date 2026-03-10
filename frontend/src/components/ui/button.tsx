import React from 'react';
import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(0,128,128,0.3)] hover:shadow-[0_0_30px_rgba(0,128,128,0.5)]',
  secondary: 'bg-secondary text-white hover:bg-secondary/90',
  outline: 'border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/5',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-bold rounded-xl transition-all duration-200 active:scale-[0.99] transform',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
