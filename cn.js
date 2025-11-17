import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário para merge de classes CSS do Tailwind
 * Combina clsx e tailwind-merge para resolver conflitos de classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
