import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getNeonColorForMatchType(matchType: string): string {
  switch (matchType) {
    case 'teamVsTeam':
      return 'text-neon-blue';
    case 'dominationDeathmatch':
      return 'text-neon-pink';
    default:
      return 'text-neon-blue';
  }
}

export function getNeonBorderForMatchType(matchType: string): string {
  switch (matchType) {
    case 'teamVsTeam':
      return 'neon-border';
    case 'dominationDeathmatch':
      return 'neon-border-pink';
    default:
      return 'neon-border';
  }
}

export function getReadableDateFromTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}
