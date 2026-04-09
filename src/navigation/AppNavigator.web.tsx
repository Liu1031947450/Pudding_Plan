import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import {
  PlanScreen,
  CalendarScreen,
  CirclesScreen,
  ProfileScreen,
} from '../screens';
import { Colors, FontSize, Spacing } from '../constants/theme';

// Web版底部导航组件
const WebBottomNav: React.FC<{
  currentRoute: string;
  onNavigate: (route: string) => void;
}> = ({ currentRoute, onNavigate }) => {
  const tabs = [
    { key: 'Plan', label: 'Plan', icon: '✏️' },
    { key: 'Calendar', label: 'Calendar', icon: '📅' },
    { key: 'Circles', label: 'Circles', icon: '👥' },
    { key: 'Profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.key;
        return (
          <View
            key={tab.key}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            // @ts-ignore
            onClick={() => onNavigate(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? Colors.primary : Colors.onSurfaceVariant },
              ]}
            >
              {tab.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Web版主布局
const WebMainLayout: React.FC = () => {
  const [currentScreen, setCurrentScreen] = React.useState('Plan');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Plan':
        return <PlanScreen />;
      case 'Calendar':
        return <CalendarScreen />;
      case 'Circles':
        return <CirclesScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <PlanScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <WebBottomNav
        currentRoute={currentScreen}
        onNavigate={setCurrentScreen}
      />
    </View>
  );
};

const AppNavigator: React.FC = () => {
  return <WebMainLayout />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: 'rgba(250, 249, 248, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    boxShadow: '0 -4px 20px rgba(116, 92, 0, 0.08)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 16,
    cursor: 'pointer',
  },
  tabItemActive: {
    backgroundColor: '#f9d461',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

export default AppNavigator;
