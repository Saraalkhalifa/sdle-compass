import React from 'react';
import { cn } from '@/lib/utils';
import type { ButtonVariant, ColorVariant, SizeVariant } from '@/types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ColorVariant;
  size?: SizeVariant;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  solid:   'font-semibold shadow-sm',
  outline: 'border-2 bg-transparent font-semibold',
  ghost:   'bg-transparent font-medium',
  link:    'bg-transparent underline-offset-4 hover:underline p-0 h-auto font-medium',
};

const colorSolid: Record<string, string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-slate-600 text-white hover:bg-slate-700',
  success:   'bg-green-600 text-white hover:bg-green-700',
  warning:   'bg-amber-500 text-white hover:bg-amber-600',
  error:     'bg-red-600 text-white hover:bg-red-700',
  info:      'bg-cyan-600 text-white hover:bg-cyan-700',
  neutral:   'bg-slate-100 text-slate-700 hover:bg-slate-200',
};

const colorOutline: Record<string, string> = {
  primary:   'border-blue-600 text-blue-600 hover:bg-blue-50',
  secondary: 'border-slate-400 text-slate-600 hover:bg-slate-50',
  success:   'border-green-600 text-green-600 hover:bg-green-50',
  warning:   'border-amber-500 text-amber-600 hover:bg-amber-50',
  error:     'border-red-600 text-red-600 hover:bg-red-50',
  info:      'border-cyan-600 text-cyan-600 hover:bg-cyan-50',
  neutral:   'border-slate-300 text-slate-600 hover:bg-slate-50',
};

const colorGhost: Record<string, string> = {
  primary:   'text-blue-600 hover:bg-blue-50',
  secondary: 'text-slate-600 hover:bg-slate-100',
  success:   'text-green-600 hover:bg-green-50',
  warning:   'text-amber-600 hover:bg-amber-50',
  error:     'text-red-600 hover:bg-red-50',
  info:      'text-cyan-600 hover:bg-cyan-50',
  neutral:   'text-slate-500 hover:bg-slate-100',
};

const sizeStyles: Record<SizeVariant, string> = {
  xs: 'h-7  px-2.5 text-xs  gap-1',
  sm: 'h-8  px-3   text-sm  gap-1.5',
  md: 'h-9  px-4   text-sm  gap-2',
  lg: 'h-11 px-5   text-base gap-2',
  xl: 'h-12 px-6   text-base gap-2.5',
};

const Spinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export function Button({
  variant = 'solid',
  color = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const colorMap = variant === 'solid' ? colorSolid : variant === 'outline' ? colorOutline : colorGhost;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-150',
        'select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
        variantStyles[variant],
        colorMap[color] ?? colorMap.primary,
        sizeStyles[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children && <span>{children}</span>}
      {!loading && rightIcon}
    </button>
  );
}
