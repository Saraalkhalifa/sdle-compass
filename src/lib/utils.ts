import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date for display. */
export function formatDate(date: string | Date, pattern = 'MMM d, yyyy') {
  return format(new Date(date), pattern);
}

/** Format a date as a relative time string ("2 days ago"). */
export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Clamp a number within a range. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Convert a percentage (0–100) to a tailwind width class. */
export function percentToWidth(pct: number): string {
  const clamped = clamp(Math.round(pct), 0, 100);
  return `${clamped}%`;
}

/** Truncate a string to a max length with ellipsis. */
export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
}

/** Generate initials from a full name (up to 2 characters). */
export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

/** Capitalise the first letter of a string. */
export function capitalise(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Debounce a function. */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/** Convert difficulty number (1–5) to a readable label. */
export function difficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Very Hard',
  };
  return labels[level] ?? 'Unknown';
}

/** Map a role string to a display label. */
export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    student: 'Student',
    editor: 'Content Editor',
    reviewer: 'Clinical Reviewer',
    admin: 'Administrator',
    main_admin: 'Main Administrator',
  };
  return map[role] ?? capitalise(role);
}
