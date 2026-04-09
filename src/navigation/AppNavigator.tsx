import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  PlanScreen,
  CalendarScreen,
  CirclesScreen,
  ProfileScreen,
  SettingsScreen,
  CreatePlanScreen,
  PostMomentScreen,
} from '../screens';
import { Colors, FontSize } from '../constants/theme';

export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  CreatePlan: undefined;
  PostMoment: undefined;
};

export type MainTabParamList = {
  Plan: undefined;
  Calendar: undefined;
  Circles: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ icon: string; focused: boolean }> = ({
  icon,
  focused,
}) => (
  <Text
    style={[
      styles.tabIcon,
      { color: focused ? Colors.primary : Colors.onSurfaceVariant },
    ]}
  >
    {icon}
  </Text>
);

const PlanIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={'\uE8FF'} focused={focused} />
);
const CalendarIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={'\uE935'} focused={focused} />
);
const CirclesIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={'\uE7EF'} focused={focused} />
);
const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={'\uE7FD'} focused={focused} />
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
      initialRouteName="Plan"
    >
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: PlanIcon,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: CalendarIcon,
        }}
      />
      <Tab.Screen
        name="Circles"
        component={CirclesScreen}
        options={{
          tabBarLabel: 'Circles',
          tabBarIcon: CirclesIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="CreatePlan"
          component={CreatePlanScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="PostMoment"
          component={PostMomentScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: 'rgba(250, 249, 248, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: -4,
  },
});

export default AppNavigator;
