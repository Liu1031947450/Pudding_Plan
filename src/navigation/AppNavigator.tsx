import React from 'react';
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
  TemplateSelectionScreen,
} from '../screens';

export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  TemplateSelection: undefined;
  CreatePlan: { templateId?: string } | undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
