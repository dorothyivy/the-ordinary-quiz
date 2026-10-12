import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Encode data to base64 using btoa (browser-safe, no Buffer)
 */
export function encodeResults(data: object): string {
  const jsonString = JSON.stringify(data);
  // Use btoa for browser/edge compatibility (no Buffer)
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(jsonString)));
  }
  // Server-side fallback using btoa global (available in Node 16+)
  return btoa(unescape(encodeURIComponent(jsonString)));
}

/**
 * Decode base64 data using atob (browser-safe, no Buffer)
 */
export function decodeResults<T>(encoded: string): T | null {
  try {
    const jsonString = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Format price as USD
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Calculate total routine cost
 */
export function calculateTotalCost(prices: number[]): number {
  return prices.reduce((sum, p) => sum + p, 0);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a shareable URL for results
 */
export function generateShareUrl(baseUrl: string, encodedData: string): string {
  return `${baseUrl}/results?data=${encodeURIComponent(encodedData)}&v=1`;
}
