import React from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import {
  DefaultTheme,
  NavigationContainer,
  createNavigationContainerRef,
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
  BuddyCenterScreen,
  BlockedUsersScreen,
} from '../screens';
import { useAuth } from '../contexts';
import { Colors } from '../constants/theme';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Settings: undefined;
  TemplateSelection: undefined;
  CreatePlan: { templateId?: string; planId?: string } | undefined;
  PostMoment: undefined;
  Badges: undefined;
  CheckInRecords: undefined;
  MyCollections: undefined;
  Notifications: undefined;
  CircleDetail: { circleId: string };
  BuddyCenter: undefined;
  BlockedUsers: undefined;
};

export type MainTabParamList = {
  Plan: undefined;
  Calendar: undefined;
  Circles: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

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

  React.useEffect(() => {
    if (Platform.OS === 'web') return;
    let subscription: { remove: () => void } | undefined;
    try {
      const Notifications = require('expo-notifications');
      const openTarget = (response: any) => {
        const data = response?.notification?.request?.content?.data || {};
        const navigate = () => {
          if (!navigationRef.isReady()) return;
          if (data.planId) {
            navigationRef.navigate('CreatePlan', {
              planId: String(data.planId),
            });
          } else if (data.habitId) {
            (navigationRef as any).navigate('Main', { screen: 'Calendar' });
          }
        };
        setTimeout(navigate, 300);
      };
      subscription =
        Notifications.addNotificationResponseReceivedListener(openTarget);
      Notifications.getLastNotificationResponseAsync().then((response: any) => {
        if (response) openTarget(response);
      });
    } catch (error) {
      console.warn('[Notification] 无法注册通知点击处理:', error);
    }
    return () => subscription?.remove();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={DefaultTheme}>
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
        <Stack.Screen name="BuddyCenter" component={BuddyCenterScreen} />
        <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default AppNavigator;
