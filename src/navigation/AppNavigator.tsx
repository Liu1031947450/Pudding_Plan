import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
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
  TemplateSelectionScreen,
  AuthScreen,
  CheckInHistoryScreen,
  AllBadgesScreen,
  MyCollectionsScreen,
  NotificationsScreen,
  CircleDetailScreen,
} from '../screens';
import { useAppSettings, useAuth } from '../contexts';
import { Colors } from '../constants/theme';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Settings: undefined;
  TemplateSelection: undefined;
  CreatePlan: { templateId?: string } | undefined;
  PostMoment: undefined;
  Badges: undefined;
  CheckInRecords: undefined;
  MyCollections: undefined;
  Notifications: undefined;
  CircleDetail: { circleId: string };
};

export type MainTabParamList = {
  Plan: undefined;
  Calendar: undefined;
  Circles: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
      initialRouteName="Calendar"
    >
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="Circles" component={CirclesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isDark } = useAppSettings();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={user ? 'Main' : 'Auth'}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="TemplateSelection"
          component={TemplateSelectionScreen}
          options={{
            presentation: 'modal',
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
        <Stack.Screen
          name="Badges"
          component={AllBadgesScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="CheckInRecords"
          component={CheckInHistoryScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="MyCollections"
          component={MyCollectionsScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="CircleDetail"
          component={CircleDetailScreen}
          options={{
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
