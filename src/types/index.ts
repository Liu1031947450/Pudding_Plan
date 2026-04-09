// Re-export all types from domain, ui, and navigation modules
export * from './domain';
export * from './ui';
export * from './navigation';

// Keep existing types
// Re-export all types from domain, ui, and navigation modules
export * from './domain';
export * from './ui';
export * from './navigation';

// Keep existing types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
