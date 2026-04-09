import { MaterialIcons } from '@expo/vector-icons';

// Plan related types
export interface Plan {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  days: number;
  totalDays: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

export interface Reminder {
  id: string;
  time: Date;
  label: string;
  enabled: boolean;
}

// Badge and Achievement types
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  unlocked: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'social' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Rhythm data for charts
export interface RhythmData {
  date: string;
  value: number;
  label?: string;
}

// Circle and Social types
export interface Buddy {
  id: string;
  name: string;
  goal: string;
  avatarUri?: string;
}

export interface Circle {
  id: string;
  title: string;
  members: string;
  type: 'large' | 'small' | 'medium';
  imageUri?: string;
  category?: string;
}

// Calendar types
export interface DayData {
  day: number;
  hasActivity: boolean;
  isToday: boolean;
  isSelected: boolean;
  activityType?: 'primary' | 'secondary' | 'tertiary';
}

export interface Habit {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  completed: boolean;
  category: string;
}

// Template types
export interface Template {
  id: string;
  title: string;
  duration: number;
  icon: string;
  color: string;
  category?: string;
}

export interface TemplateDetail extends Template {
  subtitle: string;
  description: string;
  goals: string[];
  checkpoints: {
    day: number;
    title: string;
    description: string;
  }[];
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: string;
}
