// Utility to merge class names (clsx + twMerge) and humanize strings
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge CSS class names using clsx and tailwind-merge
 * @param  {...any} inputs
 * @returns {string}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Humanize camelCase or snake_case strings into readable text
 * @param {string} str
 * @returns {string}
 */
export function humanize(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → camel Case
    .replace(/[_-]/g, ' ') // snake_case or kebab-case → snake case
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
