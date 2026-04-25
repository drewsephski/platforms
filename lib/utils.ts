import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const protocol = 'https';
export const rootDomain = 'platforms.vercel.app';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSiteUrl(subdomain: string) {
  return `${protocol}://${rootDomain}/s/${subdomain}`;
}
