export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
