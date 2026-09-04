import { API_CONFIG } from '../api/config';

export const getImageUrl = (path?: string) => {
  if (!path) return undefined;
  if (/^(https?:|blob:|data:|file:)/.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_CONFIG.SERVER_URL}/${cleanPath}`;
};

export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date | string): string => {
  if (typeof date === 'string') {
    return date;
  }
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export * from './planUtils';
export * from './date';
