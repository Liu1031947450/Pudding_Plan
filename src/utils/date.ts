export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value: string): Date =>
  new Date(`${value}T12:00:00`);

export const addLocalDays = (value: string, amount: number): string => {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + amount);
  return formatLocalDate(date);
};

export const isDateInCheckInWindow = (
  value: string,
  today = new Date(),
): boolean => {
  const current = parseLocalDate(formatLocalDate(today));
  const target = parseLocalDate(value);
  const difference = Math.round(
    (current.getTime() - target.getTime()) / 86400000,
  );
  return difference >= 0 && difference <= 6;
};
