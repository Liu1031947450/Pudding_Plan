// UI Component Variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

export type ChipVariant = 'filled' | 'outlined' | 'elevated';
export type ChipSize = 'small' | 'medium' | 'large';

// Common UI Props
export interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export interface PressableProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
