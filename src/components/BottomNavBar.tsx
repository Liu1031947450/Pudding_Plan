import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  routeName: string;
}

export const BottomNavBar: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const items: NavItem[] = [
    { key: 'plan', label: '计划', icon: 'edit-note', routeName: 'Plan' },
    { key: 'calendar', label: '日历', icon: 'calendar-today', routeName: 'Calendar' },
    { key: 'circles', label: '圈子', icon: 'group', routeName: 'Circles' },
    { key: 'profile', label: '我的', icon: 'person', routeName: 'Profile' },
  ];

  const handleTabPress = (routeName: string) => {
    navigation.navigate(routeName as never);
  };

  return (
    <BlurView intensity={20} tint="light" style={styles.container}>
      <View style={styles.content}>
        <View style={styles.navContainer}>
          {items.map((item) => {
            const isActive = route.name === item.routeName;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.navItem, isActive && styles.activeNavItem]}
                onPress={() => handleTabPress(item.routeName)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={isActive ? Colors.primary : Colors.onSurfaceVariant}
                />
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
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 10,
  },
  content: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(250, 249, 248, 0.7)',
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
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  activeLabel: {
    fontWeight: '600',
  },
});
