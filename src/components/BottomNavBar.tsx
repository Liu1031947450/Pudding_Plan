import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  isActive?: boolean;
}

interface BottomNavBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}

const icons: Record<string, string> = {
  edit_note: '\uE8FF',
  calendar_today: '\uE935',
  group: '\uE7EF',
  person: '\uE7FD',
  local_florist: '\uE313',
  auto_awesome: '\uE885',
  self_improvement: '\uEAF4',
  spa: '\uE3E3',
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabPress }) => {
  const items: NavItem[] = [
    { key: 'plan', label: 'Plan', icon: 'edit_note' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar_today' },
    { key: 'circles', label: 'Circles', icon: 'group' },
    { key: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => onTabPress(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.icon,
                  { color: isActive ? Colors.primary : Colors.onSurfaceVariant },
                ]}
              >
                {icons[item.icon]}
              </Text>
              <Text
                style={[
                  styles.label,
                  { color: isActive ? Colors.primary : Colors.onSurfaceVariant },
                  isActive && styles.activeLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(250, 249, 248, 0.95)',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 10,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  activeNavItem: {
    backgroundColor: Colors.primaryContainer,
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  activeLabel: {
    fontWeight: '600',
  },
});
