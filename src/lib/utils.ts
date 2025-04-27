import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names efficiently, merging Tailwind classes properly
 * Uses clsx for conditional class joining and tailwind-merge to handle conflicting classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 