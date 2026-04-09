import { useState, useCallback } from 'react';
import type { Reminder } from '../types/domain';

export const useReminderState = (initialReminders: Reminder[] = []) => {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const addReminder = useCallback((reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders(prev => [...prev, newReminder]);
    return newReminder;
  }, []);

  const removeReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const openTimePicker = useCallback(() => {
    setShowTimePicker(true);
  }, []);

  const closeTimePicker = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  const handleTimeChange = useCallback((date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
  }, []);

  const confirmTime = useCallback(() => {
    const newReminder = addReminder({
      time: selectedTime,
      label: '每日',
      enabled: true,
    });
    closeTimePicker();
    return newReminder;
  }, [selectedTime, addReminder, closeTimePicker]);

  return {
    reminders,
    showTimePicker,
    selectedTime,
    addReminder,
    removeReminder,
    toggleReminder,
    updateReminder,
    openTimePicker,
    closeTimePicker,
    handleTimeChange,
    confirmTime,
  };
};
