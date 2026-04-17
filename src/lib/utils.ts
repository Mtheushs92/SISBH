import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert minutes to HH:MM format (e.g. 90 -> 01:30)
export function formatMinutesToHHMM(totalMinutes: number, showSign = false): string {
  const sign = totalMinutes < 0 ? "-" : (showSign && totalMinutes > 0 ? "+" : "");
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Parse HH:MM string to minutes (e.g. 01:30 -> 90)
export function parseHHMMToMinutes(hhmm: string): number {
  if (!hhmm) return 0;
  const [hoursStr, minutesStr] = hhmm.split(':');
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  return (hours * 60) + minutes;
}
